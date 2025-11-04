import { useState, useEffect } from "react"
import { simulateAIScenario } from "../services/aiService"
import { Loader2, TrendingUp, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"

export default function AIScenario() {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [deltaType, setDeltaType] = useState("expenses")

  // 🔹 Función principal de simulación
  const handleSimulate = async (change: number = 0) => {
    setLoading(true)
    try {
      const payload =
        deltaType === "expenses"
          ? { delta_expenses: change }
          : deltaType === "income"
          ? { delta_income: change }
          : { delta_savings: change }

      const res = await simulateAIScenario(payload)
      setData(res)
    } catch {
      setData({ insight: "Error generando el escenario." })
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Ejecutar automáticamente al cargar el componente
  useEffect(() => {
    handleSimulate(0)
  }, [])

  const color = data?.color || "#6b7280"

  return (
    <section className="relative bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col transition-all duration-500">
      {/* Overlay de carga */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center rounded-xl z-10">
          <Loader2 className="animate-spin text-primary mb-2" size={40} />
          <p className="text-gray-600 font-medium">Simulando escenario...</p>
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
        🔮 Escenario Hipotético
      </h2>

      {/* Selector de variable */}
      <div className="flex gap-3 mb-4">
        {["income", "expenses", "savings"].map((type) => (
          <button
            key={type}
            onClick={() => setDeltaType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
              deltaType === type
                ? "bg-primary text-white"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
            }`}
          >
            {type === "income" && "Ingresos"}
            {type === "expenses" && "Gastos"}
            {type === "savings" && "Ahorros"}
          </button>
        ))}
      </div>

      {/* Botones de simulación */}
      <div className="flex items-center gap-4 justify-center mb-5">
        <button
          onClick={() => handleSimulate(-200)}
          className="px-5 py-2 bg-gray-100 rounded-lg text-primary hover:bg-gray-200 transition"
        >
          − Disminuir
        </button>
        <button
          onClick={() => handleSimulate(200)}
          className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-accent hover:text-primary transition"
        >
          + Aumentar
        </button>
      </div>

      {/* Resultados */}
      {data && (
        <motion.div
          className="p-4 rounded-lg border shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ borderColor: color }}
        >
          <div className="flex items-center gap-2 mb-3">
            {data.trend === "positiva" ? (
              <TrendingUp size={20} className="text-green-600" />
            ) : (
              <TrendingDown size={20} className="text-red-600" />
            )}
            <h3 className="font-semibold text-gray-800">
              {data.icon} Tendencia {data.trend}
            </h3>
          </div>

          {/* Texto principal */}
          <p className="text-gray-700 mb-3 leading-relaxed">{data.insight}</p>

          {/* Impacto */}
          <div
            className={`text-sm font-semibold px-3 py-1 rounded-full border w-fit mx-auto mb-4`}
            style={{
              color: color,
              borderColor: color,
            }}
          >
            Impacto {data.impact_level}
          </div>

          {/* Métricas comparativas */}
          <div className="grid grid-cols-3 text-sm text-center mt-4 border-t pt-3">
            <div>
              <p className="font-medium text-gray-600">Ingreso</p>
              <p className="text-gray-800">
                ${data.metrics?.income}
                <span
                  className={`text-xs ml-1 ${
                    data.metrics?.change_income >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ({data.metrics?.change_income}%)
                </span>
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Gasto</p>
              <p className="text-gray-800">
                ${data.metrics?.expenses}
                <span
                  className={`text-xs ml-1 ${
                    data.metrics?.change_expenses >= 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  ({data.metrics?.change_expenses}%)
                </span>
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Ahorro</p>
              <p className="text-gray-800">
                ${data.metrics?.savings}
                <span
                  className={`text-xs ml-1 ${
                    data.metrics?.change_savings >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ({data.metrics?.change_savings}%)
                </span>
              </p>
            </div>
          </div>

          {/* Recomendaciones */}
          <ul className="text-sm text-gray-600 space-y-1 mt-4">
            {data.actions?.map((a: string, i: number) => (
              <li key={i}>• {a}</li>
            ))}
          </ul>
        </motion.div>
      )}
    </section>
  )
}
