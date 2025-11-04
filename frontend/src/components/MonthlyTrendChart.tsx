import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from "recharts";
import type { FinancialRecord } from "../types/financial";

interface Props {
  records: FinancialRecord[];
  selectedMonth: string | null;
}

export default function MonthlyTrendChart({ records, selectedMonth }: Props) {
  const trendData = useMemo(() => {
    const grouped: Record<string, { ingresos: number; gastos: number; ahorros: number }> = {};

    for (const rec of records) {
      const raw = (rec as any).record_date || rec.date;
      const key = raw.slice(0, 7);
      if (!grouped[key]) grouped[key] = { ingresos: 0, gastos: 0, ahorros: 0 };
      grouped[key].ingresos += Number(rec.income || 0);
      grouped[key].gastos += Number(rec.expenses || 0);
      grouped[key].ahorros += Number(rec.savings || 0);
    }

    return Object.entries(grouped)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([key, vals]) => ({
        mes: new Date(`${key}-01T00:00:00`).toLocaleDateString("es-ES", {
          month: "short",
          year: "numeric",
        }),
        key,
        ...vals,
      }));
  }, [records]);

  const selectedLabel =
    selectedMonth &&
    new Date(`${selectedMonth}-01T00:00:00`).toLocaleDateString("es-ES", {
      month: "short",
      year: "numeric",
    });

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Tendencia Mensual</h2>
      {trendData.length ? (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ingresos" stroke="#16a34a" strokeWidth={2} />
            <Line type="monotone" dataKey="gastos" stroke="#dc2626" strokeWidth={2} />
            <Line type="monotone" dataKey="ahorros" stroke="#2563eb" strokeWidth={2} />
            {selectedLabel && (
              <ReferenceLine x={selectedLabel} stroke="#f59e0b" strokeDasharray="4 4" />
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500 text-sm text-center py-8">
          Sin datos suficientes para graficar.
        </p>
      )}
    </div>
  );
}
