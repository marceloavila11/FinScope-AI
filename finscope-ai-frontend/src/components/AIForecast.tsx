import { useState, useEffect } from "react"
import { getAIForecast } from "../services/aiService"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"

export default function AIForecast() {
  const [forecast, setForecast] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateForecast = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAIForecast()
      setForecast(res)
    } catch {
      setError("Error generando pronóstico. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Auto-cargar al montar
  useEffect(() => {
    const timeout = setTimeout(() => handleGenerateForecast(), 600)
    return () => clearTimeout(timeout)
  }, [])

  const riskColors: Record<string, string> = {
    low: "text-green-600 bg-green-50 border-green-200",
    medium: "text-amber-600 bg-amber-50 border-amber-200",
    high: "text-red-600 bg-red-50 border-red-200",
    unknown: "text-gray-600 bg-gray-50 border-gray-200",
  }

  return (
    <section className="relative bg-white p-6 rounded-xl shadow-md border border-gray-100">
      {/* Overlay de carga */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm z-10">
          <Loader2 className="animate-spin text-primary mb-2" size={40} />
          <p className="text-gray-600 font-medium">Analizando tendencia de ahorros...</p>
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        📈 Pronóstico de Ahorros
      </h2>

      {!forecast ? (
        <button
          onClick={handleGenerateForecast}
          data-auto="forecast"
          className="mt-2 px-5 py-2 bg-primary text-white rounded-lg hover:bg-accent hover:text-primary transition"
        >
          Generar Pronóstico
        </button>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* --- IZQUIERDA: DETALLES --- */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <p className="text-gray-700">
                <strong>Próximo ahorro estimado:</strong>{" "}
                <span className="font-semibold text-primary">
                  ${forecast.next_savings_estimate?.toFixed(2)}
                </span>
              </p>
              <p className="text-gray-700">
                <strong>Tendencia:</strong>{" "}
                <span
                  className={`font-semibold ${
                    forecast.trend === "positiva" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {forecast.trend}
                </span>
              </p>
              <p className="text-gray-700">
                <strong>Pendiente:</strong> {forecast.slope?.toFixed(2)}
              </p>
            </div>

            <div
              className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${riskColors[forecast.risk_level || "unknown"]}`}
            >
              Nivel de riesgo: {forecast.risk_level || "desconocido"}
            </div>

            {forecast.highlights?.length > 0 && (
              <div>
                <h3 className="text-gray-800 font-semibold mb-1">🔍 Observaciones:</h3>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  {forecast.highlights.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {forecast.actions?.length > 0 && (
              <div>
                <h3 className="text-gray-800 font-semibold mb-1">🧭 Recomendaciones:</h3>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  {forecast.actions.map((a: string, i: number) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
            
          </div>

          {/* --- DERECHA: GRÁFICO --- */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { name: "Anterior", value: 600 },
                  { name: "Actual", value: 500 },
                  { name: "Pronóstico", value: forecast.next_savings_estimate },
                ]}
              >
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis hide />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </section>
  )
}
