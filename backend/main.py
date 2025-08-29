from typing import Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Teste Técnico - Baldussi")

# Configurar CORS
origins = [
    "http://localhost:5173",  # origem do frontend
    "http://127.0.0.1:5173",  # caso use 127.0.0.1
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # quem pode acessar
    allow_credentials=True,
    allow_methods=["*"],     # permite GET, POST, etc
    allow_headers=["*"],     # permite headers
)

# Dependência banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Criando Novo Usuário
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email já registrado")
    new_user = models.User(email=user.email, hashed_password=user.password, role=user.role, is_active=user.is_active, created_at=user.created_at)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Efetuando Login de Usuário
@app.post("/login/", response_model=schemas.User)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or db_user.hashed_password != user.password:
        raise HTTPException(status_code=400, detail="Email ou senha inválidos")
    return db_user

# Listando Chamadas com Filtros e Paginação
@app.get("/calls/", response_model=schemas.CallListResponse)
def list_calls(
    page: int = 1,
    limit: int = 100,
    empresa_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    destino: Optional[str] = None,
    sip_code: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):

    if page < 1:
        page = 1
    if limit < 1 or limit > 500:
        limit = 100
    
    query = db.query(models.Call)
    
    # Aplicar filtros
    if empresa_id:
        query = query.filter(models.Call.empresa_id == empresa_id)
    
    if date_from and date_to:
        query = query.filter(models.Call.data_inicio.between(date_from, date_to))
    
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
    
    total = query.count()
    calls = query.offset((page - 1) * limit).limit(limit).all()
    
    return schemas.CallListResponse(
        page=page,
        limit=limit,
        total=total,
        data=calls
    )

