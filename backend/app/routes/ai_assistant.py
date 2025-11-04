# app/routes/ai_assistant.py
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from pydantic import BaseModel
from typing import List, Dict, Any, Optional,Union
from app.services.ai_service import ask_financial_assistant, build_user_context_summary, predict_savings_trend, generate_forecast_explanation, get_or_generate_ai_summary
from app.services.auth_service import get_current_user
from app.utils.db import financial_collection, ai_cache_collection
from datetime import datetime
from app.services.ai_service import genai
import numpy as np

router = APIRouter(prefix="/ai", tags=["AI Assistant"])
class AIRequest(BaseModel):
    message: str
    context: Optional[Union[str, Dict[str, Any]]] = None


@router.post("/assistant")
def ai_assistant(req: AIRequest, user=Depends(get_current_user)):
    import json

    user_email = user["email"]

    rows: List[Dict[str, Any]] = list(
        financial_collection.find({"user_email": user_email}, {"_id": 0})
    )
    base_context = build_user_context_summary(rows)

    frontend_context = {}
    if req.context:
        try:
            if isinstance(req.context, str):
                frontend_context = json.loads(req.context)
            elif isinstance(req.context, dict):
                frontend_context = req.context
        except Exception as e:
            print(f"[WARN] Error parsing frontend context: {e}")
            frontend_context = {}

    merged_context = {}
    frontend_context = req.context
    if isinstance(frontend_context, str):
        try:
            frontend_context = json.loads(frontend_context)
        except json.JSONDecodeError:
            frontend_context = {}

    if not isinstance(frontend_context, dict):
        frontend_context = {}

    try:
        merged_context = {**base_context, **frontend_context}
    except Exception as e:
        print(f"[WARN] Error merging contexts: {e}")
        merged_context = base_context

    result = ask_financial_assistant(req.message, user_context=merged_context)

    if not result.get("ok"):
        raise HTTPException(status_code=502, detail=result.get("error", "IA no disponible"))
    
    if result.get("data"):
        return {
            "model": result["model"],
            "answer": result["data"].get("answer"),
            "highlights": result["data"].get("highlights", []),
            "actions": result["data"].get("actions", []),
            "risk_level": result["data"].get("risk_level", "unknown"),
        }
    else:
        return {
            "model": result["model"],
            "answer": result.get("text"),
            "highlights": [],
            "actions": [],
            "risk_level": "unknown",
        }



@router.get("/forecast")
def ai_forecast(
    user=Depends(get_current_user),
    explain: bool = Query(True, description="Incluir explicación generativa"),
):
    user_email = user["email"]

    # 1️⃣ Buscar cache
    cached = ai_cache_collection.find_one(
        {"user_email": user_email, "type": "forecast"})
    if cached and "response" in cached:
        return cached["response"]

    # 2️⃣ Generar pronóstico
    rows = list(financial_collection.find(
        {"user_email": user_email}, {"_id": 0}).sort("record_date", 1))
    if not rows:
        raise HTTPException(
            status_code=404, detail="No se encontraron registros financieros.")

    forecast = predict_savings_trend(rows)
    if "message" in forecast:
        return forecast

    if explain:
        narrative = generate_forecast_explanation(forecast, rows)
        forecast.update({
            "insight": narrative.get("answer"),
            "highlights": narrative.get("highlights", []),
            "actions": narrative.get("actions", []),
            "risk_level": narrative.get("risk_level", "unknown"),
        })

    # 3️⃣ Guardar cache
    ai_cache_collection.update_one(
        {"user_email": user_email, "type": "forecast"},
        {
            "$set": {
                "response": forecast,
                "updated_at": datetime.utcnow()
            }
        },
        upsert=True
    )

    return forecast


@router.post("/scenario")
def ai_scenario(payload: dict = Body(...), user=Depends(get_current_user)):
    user_email = user["email"]
    rows = list(
        financial_collection.find({"user_email": user_email}, {
                                  "_id": 0}).sort("record_date", 1)
    )

    if not rows:
        raise HTTPException(status_code=404, detail="No hay registros")

    valid_rows = [
        r for r in rows
        if "income" in r and "expenses" in r and "savings" in r
    ]
    if not valid_rows:
        raise HTTPException(
            status_code=400,
            detail="No hay registros con income, expenses y savings válidos."
        )

    delta_income = float(payload.get("delta_income", 0))
    delta_expenses = float(payload.get("delta_expenses", 0))
    delta_savings = float(payload.get("delta_savings", 0))

    avg_income = sum(r.get("income", 0) for r in valid_rows) / len(valid_rows)
    avg_expenses = sum(r.get("expenses", 0)
                       for r in valid_rows) / len(valid_rows)
    avg_savings = sum(r.get("savings", 0)
                      for r in valid_rows) / len(valid_rows)

    simulated_income = max(avg_income + delta_income, 0)
    simulated_expenses = max(avg_expenses + delta_expenses, 0)
    simulated_savings = max(
        simulated_income - simulated_expenses + delta_savings, 0)

    change_income = ((simulated_income - avg_income) /
                     avg_income * 100) if avg_income else 0
    change_expenses = ((simulated_expenses - avg_expenses) /
                       avg_expenses * 100) if avg_expenses else 0
    change_savings = ((simulated_savings - avg_savings) /
                      avg_savings * 100) if avg_savings else 0

    slope = (simulated_savings - avg_savings) / max(avg_savings, 1)
    trend = "positiva" if slope >= 0 else "negativa"

    insight = (
        f"Tu ahorro proyectado cambia a ${simulated_savings:.2f}. "
        f"Esto representa una variación de {change_savings:+.1f}% respecto a tu promedio histórico "
        f"(${avg_savings:.2f}). "
        f"El cambio proviene de ingresos ({change_income:+.1f}%) "
        f"y gastos ({change_expenses:+.1f}%)."
    )

    impact_level = (
        "alto" if abs(slope) > 0.3 else "moderado" if abs(
            slope) > 0.1 else "bajo"
    )

    actions = (
        [
            "Ajusta tus gastos variables para compensar la pérdida proyectada.",
            "Evita compromisos financieros nuevos hasta estabilizar ingresos."
        ]
        if trend == "negativa"
        else [
            "Aprovecha el aumento de ahorro para planificar inversiones seguras.",
            "Revisa la distribución de ingresos para mantener esta tendencia."
        ]
    )

    color = "#16a34a" if trend == "positiva" else "#dc2626"
    icon = "📈" if trend == "positiva" else "📉"

    return {
        "trend": trend,
        "impact_level": impact_level,
        "insight": insight,
        "actions": actions,
        "color": color,
        "icon": icon,
        "metrics": {
            "income": round(simulated_income, 2),
            "expenses": round(simulated_expenses, 2),
            "savings": round(simulated_savings, 2),
            "avg_income": round(avg_income, 2),
            "avg_expenses": round(avg_expenses, 2),
            "avg_savings": round(avg_savings, 2),
            "change_income": round(change_income, 2),
            "change_expenses": round(change_expenses, 2),
            "change_savings": round(change_savings, 2),
        },
        "valid_records": len(valid_rows),
        "ignored_records": len(rows) - len(valid_rows),
    }


@router.get("/risk-summary")
def ai_risk_summary(user=Depends(get_current_user)):
    user_email = user["email"]
    rows = list(financial_collection.find(
        {"user_email": user_email}, {"_id": 0}).sort("record_date", 1))

    if not rows:
        raise HTTPException(status_code=404, detail="No hay registros")

    # Filtrar registros válidos que contengan income y savings
    valid_rows = [
        r for r in rows if "income" in r and "savings" in r and r["income"] > 0]

    if not valid_rows:
        raise HTTPException(
            status_code=400,
            detail="No hay registros válidos con ingresos y ahorros para calcular el riesgo."
        )

    # Calcular métricas solo con los registros válidos
    avg_save_ratio = sum(r["savings"] / r["income"]
                         for r in valid_rows) / len(valid_rows)
    volatility = np.std([r["savings"] for r in valid_rows])

    risk_level = (
        "low" if volatility < 100 and avg_save_ratio > 0.2
        else "medium" if volatility < 300
        else "high"
    )

    return {
        "avg_saving_ratio": round(avg_save_ratio * 100, 2),
        "volatility": round(volatility, 2),
        "risk_level": risk_level,
        "total_records": len(valid_rows),
        "ignored_records": len(rows) - len(valid_rows)
    }


@router.get("/forecast/history")
def forecast_history(user=Depends(get_current_user)):
    user_email = user["email"]
    docs = list(financial_collection.find(
        {"user_email": user_email}, {"_id": 0}).sort("record_date", 1))
    preds = []
    for i in range(2, len(docs) + 1):
        subset = docs[:i]
        preds.append(predict_savings_trend(subset))
    return preds


@router.get("/summary")
def ai_summary(user=Depends(get_current_user)):
    user_email = user["email"]
    rows = list(financial_collection.find(
        {"user_email": user_email}, {"_id": 0}))
    try:
        result = get_or_generate_ai_summary(user_email, rows)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al obtener resumen IA: {str(e)}")
