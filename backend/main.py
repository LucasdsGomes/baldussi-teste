from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

