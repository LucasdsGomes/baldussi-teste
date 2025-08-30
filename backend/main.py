from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_
from sqlalchemy.orm import Session
import models
import schemas
from database import SessionLocal, engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Teste Técnico - Baldussi")

# Configurar CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email já registrado")
    
    new_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=user.password, 
        role=user.role,
        is_active=user.is_active
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users/", response_model=list[schemas.User])
def list_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users

@app.post("/login/", response_model=schemas.User)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or user.password != db_user.hashed_password:
        raise HTTPException(status_code=400, detail="Email ou senha inválidos")
    return db_user

@app.get("/calls", response_model=schemas.CallListResponse)
def list_calls(
    page: int = 1,
    limit: int = 100,
    empresa_id: Optional[str] = None,
    data: Optional[datetime] = None,
    destino: Optional[str] = None,
    sip_code: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Validação de página e limite
    page = max(page, 1)
    limit = min(max(limit, 1), 500)

    # Query inicial
    query = db.query(models.Call)

    # Filtros opcionais
    if empresa_id:
        query = query.filter(models.Call.empresa_id.ilike(f"%{empresa_id}%"))
    if data:
        query = query.filter(models.Call.data >= data)
    if destino:
        query = query.filter(models.Call.destino.ilike(f"%{destino}%"))
    if sip_code:
        query = query.filter(models.Call.sip_code == sip_code)
    if q:
        query = query.filter(
            or_(
                models.Call.cliente_nome.ilike(f"%{q}%"),
                models.Call.origem.ilike(f"%{q}%"),
                models.Call.destino.ilike(f"%{q}%")
            )
        )

    # Paginação
    total = query.count()
    calls = query.offset((page - 1) * limit).limit(limit).all()

    # Retorno no formato dict para o response_model do FastAPI
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "data": calls  # FastAPI vai converter automaticamente para List[Call]
    }

@app.delete("/users/{user_id}", response_model=dict)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    db.delete(user)
    db.commit()
    
    return {"message": "Usuário deletado com sucesso", "id": user_id}

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.name is not None:
        user.name = user_update.name
    if user_update.role is not None:
        user.role = user_update.role
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    
    db.commit()
    db.refresh(user)
    
    return user
