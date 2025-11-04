import { api } from "../services/api"

export async function getAISummary() {
  const token = localStorage.getItem("token")

  if (!token) {
    console.error("No token found in localStorage")
    return { summary: "No autenticado.", source: "error" }
  }

  try {
    const res = await api.get("/ai/summary", {
      headers: { Authorization: `Bearer ${token}` },
    })
    return {
      summary: res.data.summary || "Sin datos de resumen.",
      source: res.data.source || "gemini",
    }
  } catch (err: any) {
    console.error("Error obteniendo resumen IA:", err.response?.data || err.message)
    return { summary: "No se pudo obtener el resumen financiero.", source: "error" }
  }
}

export async function askFinancialAssistant(message: string, context?: any) {
  const token = localStorage.getItem("token")
  if (!token) {
    console.error("No token found in localStorage")
    throw new Error("No autenticado")
  }

  const safeContext =
    typeof context === "string"
      ? JSON.parse(context)
      : JSON.parse(JSON.stringify(context || {}))

  const payload = {
    message,
    context: safeContext,
  }

  try {
    const res = await api.post("/ai/assistant", payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  } catch (err: any) {
    console.error("Error en /ai/assistant:", err.response?.data || err.message)
    throw err
  }
}


export async function getAIForecast() {
  const token = localStorage.getItem("token")
  if (!token) {
    console.error("No token found in localStorage")
    throw new Error("No autenticado")
  }

  try {
    const res = await api.get("/ai/forecast", {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  } catch (err: any) {
    console.error("Error en /ai/forecast:", err.response?.data || err.message)
    throw err
  }
}

export async function simulateAIScenario(payload: any) {
  const token = localStorage.getItem("token")

  if (!token) {
    console.error("No token found in localStorage")
    return { answer: "No autenticado.", source: "error" }
  }

  try {
    const res = await api.post("/ai/scenario", payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  } catch (err: any) {
    console.error("Error simulando escenario:", err.response?.data || err.message)
    return { answer: "No se pudo generar el escenario." }
  }
}


export async function getAIRiskSummary() {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("No token found")

  const res = await api.get("/ai/risk-summary", {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}
