# app/services/financial_service.py
from datetime import datetime, date
from bson import ObjectId
from typing import List
from fastapi import HTTPException
from pymongo.collection import Collection
from app.utils.db import financial_collection, invalidate_ai_cache_for_user
from app.models.financial import FinancialRecord, FinancialQuery


def insert_financial_record(record: FinancialRecord):
    """
    Inserta un nuevo registro financiero y limpia la caché IA asociada al usuario.
    """
    if record.savings > record.income:
        raise HTTPException(
            status_code=422,
            detail=f"El ahorro ({record.savings}) no puede ser mayor al ingreso ({record.income})."
        )

    record_dict = record.dict(by_alias=True)
    record_date_value = record_dict.get("record_date") or record_dict.get("date")

    if isinstance(record_date_value, date):
        record_dict["record_date"] = datetime.combine(record_date_value, datetime.min.time())
    elif isinstance(record_date_value, str):
        record_dict["record_date"] = datetime.fromisoformat(record_date_value)
    else:
        record_dict["record_date"] = datetime.utcnow()

    record_dict.pop("date", None)

    existing = financial_collection.find_one({
        "user_email": record.user_email,
        "record_date": record_dict["record_date"]
    })

    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Ya existe un registro para el usuario '{record.user_email}' en la fecha {record_dict['record_date'].date()}."
        )

    result = financial_collection.insert_one(record_dict)

    try:
        invalidate_ai_cache_for_user(record.user_email)
    except Exception as e:
        print(f"[WARN] No se pudo invalidar caché IA para {record.user_email}: {e}")

    return str(result.inserted_id)


def get_user_financial_records(query: FinancialQuery):
    records = financial_collection.find({"user_email": query.user_email}).sort("record_date", 1)
    cleaned = []

    for r in records:
        record_date = r.get("record_date")
        if not record_date:
            if isinstance(r.get("date"), str):
                try:
                    record_date = datetime.fromisoformat(r["date"])
                except ValueError:
                    record_date = datetime.utcnow()
            else:
                record_date = datetime.utcnow()

        cleaned.append({
            "id": str(r.get("_id", "")),
            "user_email": r.get("user_email", ""),
            "income": float(r.get("income", 0)),
            "expenses": float(r.get("expenses", 0)),
            "savings": float(r.get("savings", 0)),
            "record_date": record_date,
            "category": r.get("category", "general"),
            "description": r.get("description", "")
        })

    return cleaned


def get_financial_history(
    collection: Collection,
    user_email: str,
    start_date: date | None = None,
    end_date: date | None = None
) -> List[dict]:
    """
    Devuelve los registros financieros filtrados por usuario y rango de fechas.
    Tolera registros incompletos y formatos de fecha variados.
    """
    try:
        query = {"user_email": user_email}

        if start_date or end_date:
            query["record_date"] = {}
            if start_date:
                query["record_date"]["$gte"] = datetime.combine(start_date, datetime.min.time())
            if end_date:
                query["record_date"]["$lte"] = datetime.combine(end_date, datetime.max.time())

        docs = list(collection.find(query).sort("record_date", 1))
        if not docs:
            return []

        results = []
        for doc in docs:
            if "_id" in doc:
                doc["id"] = str(doc["_id"])
                doc.pop("_id", None)

            record = {
                "user_email": doc.get("user_email", ""),
                "income": float(doc.get("income", 0)),
                "expenses": float(doc.get("expenses", 0)),
                "savings": float(doc.get("savings", 0)),
                "category": doc.get("category", "general"),
                "description": doc.get("description", "")
            }

            rd = doc.get("record_date") or doc.get("date")
            if isinstance(rd, str):
                try:
                    rd = datetime.fromisoformat(rd)
                except ValueError:
                    rd = None
            record["record_date"] = rd

            results.append(record)

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener historial financiero: {str(e)}")


def delete_financial_record(record_id: str) -> bool:
    """
    Elimina un documento financiero y limpia la caché IA del usuario afectado.
    Retorna True si fue eliminado, False si no existe.
    """
    try:
        record = financial_collection.find_one({"_id": ObjectId(record_id)})
        if not record:
            return False

        result = financial_collection.delete_one({"_id": ObjectId(record_id)})

        if result.deleted_count > 0:
            try:
                invalidate_ai_cache_for_user(record.get("user_email", ""))
            except Exception as e:
                print(f"[WARN] No se pudo invalidar cache IA para {record.get('user_email')}: {e}")
            return True

        return False

    except Exception as e:
        print(f"Error eliminando registro {record_id}: {e}")
        return False
