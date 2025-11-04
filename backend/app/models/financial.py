# app/models/financial.py

from pydantic import BaseModel, Field, EmailStr
from datetime import date, datetime
from typing import Optional

class FinancialRecord(BaseModel):
    user_email: str
    income: float
    expenses: float
    savings: float
    record_date: date = Field(default_factory=date.today, alias="date")
    category: Optional[str] = None
    description: Optional[str] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "user_email": "marcelo@demo.com",
                "income": 2500.0,
                "expenses": 1000.0,
                "savings": 500.0,
                "date": "2025-11-02",
                "category": "investment",
                "description": "Compra de acciones"
            }
        }

class FinancialRecordOut(BaseModel):
    id: str
    user_email: str
    income: float
    expenses: float
    savings: float
    record_date: datetime
    category: Optional[str] = None
    description: Optional[str] = None

class FinancialQuery(BaseModel):
    user_email: str

class FinancialHistoryRequest(BaseModel):
    user_email: EmailStr
    start_date: Optional[date] = None
    end_date: Optional[date] = None
