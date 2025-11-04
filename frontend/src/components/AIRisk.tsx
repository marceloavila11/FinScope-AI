import { useState, useEffect } from "react"
import { getAIRiskSummary } from "../services/aiService"
import { Loader2, ShieldAlert } from "lucide-react"
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts"

export default function AIRisk() {
  const [riskData, setRiskData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRiskCheck = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAIRiskSummary()
      setRiskData(res)
    } catch {
      setError("Error generando evaluación de riesgo. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Ejecutar automáticamente al montar el componente
  useEffect(() => {
    handleRiskCheck()
  }, [])

  const getColor = (level: string) => {
    switch (level) {
      case "low":
        return "#16a34a"
      case "medium":
        return "#f59e0b"
      case "high":
        return "#dc2626"
      default:
        return "#6b7280"
    }
  }

  const gaugeValue = riskData
    ? riskData.risk_level === "low"
      ? 30
      : riskData.risk_level === "medium"
        ? 60
        : riskData.risk_level === "high"
          ? 90
          : 0
    : 0

  return (
    <section className="relative bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col">
      {/* Overlay de carga */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm z-10">
          <Loader2 className="animate-spin text-primary mb-2" size={40} />
          <p className="text-gray-600 font-medium">Evaluando tu perfil financiero...</p>
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <ShieldAlert size={20} className="text-primary" />
        Evaluación de Riesgo
      </h2>

      {riskData ? (
        <div className="space-y-5">
          {/* Gráfico */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  data={[{ name: "riesgo", value: gaugeValue, fill: getColor(riskData.risk_level) }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar
                    dataKey="value"
                    cornerRadius={20}
                    background
                    fill={getColor(riskData.risk_level)}
                  />
                </RadialBarChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-800 capitalize">
                  {riskData.risk_level}
                </span>
                <span className="text-xs text-gray-500">
                  Volatilidad: ${riskData.volatility?.toFixed(0)} USD
                </span>
              </div>
            </div>

            <div
              className={`mt-3 text-sm font-semibold px-3 py-1 rounded-full border`}
              style={{
                color: getColor(riskData.risk_level),
                borderColor: getColor(riskData.risk_level),
              }}
            >
              Nivel de riesgo: {riskData.risk_level}
            </div>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
            <p>
              <strong>Volatilidad:</strong>{" "}
              {riskData.volatility ? `$${riskData.volatility.toFixed(2)} USD` : "—"}
            </p>
            <p>
              <strong>Tasa de ahorro promedio:</strong>{" "}
              {riskData.avg_saving_ratio ? `${riskData.avg_saving_ratio.toFixed(2)}%` : "—"}
            </p>
          </div>

          {/* Interpretación */}
          <p className="text-gray-700 mt-2">
            {riskData.risk_level === "low" &&
              "Tu perfil financiero es estable, con buena gestión del ahorro y bajo riesgo de volatilidad."}
            {riskData.risk_level === "medium" &&
              "Tu perfil muestra un equilibrio, pero podrías mejorar la estabilidad del ahorro ante variaciones del gasto."}
            {riskData.risk_level === "high" &&
              "Existe alta volatilidad en tus finanzas, lo que sugiere revisar ingresos y gastos con urgencia."}
          </p>          
        </div>
      ) : (
        !loading && <p className="text-gray-500 text-sm">No hay datos de riesgo disponibles.</p>
      )}

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </section>
  )
}
