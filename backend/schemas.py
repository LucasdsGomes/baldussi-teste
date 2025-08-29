from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    email: EmailStr
    password: str
    role: str = "user"          # default se não enviar
    is_active: bool = True      # default
    created_at: datetime = datetime.utcnow()


# Schema para login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: int
    role: str
    is_active: bool

    class Config:
        orm_mode = True

#Schema para chamadas
class Call(BaseModel):
    id: int
    empresa_id: int
    data_inicio: datetime
    data_fim: datetime
    duracao: int
    origem: str
    destino: str
    sip_code: str
    cliente_nome: Optional[str] = None

    class Config:
        orm_mode = True

class CallListResponse(BaseModel):
    page: int
    limit: int
    total: int
    data: List[Call]


