from fastapi.testclient import TestClient
from datetime import date, timedelta
from uuid import uuid4
from app.main import app
from app.utils.db import financial_collection

client = TestClient(app)

def setup_module(module):
    financial_collection.delete_many({"user_email": "test@demo.com"})

BASE_PAYLOAD = {
    "user_email": "test@demo.com",
    "income": 1500,
    "expenses": 500,
    "savings": 300,
    "category": "testing",
    "description": "Test automático"
}


def test_upload_financial_record_success():
    payload = BASE_PAYLOAD.copy()
    payload["date"] = (date.today() + timedelta(days=1)).isoformat()
    payload["description"] = f"Registro exitoso {uuid4()}"

    response = client.post("/financial/upload", json=payload)

    assert response.status_code == 201, f"Error: {response.text}"
    assert isinstance(response.json(), str)


def test_upload_duplicate_record():
    payload = BASE_PAYLOAD.copy()
    payload["date"] = "2025-11-02"
    payload["description"] = f"Registro duplicado {uuid4()}"

    client.post("/financial/upload", json=payload)

    response = client.post("/financial/upload", json=payload)

    assert response.status_code == 409
    assert "Ya existe un registro" in response.text


def test_upload_invalid_savings_record():
    payload = BASE_PAYLOAD.copy()
    payload["income"] = 500
    payload["savings"] = 600
    payload["date"] = (date.today() + timedelta(days=2)).isoformat()
    payload["description"] = f"Test inválido {uuid4()}"

    response = client.post("/financial/upload", json=payload)

    assert response.status_code == 422, f"Respuesta inesperada: {response.text}"
    assert "no puede ser mayor al ingreso" in response.text

def test_financial_history_response():
    response = client.post("/financial/history", json={
        "user_email": "test@demo.com"
    })
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_advanced_financial_history_filter_by_date():
    """
    Verifica que el endpoint /financial/financial/history devuelva registros dentro del rango de fechas.
    """
    today = date.today()
    payload_1 = BASE_PAYLOAD.copy()
    payload_1["date"] = (today - timedelta(days=2)).isoformat()
    payload_1["description"] = f"Registro dentro del rango {uuid4()}"

    payload_2 = BASE_PAYLOAD.copy()
    payload_2["date"] = (today + timedelta(days=2)).isoformat()
    payload_2["description"] = f"Registro fuera del rango {uuid4()}"

    client.post("/financial/upload", json=payload_1)
    client.post("/financial/upload", json=payload_2)

    response = client.post("/financial/financial/history", json={
        "user_email": "test@demo.com",
        "start_date": (today - timedelta(days=3)).isoformat(),
        "end_date": (today - timedelta(days=1)).isoformat()
    })

    assert response.status_code == 200, f"Error: {response.text}"
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    for record in data:
        assert "record_date" in record
        assert "user_email" in record
        assert record["user_email"] == "test@demo.com"
