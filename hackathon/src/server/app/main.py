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
