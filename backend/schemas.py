from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    name: str
    email: str
    role: str = "user"
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    created_at: datetime = datetime.utcnow()

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: str
    password: str

class CallBase(BaseModel):
    empresa_id: str
    data_inicio: datetime
    duracao: int
    origem: str
    destino: str
    sip_code: str
    cliente_nome: Optional[str] = None

class CallCreate(CallBase):
    pass

class Call(CallBase):
    id: int

    class Config:
        orm_mode = True

class CallListResponse(BaseModel):
    page: int
    limit: int
    total: int
    data: List[Call]

    class Config:
        orm_mode = True