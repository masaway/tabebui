import os
from typing import Optional, List, Literal, Dict
from datetime import datetime
from pathlib import Path as FilePath

import pymysql
from fastapi import FastAPI, Query, Path, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


def get_env(name: str, default: Optional[str] = None) -> str:
    value = os.getenv(name, default)
    if value is None:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "app")
DB_PASSWORD = os.getenv("DB_PASSWORD", "app")
DB_NAME = os.getenv("DB_NAME", "tabebui")

app = FastAPI(title="たべぶい API")


# Pydantic models
class AnimalPart(BaseModel):
    id: int
    animal_type: str
    part_category: str
    part_name: str
    part_name_jp: str
    description: Optional[str]
    difficulty_level: int


class EatingRecordRequest(BaseModel):
    animal_part_ids: List[int]
    restaurant_name: Optional[str] = None
    eaten_at: Optional[datetime] = None
    memo: Optional[str] = None
    rating: Optional[int] = None
    photo_url: Optional[str] = None


class EatingSessionResponse(BaseModel):
    id: int
    user_id: int
    restaurant_name: Optional[str]
    eaten_at: Optional[datetime]
    memo: Optional[str]
    rating: Optional[int]
    photo_url: Optional[str]
    created_at: datetime
    updated_at: datetime


class EatingRecordResponse(BaseModel):
    id: int
    animal_part_id: int
    session_id: int
    eaten_at: datetime
    created_at: datetime


DEFAULT_CONCIERGE_PROMPT = (
    """あなたは『たべぶい』アプリの食べ歩きコンシェルジュです。
- 牛・豚・鶏それぞれの部位制覇を支援し、ユーザーの好みや進捗に合わせて案内します。
- 会話は親しみやすく丁寧な日本語で、2〜4文程度の簡潔な回答にまとめてください。
- 可能であればおすすめ部位の特徴、食べ方、提供しそうな飲食店情報やキャンペーンなども触れてください。
- アプリ独自の制覇率や未制覇リストを意識し、達成感が得られる提案や次の一歩を提示してください。
    """
)

_CHAT_HISTORY_FALLBACK = 12
try:
    MAX_CHAT_HISTORY = int(os.getenv('CHAT_HISTORY_LIMIT', str(_CHAT_HISTORY_FALLBACK)))
except ValueError:
    MAX_CHAT_HISTORY = _CHAT_HISTORY_FALLBACK

GEMINI_MODEL_NAME = os.getenv('GEMINI_MODEL_NAME', 'gemini-1.5-flash')


ENV_FALLBACK_KEY = 'gemini-api-key'
_RESOLVED_PATH = FilePath(__file__).resolve()
ENV_FALLBACK_PATHS = []
for depth in (0, 1, 2, 3):
    try:
        parent = _RESOLVED_PATH.parents[depth]
    except IndexError:
        continue
    candidate = parent / '.env'
    if candidate not in ENV_FALLBACK_PATHS:
        ENV_FALLBACK_PATHS.append(candidate)


ANIMAL_LABELS: Dict[str, str] = {
    "beef": "🐄 牛",
    "pork": "🐷 豚",
    "chicken": "🐔 鶏",
}


def load_gemini_api_key() -> Optional[str]:
    """環境変数またはsrc/.envのgemini-api-keyからAPIキーを取得"""
    env_value = os.getenv('GEMINI_API_KEY')
    if env_value:
        return env_value

    try:
        for env_path in ENV_FALLBACK_PATHS:
            if not env_path.is_file():
                continue
            for raw_line in env_path.read_text(encoding='utf-8').splitlines():
                line = raw_line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                key, value = line.split('=', 1)
                if key.strip().lower() == ENV_FALLBACK_KEY:
                    return value.strip() or None
    except Exception:
        # 読み込み失敗時は環境変数優先のため無視
        pass


    return None


def build_concierge_context(user_id: int = 1) -> Optional[str]:
    """ユーザーの制覇状況などをGeminiへの文脈として整形"""
    try:
        conn = get_db_connection()
    except Exception:
        return None

    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT animal_type, COUNT(*) AS total
                FROM animal_parts
                GROUP BY animal_type
                """
            )
            totals = {row["animal_type"]: row["total"] for row in cur.fetchall()}

            cur.execute(
                """
                SELECT ap.animal_type, COUNT(DISTINCT ap.id) AS eaten
                FROM eating_records er
                JOIN animal_parts ap ON ap.id = er.animal_part_id
                WHERE er.user_id = %s
                GROUP BY ap.animal_type
                """,
                (user_id,)
            )
            eaten = {row["animal_type"]: row["eaten"] for row in cur.fetchall()}

            cur.execute(
                """
                SELECT restaurant_name, eaten_at
                FROM eating_sessions
                WHERE user_id = %s
                ORDER BY eaten_at DESC, created_at DESC
                LIMIT 1
                """,
                (user_id,),
            )
            recent_session = cur.fetchone()

            cur.execute(
                """
                SELECT ap.part_name_jp, ap.animal_type
                FROM animal_parts ap
                LEFT JOIN eating_records er
                    ON er.animal_part_id = ap.id AND er.user_id = %s
                WHERE er.id IS NULL
                ORDER BY ap.difficulty_level DESC, ap.id
                LIMIT 5
                """,
                (user_id,),
            )
            missing_parts = cur.fetchall()
    except Exception:
        return None
    finally:
        conn.close()

    if not totals:
        return None

    progress_lines = []
    for animal_type, total in totals.items():
        label = ANIMAL_LABELS.get(animal_type, animal_type)
        eaten_count = eaten.get(animal_type, 0)
        completion = 0
        if total:
            completion = int(round((eaten_count / total) * 100))
        remaining = total - eaten_count
        progress_lines.append(
            f"{label}: {eaten_count}/{total} (制覇率 {completion}%・残り {max(remaining, 0)} 部位)"
        )

    context_lines = []
    if progress_lines:
        context_lines.append("【現在の制覇状況】")
        context_lines.extend(progress_lines)

    if missing_parts:
        context_lines.append("【未制覇で提案したい部位候補】")
        for row in missing_parts:
            label = ANIMAL_LABELS.get(row["animal_type"], row["animal_type"])
            context_lines.append(f"- {label}: {row['part_name_jp']}")

    if recent_session:
        restaurant = recent_session.get("restaurant_name") or "不明な店舗"
        eaten_at = recent_session.get("eaten_at")
        date_label = eaten_at.strftime("%Y-%m-%d") if eaten_at else "訪問日不明"
        context_lines.append("【最近の食事】")
        context_lines.append(f"- {date_label} に {restaurant} を訪問")

    return "\n".join(context_lines) if context_lines else None


class ChatMessage(BaseModel):
    role: Literal['user', 'assistant']
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    system_prompt: Optional[str] = None



# CORS (dev): allow Vite dev server origin
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Hello from FastAPI"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/db-version")
def db_version():
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            connect_timeout=3,
        )
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT VERSION()")
                version = cur.fetchone()[0]
        finally:
            conn.close()
        return {"connected": True, "version": version}
    except Exception as e:
        return {"connected": False, "error": str(e)}


def get_db_connection():
    """データベース接続を取得"""
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        connect_timeout=3,
        cursorclass=pymysql.cursors.DictCursor
    )



def call_gemini_api(
    message: str,
    history: List[ChatMessage],
    system_prompt: Optional[str] = None,
    extra_context: Optional[str] = None,
):
    """Gemini APIを呼び出して応答を生成"""
    api_key = load_gemini_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

    try:
        import google.generativeai as genai
    except ImportError as exc:
        raise HTTPException(
            status_code=500,
            detail="google-generativeai package is not installed on the server."
        ) from exc

    prompt = system_prompt or DEFAULT_CONCIERGE_PROMPT
    if extra_context:
        prompt = f"{prompt}\n\n### ユーザーコンテキスト\n{extra_context}"

    genai.configure(api_key=api_key)

    model = genai.GenerativeModel(GEMINI_MODEL_NAME, system_instruction=prompt)

    sanitized_history = [msg for msg in history if msg.role in {"user", "assistant"}]
    trimmed_history = sanitized_history[-MAX_CHAT_HISTORY:] if MAX_CHAT_HISTORY > 0 else sanitized_history

    contents = []
    for past in trimmed_history:
        role = "user" if past.role == "user" else "model"
        contents.append({"role": role, "parts": [{"text": past.content}]})
    contents.append({"role": "user", "parts": [{"text": message}]})

    try:
        response = model.generate_content(contents)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {exc}") from exc

    text = getattr(response, "text", None)
    if not text and getattr(response, "candidates", None):
        for candidate in response.candidates:
            candidate_content = getattr(candidate, "content", None)
            if not candidate_content:
                continue
            parts = getattr(candidate_content, "parts", None)
            if not parts:
                continue
            for part in parts:
                part_text = getattr(part, "text", None)
                if part_text:
                    text = part_text
                    break
            if text:
                break

    if not text:
        raise HTTPException(status_code=500, detail="Gemini API returned no content.")

    usage = getattr(response, "usage_metadata", None)
    return text.strip(), trimmed_history, usage


@app.post("/api/chat/message", response_model=dict)
def post_chat_message(request: ChatRequest):
    """Geminiを利用したチャット応答を生成"""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="message must not be empty.")

    concierge_context = build_concierge_context(user_id=1)

    reply, trimmed_history, usage = call_gemini_api(
        message=request.message,
        history=request.history,
        system_prompt=request.system_prompt,
        extra_context=concierge_context,
    )

    updated_history = [msg.dict() for msg in trimmed_history]
    latest_user = updated_history[-1] if updated_history else None
    if not (
        latest_user
        and latest_user.get("role") == "user"
        and latest_user.get("content") == request.message
    ):
        updated_history.append({"role": "user", "content": request.message})

    updated_history.append({"role": "assistant", "content": reply})

    data = {
        "reply": reply,
        "model": GEMINI_MODEL_NAME,
        "history": updated_history,
    }

    if usage:
        data["usage"] = {
            "prompt_tokens": getattr(usage, "prompt_token_count", None),
            "candidates_tokens": getattr(usage, "candidates_token_count", None),
            "total_tokens": getattr(usage, "total_token_count", None),
        }

    return {
        "success": True,
        "data": data,
    }


@app.get("/api/animal-parts", response_model=dict)
def get_animal_parts(
    animal_type: Optional[str] = Query(None, regex="^(beef|pork|chicken)$"),
    part_category: Optional[str] = Query(None, regex="^(meat|organ)$")
):
    """部位マスターデータを取得"""
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                query = "SELECT id, animal_type, part_category, part_name, part_name_jp, description, difficulty_level FROM animal_parts WHERE 1=1"
                params = []

                if animal_type:
                    query += " AND animal_type = %s"
                    params.append(animal_type)

                if part_category:
                    query += " AND part_category = %s"
                    params.append(part_category)

                query += " ORDER BY animal_type, part_category, difficulty_level, id"

                cur.execute(query, params)
                results = cur.fetchall()

                return {
                    "success": True,
                    "data": results
                }
        finally:
            conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/animal-parts/{animal_type}", response_model=dict)
def get_animal_parts_by_type(
    animal_type: str = Path(..., regex="^(beef|pork|chicken)$"),
    part_category: Optional[str] = Query(None, regex="^(meat|organ)$")
):
    """動物別の部位一覧を取得"""
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                query = "SELECT id, animal_type, part_category, part_name, part_name_jp, description, difficulty_level FROM animal_parts WHERE animal_type = %s"
                params = [animal_type]

                if part_category:
                    query += " AND part_category = %s"
                    params.append(part_category)

                query += " ORDER BY part_category, difficulty_level, id"

                cur.execute(query, params)
                results = cur.fetchall()

                return {
                    "success": True,
                    "data": results
                }
        finally:
            conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")




@app.post("/api/eating-records", response_model=dict)
def create_eating_records(record_request: EatingRecordRequest):
    """複数の部位を一度にセッションとして記録"""
    if not record_request.animal_part_ids:
        raise HTTPException(status_code=400, detail="部位IDが指定されていません")

    try:
        conn = get_db_connection()
        session_id = None
        created_records = []

        try:
            with conn.cursor() as cur:
                # 部位IDの存在確認
                placeholders = ",".join(["%s"] * len(record_request.animal_part_ids))
                cur.execute(f"SELECT id FROM animal_parts WHERE id IN ({placeholders})", record_request.animal_part_ids)
                existing_parts = [row["id"] for row in cur.fetchall()]

                invalid_ids = set(record_request.animal_part_ids) - set(existing_parts)
                if invalid_ids:
                    raise HTTPException(status_code=400, detail=f"存在しない部位ID: {list(invalid_ids)}")

                # 仮のユーザーID（本来は認証から取得）
                user_id = 1
                eaten_at = record_request.eaten_at or datetime.now()

                # 食事セッションを作成
                session_insert_query = """
                INSERT INTO eating_sessions (
                    user_id, restaurant_name, eaten_at, memo, rating, photo_url
                ) VALUES (%s, %s, %s, %s, %s, %s)
                """

                cur.execute(session_insert_query, (
                    user_id,
                    record_request.restaurant_name,
                    eaten_at,
                    record_request.memo,
                    record_request.rating,
                    record_request.photo_url
                ))

                session_id = cur.lastrowid

                # 各部位に対して記録を作成
                for part_id in record_request.animal_part_ids:
                    record_insert_query = """
                    INSERT INTO eating_records (
                        user_id, animal_part_id, session_id, eaten_at
                    ) VALUES (%s, %s, %s, %s)
                    """

                    cur.execute(record_insert_query, (
                        user_id,
                        part_id,
                        session_id,
                        eaten_at
                    ))

                    record_id = cur.lastrowid
                    created_records.append({
                        "id": record_id,
                        "animal_part_id": part_id,
                        "session_id": session_id,
                        "eaten_at": eaten_at.isoformat(),
                        "created_at": datetime.now().isoformat()
                    })

                conn.commit()

                return {
                    "success": True,
                    "data": {
                        "session_id": session_id,
                        "records": created_records
                    }
                }

        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/eating-sessions", response_model=dict)
def get_eating_sessions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """食事セッション一覧を取得"""
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 仮のユーザーID（本来は認証から取得）
                user_id = 1

                offset = (page - 1) * per_page

                # セッション一覧を取得
                sessions_query = """
                SELECT es.*,
                       COUNT(er.id) as parts_count,
                       GROUP_CONCAT(ap.part_name_jp ORDER BY ap.part_name_jp) as parts_list
                FROM eating_sessions es
                LEFT JOIN eating_records er ON es.id = er.session_id
                LEFT JOIN animal_parts ap ON er.animal_part_id = ap.id
                WHERE es.user_id = %s
                GROUP BY es.id
                ORDER BY es.eaten_at DESC, es.created_at DESC
                LIMIT %s OFFSET %s
                """

                cur.execute(sessions_query, (user_id, per_page, offset))
                sessions = cur.fetchall()

                # 総件数を取得
                count_query = "SELECT COUNT(*) as total FROM eating_sessions WHERE user_id = %s"
                cur.execute(count_query, (user_id,))
                total = cur.fetchone()["total"]

                return {
                    "success": True,
                    "data": sessions,
                    "pagination": {
                        "page": page,
                        "per_page": per_page,
                        "total": total,
                        "total_pages": (total + per_page - 1) // per_page
                    }
                }

        finally:
            conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/eating-sessions/{session_id}", response_model=dict)
def get_eating_session_detail(session_id: int):
    """特定の食事セッションの詳細を取得"""
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 仮のユーザーID（本来は認証から取得）
                user_id = 1

                # セッション詳細を取得
                session_query = """
                SELECT * FROM eating_sessions
                WHERE id = %s AND user_id = %s
                """
                cur.execute(session_query, (session_id, user_id))
                session = cur.fetchone()

                if not session:
                    raise HTTPException(status_code=404, detail="セッションが見つかりません")

                # セッションに含まれる部位記録を取得
                records_query = """
                SELECT er.*, ap.animal_type, ap.part_category, ap.part_name, ap.part_name_jp, ap.description
                FROM eating_records er
                JOIN animal_parts ap ON er.animal_part_id = ap.id
                WHERE er.session_id = %s
                ORDER BY ap.animal_type, ap.part_category, ap.part_name_jp
                """
                cur.execute(records_query, (session_id,))
                records = cur.fetchall()

                return {
                    "success": True,
                    "data": {
                        "session": session,
                        "records": records
                    }
                }

        finally:
            conn.close()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/user-progress", response_model=dict)
def get_user_progress(user_id: int = Query(1)):
    """ユーザーの部位制覇状況を取得"""
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 全部位情報を取得
                all_parts_query = """
                SELECT id, animal_type, part_category, part_name, part_name_jp, description, difficulty_level
                FROM animal_parts
                ORDER BY animal_type, part_category, difficulty_level, id
                """
                cur.execute(all_parts_query)
                all_parts = cur.fetchall()

                # ユーザーが制覇済みの部位を取得
                conquered_query = """
                SELECT
                    ap.id,
                    ap.animal_type,
                    ap.part_category,
                    ap.part_name,
                    ap.part_name_jp,
                    ap.description,
                    ap.difficulty_level,
                    MIN(er.eaten_at) as first_conquered_date,
                    MAX(er.eaten_at) as last_eaten_date,
                    COUNT(er.id) as eat_count
                FROM animal_parts ap
                JOIN eating_records er ON ap.id = er.animal_part_id
                WHERE er.user_id = %s
                GROUP BY ap.id, ap.animal_type, ap.part_category, ap.part_name, ap.part_name_jp, ap.description, ap.difficulty_level
                ORDER BY ap.animal_type, ap.part_category, ap.difficulty_level, ap.id
                """
                cur.execute(conquered_query, (user_id,))
                conquered_parts = cur.fetchall()

                # 制覇済み部位のIDセットを作成
                conquered_ids = {part['id'] for part in conquered_parts}

                # 結果をマージして整理
                progress_data = {}
                for animal_type in ['beef', 'pork', 'chicken']:
                    progress_data[animal_type] = {
                        'meat': {'conquered': [], 'unconquered': []},
                        'organ': {'conquered': [], 'unconquered': []}
                    }

                # 全部位を分類
                for part in all_parts:
                    animal_type = part['animal_type']
                    part_category = part['part_category']

                    if part['id'] in conquered_ids:
                        # 制覇済み部位に制覇情報を追加
                        conquered_part = next(cp for cp in conquered_parts if cp['id'] == part['id'])
                        part_with_progress = {**part, **conquered_part}
                        progress_data[animal_type][part_category]['conquered'].append(part_with_progress)
                    else:
                        progress_data[animal_type][part_category]['unconquered'].append(part)

                # 統計情報を計算
                stats = {}
                for animal_type in ['beef', 'pork', 'chicken']:
                    animal_parts = [p for p in all_parts if p['animal_type'] == animal_type]
                    conquered_count = len([p for p in animal_parts if p['id'] in conquered_ids])
                    total_count = len(animal_parts)

                    stats[animal_type] = {
                        'conquered_count': conquered_count,
                        'total_count': total_count,
                        'conquest_rate': round((conquered_count / total_count * 100), 1) if total_count > 0 else 0
                    }

                # 全体統計
                total_parts = len(all_parts)
                total_conquered = len(conquered_ids)
                overall_stats = {
                    'total_conquered': total_conquered,
                    'total_parts': total_parts,
                    'overall_conquest_rate': round((total_conquered / total_parts * 100), 1) if total_parts > 0 else 0
                }

                return {
                    "success": True,
                    "data": {
                        "progress": progress_data,
                        "stats": stats,
                        "overall_stats": overall_stats,
                        "user_id": user_id
                    }
                }

        finally:
            conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/user-progress/{animal_type}", response_model=dict)
def get_user_progress_by_animal(
    animal_type: str = Path(..., regex="^(beef|pork|chicken)$"),
    user_id: int = Query(1)
):
    """特定動物のユーザー制覇状況を詳細取得"""
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 指定動物の全部位を取得
                parts_query = """
                SELECT id, animal_type, part_category, part_name, part_name_jp, description, difficulty_level
                FROM animal_parts
                WHERE animal_type = %s
                ORDER BY part_category, difficulty_level, id
                """
                cur.execute(parts_query, (animal_type,))
                all_parts = cur.fetchall()

                # ユーザーの制覇済み部位を取得
                conquered_query = """
                SELECT
                    ap.id,
                    ap.animal_type,
                    ap.part_category,
                    ap.part_name,
                    ap.part_name_jp,
                    ap.description,
                    ap.difficulty_level,
                    MIN(er.eaten_at) as first_conquered_date,
                    MAX(er.eaten_at) as last_eaten_date,
                    COUNT(er.id) as eat_count,
                    GROUP_CONCAT(DISTINCT es.restaurant_name) as restaurants
                FROM animal_parts ap
                JOIN eating_records er ON ap.id = er.animal_part_id
                LEFT JOIN eating_sessions es ON er.session_id = es.id
                WHERE er.user_id = %s AND ap.animal_type = %s
                GROUP BY ap.id, ap.animal_type, ap.part_category, ap.part_name, ap.part_name_jp, ap.description, ap.difficulty_level
                ORDER BY ap.part_category, ap.difficulty_level, ap.id
                """
                cur.execute(conquered_query, (user_id, animal_type))
                conquered_parts = cur.fetchall()

                # 制覇済み部位のIDセットを作成
                conquered_ids = {part['id'] for part in conquered_parts}

                # 結果をカテゴリ別に整理
                result_data = {
                    'meat': {'conquered': [], 'unconquered': []},
                    'organ': {'conquered': [], 'unconquered': []}
                }

                for part in all_parts:
                    part_category = part['part_category']

                    if part['id'] in conquered_ids:
                        conquered_part = next(cp for cp in conquered_parts if cp['id'] == part['id'])
                        part_with_progress = {**part, **conquered_part}
                        result_data[part_category]['conquered'].append(part_with_progress)
                    else:
                        result_data[part_category]['unconquered'].append(part)

                # 統計計算
                total_parts = len(all_parts)
                conquered_count = len(conquered_ids)

                # カテゴリ別統計
                category_stats = {}
                for category in ['meat', 'organ']:
                    cat_parts = [p for p in all_parts if p['part_category'] == category]
                    cat_conquered = len([p for p in cat_parts if p['id'] in conquered_ids])
                    cat_total = len(cat_parts)

                    category_stats[category] = {
                        'conquered_count': cat_conquered,
                        'total_count': cat_total,
                        'conquest_rate': round((cat_conquered / cat_total * 100), 1) if cat_total > 0 else 0
                    }

                stats = {
                    'animal_type': animal_type,
                    'conquered_count': conquered_count,
                    'total_count': total_parts,
                    'conquest_rate': round((conquered_count / total_parts * 100), 1) if total_parts > 0 else 0,
                    'category_stats': category_stats
                }

                return {
                    "success": True,
                    "data": {
                        "parts": result_data,
                        "stats": stats,
                        "user_id": user_id,
                        "animal_type": animal_type
                    }
                }

        finally:
            conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
@app.get("/api/dashboard-stats", response_model=dict)
def get_dashboard_stats(user_id: int = Query(1)):
    """ダッシュボード用の統計情報を取得"""
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # 全体の制覇状況を取得
                all_parts_query = "SELECT COUNT(*) as total FROM animal_parts"
                cur.execute(all_parts_query)
                total_parts = cur.fetchone()['total']

                conquered_parts_query = """
                SELECT COUNT(DISTINCT animal_part_id) as conquered
                FROM eating_records
                WHERE user_id = %s
                """
                cur.execute(conquered_parts_query, (user_id,))
                conquered_parts = cur.fetchone()['conquered']

                # 動物別制覇状況
                animal_stats = {}
                for animal_type in ['beef', 'pork', 'chicken']:
                    animal_total_query = "SELECT COUNT(*) as total FROM animal_parts WHERE animal_type = %s"
                    cur.execute(animal_total_query, (animal_type,))
                    animal_total = cur.fetchone()['total']

                    animal_conquered_query = """
                    SELECT COUNT(DISTINCT ap.id) as conquered
                    FROM animal_parts ap
                    JOIN eating_records er ON ap.id = er.animal_part_id
                    WHERE er.user_id = %s AND ap.animal_type = %s
                    """
                    cur.execute(animal_conquered_query, (user_id, animal_type))
                    animal_conquered = cur.fetchone()['conquered']

                    animal_stats[animal_type] = {
                        'conquered': animal_conquered,
                        'total': animal_total,
                        'rate': round((animal_conquered / animal_total * 100), 1) if animal_total > 0 else 0
                    }

                # 今週の記録数
                week_records_query = """
                SELECT COUNT(*) as count
                FROM eating_records
                WHERE user_id = %s AND eaten_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                """
                cur.execute(week_records_query, (user_id,))
                week_records = cur.fetchone()['count']

                # 連続記録日数（簡易版：過去7日間で記録がある日数）
                streak_query = """
                SELECT COUNT(DISTINCT DATE(eaten_at)) as streak_days
                FROM eating_records
                WHERE user_id = %s AND eaten_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                """
                cur.execute(streak_query, (user_id,))
                streak_days = cur.fetchone()['streak_days']

                # 最近の記録を取得
                recent_records_query = """
                SELECT
                    ap.part_name_jp,
                    ap.animal_type,
                    es.restaurant_name,
                    er.eaten_at
                FROM eating_records er
                JOIN animal_parts ap ON er.animal_part_id = ap.id
                LEFT JOIN eating_sessions es ON er.session_id = es.id
                WHERE er.user_id = %s
                ORDER BY er.eaten_at DESC
                LIMIT 5
                """
                cur.execute(recent_records_query, (user_id,))
                recent_records = cur.fetchall()

                # 全体制覇率計算
                overall_rate = round((conquered_parts / total_parts * 100), 1) if total_parts > 0 else 0

                return {
                    "success": True,
                    "data": {
                        "overall_stats": {
                            "conquered_parts": conquered_parts,
                            "total_parts": total_parts,
                            "conquest_rate": overall_rate
                        },
                        "animal_stats": animal_stats,
                        "activity_stats": {
                            "week_records": week_records,
                            "streak_days": streak_days
                        },
                        "recent_records": recent_records,
                        "user_id": user_id
                    }
                }

        finally:
            conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")