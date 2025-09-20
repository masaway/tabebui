import os
from typing import Optional, List
from datetime import datetime

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
DB_NAME = os.getenv("DB_NAME", "app")

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