# ============================================================
#  Todo CRUD API  (FastAPI + SQLAlchemy + SQLite)
#  - 단일 파일(main.py)로 구성
#  - 실행: uvicorn main:app --reload   (backend 폴더 안에서)
# ============================================================

# --- 필요한 도구(라이브러리) 불러오기 ---------------------------------
from fastapi import FastAPI, Depends, HTTPException, status          # 웹 API를 만드는 핵심 도구들
from fastapi.middleware.cors import CORSMiddleware                   # CORS(다른 주소에서 오는 요청 허용) 설정용
from pydantic import BaseModel, ConfigDict                           # 데이터 모양을 검증하는 스키마 도구
from sqlalchemy import create_engine, Integer, String, Boolean       # DB 연결 + 컬럼(열) 타입들
from sqlalchemy.orm import (
    declarative_base,   # 모델(테이블 설계도)의 부모 클래스를 만들어 줌
    sessionmaker,       # DB 세션(작업 공간)을 찍어내는 공장
    Session,            # 타입 힌트용 (세션 자료형)
    Mapped,             # 2.0 스타일: 컬럼의 파이썬 타입을 표시
    mapped_column,      # 2.0 스타일: 실제 컬럼을 정의
)


# ============================================================
#  1. 데이터베이스(DB) 설정
# ============================================================

# SQLite DB 파일 위치. "sqlite:///./todos.db" = 현재 폴더에 todos.db 파일 생성
DATABASE_URL = "sqlite:///./todos.db"

# engine: 파이썬과 DB를 이어주는 '연결 통로'
# check_same_thread=False -> SQLite는 기본적으로 한 스레드만 허용하는데,
#   FastAPI는 여러 요청을 동시에 처리하므로 이 제한을 풀어줘야 함 (SQLite + FastAPI 필수 옵션)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# SessionLocal: 요청이 들어올 때마다 새 '세션(DB 작업 공간)'을 만들어 주는 공장
#   - autocommit=False: 내가 commit() 하기 전엔 DB에 확정 저장 안 함
#   - autoflush=False: 자동으로 미리 보내지 않음 (우리가 제어)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base: 앞으로 만들 모델(테이블 설계도)들이 상속받을 부모 클래스
Base = declarative_base()


# ============================================================
#  2. DB 모델 (테이블 설계도)
# ============================================================

class Todo(Base):
    """todos 테이블의 구조를 정의 (DB에 실제로 저장되는 형태)"""
    __tablename__ = "todos"   # 실제 DB 테이블 이름

    # id: 정수, 기본키(PK=각 행을 구분하는 고유 번호), 자동 증가
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    # title: 문자열, 비어 있으면 안 됨(nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    # completed: 불린(참/거짓), 기본값 False(아직 안 끝남)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


# 위에서 정의한 모델을 바탕으로 실제 DB에 테이블을 생성 (없을 때만 만듦)
Base.metadata.create_all(bind=engine)


# ============================================================
#  3. Pydantic 스키마 (API로 주고받는 데이터 모양 검증)
#     - DB 모델(Todo)과 별개로, '입력/출력 형식'을 따로 정의함
# ============================================================

class TodoCreate(BaseModel):
    """생성 요청용: 사용자는 title만 보내면 됨"""
    title: str


class TodoUpdate(BaseModel):
    """수정 요청용: title, completed 둘 다 '선택' (보낸 값만 바꿈)
       기본값 None -> 안 보내면 그 항목은 수정하지 않음"""
    title: str | None = None
    completed: bool | None = None


class TodoResponse(BaseModel):
    """응답용: 클라이언트에게 돌려줄 형태 (id 포함)"""
    id: int
    title: str
    completed: bool

    # from_attributes=True -> DB 모델 객체(Todo)를 그대로 이 스키마로 변환 가능하게 함
    # (Pydantic V2 문법. V1의 orm_mode=True 와 같은 역할)
    model_config = ConfigDict(from_attributes=True)


# ============================================================
#  4. FastAPI 앱 생성 + CORS 설정
# ============================================================

app = FastAPI(title="Todo API")

# CORS: 프론트엔드(예: http://localhost:3000)에서 이 API를 부를 수 있도록 허용
#   브라우저는 보안상 '다른 주소'로의 요청을 기본 차단하는데, 그걸 풀어주는 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 이 주소에서 오는 요청만 허용
    allow_credentials=True,
    allow_methods=["*"],   # 모든 HTTP 메서드(GET/POST/PUT/DELETE...) 허용
    allow_headers=["*"],   # 모든 헤더 허용
)


# ============================================================
#  5. get_db 의존성 (요청마다 DB 세션을 열고, 끝나면 닫기)
# ============================================================

def get_db():
    """요청이 들어오면 DB 세션을 하나 만들어 건네주고,
       요청 처리가 끝나면 자동으로 닫아줌 (자원 누수 방지)."""
    db = SessionLocal()       # 세션 열기
    try:
        yield db              # 엔드포인트에 세션을 빌려줌
    finally:
        db.close()            # 끝나면 무조건 닫기


# ============================================================
#  6. 엔드포인트 4개 (CRUD)
# ============================================================

# --- (R) 전체 조회: GET /todos -------------------------------------
@app.get("/todos", response_model=list[TodoResponse])
def get_todos(db: Session = Depends(get_db)):
    """저장된 모든 Todo를 리스트로 반환"""
    return db.query(Todo).all()


# --- (C) 생성: POST /todos  (성공 시 201 Created) -------------------
@app.post("/todos", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    """새 Todo를 만들어 DB에 저장"""
    new_todo = Todo(title=todo.title)   # 모델 객체 생성 (completed는 기본 False)
    db.add(new_todo)                    # 세션에 추가
    db.commit()                         # DB에 확정 저장
    db.refresh(new_todo)                # 방금 저장된 id 등 최신 값을 다시 읽어옴
    return new_todo


# --- (U) 수정: PUT /todos/{id}  (없으면 404) -----------------------
@app.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, todo: TodoUpdate, db: Session = Depends(get_db)):
    """주어진 id의 Todo를 찾아 보낸 값만 수정"""
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()  # id로 검색
    if db_todo is None:
        # 해당 id가 없으면 404 에러 반환
        raise HTTPException(status_code=404, detail="Todo를 찾을 수 없습니다")

    # exclude_unset=True -> 요청에 실제로 보낸 값만 골라냄 (안 보낸 항목은 건드리지 않음)
    update_data = todo.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_todo, field, value)   # 해당 항목만 새 값으로 교체

    db.commit()              # 변경 사항 확정 저장
    db.refresh(db_todo)      # 최신 값으로 갱신
    return db_todo


# --- (D) 삭제: DELETE /todos/{id}  (없으면 404) --------------------
@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    """주어진 id의 Todo를 삭제"""
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()  # id로 검색
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo를 찾을 수 없습니다")

    db.delete(db_todo)   # 삭제 표시
    db.commit()          # DB에 확정 (실제 삭제)
    return None          # 204 No Content -> 돌려줄 내용 없음
