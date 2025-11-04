import { useEffect, useState } from "react"
import { api } from "../services/api"
import { AlertTriangle, CheckCircle, AlertOctagon } from "lucide-react"

interface AIForecast {
  next_savings_estimate: number
  trend: string
  slope: number
  insight: string
  highlights: string[]
  actions: string[]
  risk_level: string
}

export default function AIInsight() {
  const [data, setData] = useState<AIForecast | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Usuario no autenticado.")
          setLoading(false)
          return
        }

        const res = await api.get("/ai/forecast", {
          headers: { Authorization: `Bearer ${token}` },
        })

        setData(res.data)
      } catch (err) {
        console.error(err)
        setError("No se pudo obtener el análisis IA.")
      } finally {
        setLoading(false)
      }
    }

    fetchForecast()
  }, [])

  if (loading) return <div className="text-gray-500 text-sm">Cargando análisis IA...</div>
  if (error) return <div className="text-red-500 text-sm">{error}</div>
  if (!data) return null
  
  const riskMap = {
    low: { color: "green", icon: <CheckCircle className="text-green-500 w-5 h-5" /> },
    medium: { color: "yellow", icon: <AlertTriangle className="text-yellow-500 w-5 h-5" /> },
    high: { color: "red", icon: <AlertOctagon className="text-red-500 w-5 h-5" /> },
    unknown: { color: "gray", icon: <AlertTriangle className="text-gray-400 w-5 h-5" /> },
  }

  const risk = riskMap[data.risk_level as keyof typeof riskMap] || riskMap.unknown

  return (
    <div className={`p-6 rounded-xl shadow-md border-l-4 border-${risk.color}-500 bg-white`}>
      <div className="flex items-center gap-2 mb-3">
        {risk.icon}
        <h2 className="text-lg font-semibold text-gray-700">Análisis Inteligente</h2>
      </div>

      <p className="text-gray-700 text-sm mb-4 whitespace-pre-line">{data.insight}</p>

      {data.highlights?.length > 0 && (
        <ul className="text-sm text-gray-600 list-disc list-inside mb-4">
          {data.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}

      {data.actions?.length > 0 && (
        <div className="mt-3">
          <h3 className="font-medium text-gray-700 mb-2">Acciones recomendadas:</h3>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {data.actions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      <p className={`mt-4 font-bold text-${risk.color}-600 text-sm`}>
        Nivel de riesgo: {data.risk_level.toUpperCase()}
      </p>
    </div>
  )
}
