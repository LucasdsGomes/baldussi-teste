import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
import models
from sqlalchemy.orm import Session

client = TestClient(app)

NOW_DATE = datetime.now()

# --- Fixtures ---
@pytest.fixture(scope="function")
def db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="function")
def test_user(db: Session):
    user = models.User(
        email="teste@example.com",
        name="Usuário Teste",
        hashed_password="1234",  # senha em texto puro
        role="admin",
        is_active=True,
        created_at=NOW_DATE  # Use datetime object
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    # Cleanup
    db.delete(user)
    db.commit()

@pytest.fixture(scope="function")
def test_call(db: Session):
    call = models.Call(
        empresa_id="DEVBALDUSSI",
        data_inicio=datetime.now(),
        duracao=120,
        origem="1000",
        destino="2000",
        sip_code="200",
        cliente_nome="Cliente Teste"
    )
    db.add(call)
    db.commit()
    db.refresh(call)
    yield call
    db.delete(call)
    db.commit()

# --- Tests ---
def test_create_user(db):
    response = client.post("/users/", json={
        "email": "novo@example.com",
        "name": "Novo Usuário",
        "password": "1234",
        "role": "user",
        "is_active": True,
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "novo@example.com"
    # Cleanup
    user_to_delete = db.query(models.User).filter(models.User.email == "novo@example.com").first()
    if user_to_delete:
        db.delete(user_to_delete)
        db.commit()

def test_login_success(test_user):
    response = client.post("/login/", json={
        "email": test_user.email,
        "password": "1234"  # texto puro
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email

def test_login_fail():
    response = client.post("/login/", json={
        "email": "nãoexiste@example.com",
        "password": "1234"
    })
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Email ou senha inválidos"

def test_update_user(test_user):
    response = client.put(f"/users/{test_user.id}", json={
        "email": "updated@example.com",
        "role": "admin"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "updated@example.com"

def test_delete_user(db):
    user = models.User(
        email="temp@example.com",
        name="Temp User",
        hashed_password="1234",  # texto puro
        role="user",
        is_active=True,
        created_at=datetime.now()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    user_id = user.id
    
    response = client.delete(f"/users/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id
    assert data["message"] == "Usuário deletado com sucesso"

def test_list_calls(test_call):
    response = client.get("/calls")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "page" in data
    assert "total" in data
    assert len(data["data"]) > 0

def test_kpis_asr_acd(test_call):
    response = client.get("/calls")
    data = response.json()
    calls = data["data"]
    total_calls = len(calls)
    answered_calls = sum(1 for c in calls if c["sip_code"].startswith("2"))
    asr = (answered_calls / total_calls * 100) if total_calls > 0 else 0
    acd = (sum(int(c["duracao"]) for c in calls) / total_calls) if total_calls > 0 else 0
    
    assert total_calls > 0
    assert 0 <= asr <= 100
    assert acd >= 0
