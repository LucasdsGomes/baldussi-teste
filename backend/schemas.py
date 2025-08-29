from datetime import datetime
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
