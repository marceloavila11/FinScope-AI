import { useState, useEffect } from "react"
import { api } from "../services/api"
import { useFinancial } from "../context/FinancialContext"
import type { FinancialRecord } from "../types/financial"
import { Trash2 } from "lucide-react"

interface HistoryTableProps {
  selectedMonth: string | null
  setSelectedMonth: (month: string | null) => void
}

export default function HistoryTable({ selectedMonth, setSelectedMonth }: HistoryTableProps) {
  const { refreshFlag, setRefreshFlag, triggerAIRefresh } = useFinancial() 
  const [records, setRecords] = useState<any[]>([])
  const [startMonth, setStartMonth] = useState("")
  const [endMonth, setEndMonth] = useState("")
  const [loading, setLoading] = useState(false)
  const [sortField, setSortField] = useState<"monthKey" | "income" | "expenses" | "savings">("monthKey")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [message, setMessage] = useState<{ type: "error" | "info" | "success"; text: string } | null>(null)

  const userEmail = localStorage.getItem("user_email") || ""

  const toggleSort = (field: any) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }
  
  const fetchRecords = async () => {
    if (!userEmail) {
      setMessage({ type: "error", text: "No hay usuario en sesión. Vuelve a iniciar sesión." })
      return
    }

    setLoading(true)
    setMessage(null)
    try {
      const payload: any = { user_email: userEmail }
      if (startMonth && endMonth) {
        payload.start_date = `${startMonth}-01`
        payload.end_date = `${endMonth}-01`
      }

      const res = await api.post("/financial/history", payload)
      const data: FinancialRecord[] = res.data || []

      const grouped = data.reduce((acc: Record<string, FinancialRecord[]>, rec) => {
        const raw = (rec as any).record_date || rec.date
        const key = raw.slice(0, 7) 
        if (!acc[key]) acc[key] = []
        acc[key].push(rec)
        return acc
      }, {})

      const monthlyTotals = Object.entries(grouped).map(([monthKey, list]) => {
        const totalIncome = list.reduce((sum, r) => sum + r.income, 0)
        const totalExpenses = list.reduce((sum, r) => sum + r.expenses, 0)
        const totalSavings = list.reduce((sum, r) => sum + r.savings, 0)
        return { monthKey, income: totalIncome, expenses: totalExpenses, savings: totalSavings, records: list }
      })

      monthlyTotals.sort((a, b) => {
        const dir = sortDirection === "asc" ? 1 : -1
        return a[sortField] > b[sortField] ? dir : -dir
      })

      setRecords(monthlyTotals)
    } catch (err) {
      console.error("Error:", err)
      setMessage({ type: "error", text: "Error al cargar el historial." })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este registro?")) return
    try {
      await api.delete(`/financial/delete/${id}`)
      setMessage({ type: "success", text: "Registro eliminado correctamente." })
      setRefreshFlag((prev) => !prev)
      triggerAIRefresh()
    } catch (err) {
      console.error("Error eliminando registro:", err)
      setMessage({ type: "error", text: "Error al eliminar el registro." })
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [refreshFlag, sortField, sortDirection])

  return (
    <section>
      <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
        <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
          Historial Financiero (Mensual)
          {loading && (
            <span className="text-xs text-gray-400 animate-pulse">🔄 Actualizando...</span>
          )}
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="month"
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            type="month"
            value={endMonth}
            onChange={(e) => setEndMonth(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={fetchRecords}
            disabled={loading}
            className="bg-accent text-primary px-4 py-2 rounded hover:bg-primary hover:text-white transition disabled:opacity-60"
          >
            {loading ? "Cargando..." : "Filtrar"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded text-sm border ${
            message.type === "error"
              ? "bg-red-100 text-red-700 border-red-300"
              : message.type === "success"
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-blue-100 text-blue-700 border-blue-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 mb-4 pb-4">
        <div className="max-h-[460px] overflow-y-auto overflow-x-auto rounded-b-lg scrollbar-thin scrollbar-thumb-gray-300">
          <table className="min-w-full text-left">
            <thead className="bg-primary text-white sticky top-0 z-10">
              <tr>
                {[
                  { key: "monthKey", label: "Mes" },
                  { key: "income", label: "Ingresos" },
                  { key: "expenses", label: "Gastos" },
                  { key: "savings", label: "Ahorros" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="px-4 py-2 cursor-pointer hover:bg-primary/20"
                  >
                    {col.label}{" "}
                    {sortField === col.key && (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                ))}
                <th className="px-4 py-2 text-center">Registros</th>
              </tr>
            </thead>

            <tbody>
              {records.length ? (
                records.map((r, i) => {
                  const monthLabel = new Date(`${r.monthKey}-01T00:00:00`).toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric",
                  })
                  return (
                    <tr
                      key={i}
                      onClick={() => setSelectedMonth(r.monthKey)}
                      className={`border-t hover:bg-gray-50 transition cursor-pointer ${
                        selectedMonth === r.monthKey ? "bg-accent/10" : ""
                      }`}
                    >
                      <td className="px-4 py-2 font-medium text-gray-700 capitalize">{monthLabel}</td>
                      <td className="px-4 py-2 text-green-700 font-medium">${r.income.toLocaleString()}</td>
                      <td className="px-4 py-2 text-red-700 font-medium">${r.expenses.toLocaleString()}</td>
                      <td className="px-4 py-2 text-blue-700 font-medium">${r.savings.toLocaleString()}</td>
                      <td className="px-4 py-2 text-center">
                        <details>
                          <summary className="text-sm text-primary hover:underline">Ver detalles</summary>
                          <div className="mt-2">
                            <table className="w-full text-xs border-t border-gray-200">
                              <tbody>
                                {r.records.map((rec: any) => (
                                  <tr key={rec._id} className="border-t">
                                    <td>{rec.category}</td>
                                    <td>{rec.description || "—"}</td>
                                    <td className="text-right">
                                      <button
                                        onClick={() => handleDelete(rec._id || rec.id || rec.record_id)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </details>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-4">
                    No hay datos disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
