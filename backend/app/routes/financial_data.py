# app/routes/financial_data.py

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models.financial import FinancialRecord, FinancialQuery, FinancialRecordOut, FinancialHistoryRequest

from app.services.financial_service import (
    insert_financial_record,
    get_user_financial_records,
    get_financial_history,
    delete_financial_record
)
from app.utils.db import get_financial_collection

router = APIRouter()

@router.post("/upload", response_model=str, status_code=201)
def upload_financial_record(record: FinancialRecord):
    try:
        return insert_financial_record(record)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.post("/history", response_model=List[FinancialRecordOut])
def user_financial_records(query: FinancialQuery):
    try:
        return get_user_financial_records(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar: {str(e)}")

@router.post("/financial/history", response_model=List[FinancialRecord])
def financial_history(
    request: FinancialHistoryRequest,
    collection=Depends(get_financial_collection)
):
    return get_financial_history(
        collection=collection,
        user_email=request.user_email,
        start_date=request.start_date,
        end_date=request.end_date
    )
@router.delete("/delete/{record_id}", status_code=200)
async def delete_financial_record_route(record_id: str):
    """
    Elimina un registro financiero por su ID.
    """
    deleted = delete_financial_record(record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return {"message": "Registro eliminado correctamente"}