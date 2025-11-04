# app/services/ai_service.py
import json
import time
from datetime import datetime, timedelta
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from app.utils.db import ai_cache_collection  
from app.config import settings
from sklearn.linear_model import LinearRegression
import numpy as np


GEMINI_API_KEY = settings.gemini_api_key

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY no configurado en .env")

genai.configure(api_key=GEMINI_API_KEY)

DEFAULT_MODELS = [
    "gemini-2.5-pro",
    "gemini-2.5-flash",
]

SYSTEM_FINANCE_HINT = (
    "Eres un asesor financiero profesional de FinScope AI. "
    "Tu prioridad es ayudar al usuario a entender su situación financiera de forma clara y honesta. "
    "Analiza sus ingresos, gastos y ahorros sin suavizar los hechos. "
    "Si los resultados son negativos, señala los riesgos de manera directa pero respetuosa, "
    "usando lenguaje profesional y recomendaciones prácticas. "
    "Evita frases genéricas o motivacionales. "
    "Si el desempeño es bueno, reconoce los logros, pero también advierte posibles riesgos o áreas de mejora. "
    "Usa siempre un tono objetivo, de experto en finanzas personales."
)


# ================================
# 🔧 FUNCIONES DE APOYO
# ================================
def _strip_code_fences(text: str) -> str:
    if not text:
        return text
    t = text.strip()
    if t.startswith("```"):
        t = t.strip("`")
        lines = t.splitlines()
        if lines and lines[0].lower().startswith("json"):
            t = "\n".join(lines[1:])
    return t.strip()


def _safe_json(text: str) -> Optional[Dict[str, Any]]:
    try:
        return json.loads(text)
    except Exception:
        return None


# ================================
# 🧠 NÚCLEO DE LLAMADA GEMINI
# ================================
def call_gemini_structured(
    prompt: str,
    models: Optional[List[str]] = None,
    system: Optional[str] = SYSTEM_FINANCE_HINT,
    max_attempts_per_model: int = 2,
    sleep_on_quota: float = 1.0,
) -> Dict[str, Any]:
    models = models or DEFAULT_MODELS
    last_error = None

    structured_hint = (
        "Responde en formato JSON válido con las claves:\n"
        '{ "insight": "análisis realista de la situación", '
        '"highlights": ["hecho1","hecho2"], '
        '"actions": ["acción1","acción2"], '
        '"risk_level": "low|medium|high" }\n'
        "Sé realista. Si el desempeño financiero es deficiente, dilo claramente. "
        "Si hay riesgo de sobreendeudamiento o caída de ahorro, adviértelo sin suavizar. "
        "Si los resultados son buenos, incluye mejoras posibles. "
        "No uses frases como 'excelente', 'fantástico' o 'brillante'; usa términos técnicos."
    )

    full_prompt = f"{system}\n\n{prompt}\n\n{structured_hint}"

    for m in models:
        try:
            model = genai.GenerativeModel(m)
            resp = model.generate_content(full_prompt)
            text = _strip_code_fences((resp.text or "").strip())
            js = _safe_json(text)

            if js:
                return {"ok": True, "model": m, "data": js, "text": None, "error": None}

            if max_attempts_per_model > 1:
                retry_prompt = full_prompt + "\n\nIMPORTANTE: Devuelve SOLO JSON válido."
                resp2 = model.generate_content(retry_prompt)
                text2 = _strip_code_fences((resp2.text or "").strip())
                js2 = _safe_json(text2)
                if js2:
                    return {"ok": True, "model": m, "data": js2, "text": None, "error": None}

            if text:
                return {"ok": True, "model": m, "data": None, "text": text, "error": None}

            last_error = f"Respuesta vacía del modelo {m}"

        except Exception as e:
            last_error = str(e)
            if "quota" in last_error.lower() or "rate" in last_error.lower():
                time.sleep(sleep_on_quota)
            continue

    return {"ok": False, "model": None, "data": None, "text": None, "error": f"Fallo final: {last_error}"}


# ================================
# 📊 CONTEXTO FINANCIERO
# ================================
def build_user_context_summary(financial_rows: List[Dict[str, Any]]) -> str:
    if not financial_rows:
        return "El usuario no tiene registros financieros cargados."
    total_income = sum(r.get("income", 0) for r in financial_rows)
    total_exp = sum(r.get("expenses", 0) for r in financial_rows)
    total_save = sum(r.get("savings", 0) for r in financial_rows)
    ahorro_pct = round((total_save / total_income) *
                       100, 2) if total_income > 0 else 0

    return (
        f"Resumen financiero: ingresos totales {total_income}, gastos {total_exp}, "
        f"ahorros {total_save} ({ahorro_pct}% de ahorro). "
        "Usa esta información para generar recomendaciones personalizadas."
    )

# ================================
# 💬 INTERFAZ PRINCIPAL
# ================================


def ask_financial_assistant(question: str, user_context: dict):
    try:
        prompt = f"""
        Eres un asesor financiero experto. Analiza los siguientes datos del usuario y responde de forma clara y práctica a la pregunta final.

        --- DATOS FINANCIEROS ---
        {json.dumps(user_context, indent=2)}

        --- PREGUNTA ---
        {question}

        Devuelve únicamente un JSON con:
        {{
            "answer": "respuesta textual directa",
            "highlights": ["hecho o razón 1", "hecho o razón 2"],
            "actions": ["recomendación 1", "recomendación 2"],
            "risk_level": "low|medium|high"
        }}
        """

        # 🚀 Compatible con la versión estable de google-generativeai (v0.5.x)
        model = genai.GenerativeModel("gemini-2.5-pro")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )

        parsed = json.loads(response.text)
        return {"model": "gemini-2.5-pro", "data": parsed, "ok": True}

    except Exception as e:
        print("Error consultando al asistente:", e)
        return {"ok": False, "error": str(e)}


# ================================
# 📈 PREDICCIÓN DE AHORRO FUTURO
# ================================


def predict_savings_trend(records: list[dict]) -> dict:
    if not records or len(records) < 2:
        return {"message": "No hay suficientes datos para el análisis."}

    x = np.arange(len(records)).reshape(-1, 1)
    y = np.array([r.get("savings", 0) for r in records])
    model = LinearRegression().fit(x, y)

    next_value = float(model.predict([[len(records) + 1]])[0])
    trend = "positiva" if model.coef_[0] > 0 else "negativa"

    return {
        "next_savings_estimate": round(next_value, 2),
        "trend": trend,
        "slope": round(model.coef_[0], 2),
    }


def generate_forecast_explanation(forecast: dict, financial_rows: list[dict[str, Any]] | None = None) -> dict:
    ctx = build_user_context_summary(financial_rows or [])
    num = {
        "next_savings_estimate": forecast.get("next_savings_estimate"),
        "trend": forecast.get("trend"),
        "slope": forecast.get("slope"),
    }

    prompt = f"""
Con base en estos resultados del modelo de regresión lineal:
{json.dumps(num, ensure_ascii=False)}

{ctx}

Requisitos:
- Redacta una respuesta profesional breve (máximo 5 frases).
- Enfócate en resumen, tendencia y una recomendación práctica.
- Evita repetir porcentajes o cifras más de una vez.
- Usa tono claro y directo.
Devuelve el texto en formato conciso, no académico.
"""

    res = call_gemini_structured(prompt)
    if not res.get("ok"):
        base = f"Tendencia {num['trend']}. Próximo ahorro estimado: {num['next_savings_estimate']}. Pendiente: {num['slope']}."
        return {
            "answer": base,
            "highlights": [base],
            "actions": ["Revisar gastos variables", "Mantener tasa de ahorro actual"],
            "risk_level": "unknown",
        }

    data = res.get("data")
    if data:
        return {
            "answer": data.get("answer"),
            "highlights": data.get("highlights", []),
            "actions": data.get("actions", []),
            "risk_level": data.get("risk_level", "unknown"),
        }

    return {
        "answer": res.get("text"),
        "highlights": [],
        "actions": [],
        "risk_level": "unknown",
    }

# ================================
# 💾 CACHE DE RESPUESTAS IA
# ================================


def get_cached_ai_response(user_email: str, cache_type: str, max_age_hours: int = 24):
    cutoff = datetime.utcnow() - timedelta(hours=max_age_hours)
    cached = ai_cache_collection.find_one({
        "user_email": user_email,
        "type": cache_type,
        "updated_at": {"$gte": cutoff}
    })
    return cached["response"] if cached else None


def save_ai_response_to_cache(user_email: str, cache_type: str, response: dict):
    ai_cache_collection.update_one(
        {"user_email": user_email, "type": cache_type},
        {"$set": {
            "response": response,
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )


def get_or_generate_ai_summary(user_email: str, financial_rows: list[dict[str, any]]):
    cached = get_cached_ai_response(user_email, "summary")
    if cached:
        return {"source": "cache", "summary": cached.get("summary", "Resumen guardado.")}

    context = build_user_context_summary(financial_rows)
    prompt = f"""
Analiza objetivamente la situación financiera del usuario.
{context}
Usa tono profesional, realista, y resume en máximo 5 frases.
"""

    res = call_gemini_structured(prompt, models=["gemini-2.5-flash"])
    if not res.get("ok"):
        return {"summary": "No se pudo generar resumen financiero."}

    summary_text = res["data"].get("insight") if res.get(
        "data") else res.get("text")
    save_ai_response_to_cache(user_email, "summary", {"summary": summary_text})

    return {"source": "gemini", "summary": summary_text}

# ================================
# 🔮 ENDPOINTS IA COMPLEMENTARIOS
# ================================


def generate_ai_forecast(user_email: str, financial_rows: list[dict[str, any]]):
    """
    Genera un pronóstico de ahorro usando regresión lineal + Gemini.
    """
    # Intenta cachear como los demás
    cached = get_cached_ai_response(user_email, "forecast")
    if cached:
        return {"source": "cache", **cached}

    forecast = predict_savings_trend(financial_rows)
    explanation = generate_forecast_explanation(forecast, financial_rows)

    data = {
        "source": "gemini",
        "forecast": forecast,
        "explanation": explanation
    }

    save_ai_response_to_cache(user_email, "forecast", data)
    return data


def generate_forecast_history(user_email: str):
    """
    Devuelve el historial de pronósticos guardados en caché.
    """
    docs = list(ai_cache_collection.find(
        {"user_email": user_email, "type": "forecast"}))
    if not docs:
        return {"history": []}
    return {
        "history": [
            {
                "timestamp": str(d["updated_at"]),
                "forecast": d["response"].get("forecast", {}),
                "explanation": d["response"].get("explanation", {}),
            }
            for d in docs
        ]
    }


def generate_ai_scenario(user_email: str, params: dict):
    """
    Simula escenarios modificando ingresos o gastos.
    """
    base_income = params.get("income", 0)
    base_expenses = params.get("expenses", 0)
    delta = base_income - base_expenses
    msg = f"Escenario simulado con ingresos {base_income}, gastos {base_expenses}, resultado neto {delta}."
    prompt = f"Evalúa este escenario financiero: {msg}"
    res = call_gemini_structured(prompt)
    return res.get("data") or {"insight": msg, "actions": ["Optimizar gastos", "Aumentar ahorro"]}


def generate_ai_risk_summary(user_email: str, financial_rows: list[dict[str, any]]):
    """
    Detecta riesgos financieros generales.
    """
    cached = get_cached_ai_response(user_email, "risk_summary")
    if cached:
        return {"source": "cache", **cached}

    context = build_user_context_summary(financial_rows)
    prompt = f"""
Analiza riesgos financieros y patrones de gasto con base en:
{context}
Incluye tres posibles riesgos y tres recomendaciones para mitigarlos.
"""
    res = call_gemini_structured(prompt)
    data = res.get("data") or {"insight": "Sin riesgos críticos detectados."}
    save_ai_response_to_cache(user_email, "risk_summary", data)
    return {"source": "gemini", **data}
