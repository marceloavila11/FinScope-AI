import { useState } from "react";
import { api } from "../services/api";
import type { FinancialRecord } from "../types/financial";
import { useFinancial } from "../context/FinancialContext";

export default function UploadForm({ onSuccess }: { onSuccess?: () => void }) {
  const { setRefreshFlag } = useFinancial();
  const userEmail = localStorage.getItem("user_email") || "";

  const [form, setForm] = useState<Omit<FinancialRecord, "user_email">>({
    income: 0,
    expenses: 0,
    savings: 0,
    category: "",
    description: "",
    // ahora almacena el mes actual (YYYY-MM)
    date: new Date().toISOString().slice(0, 7),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // === Cálculo lógico dinámico ===
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numValue =
      name !== "category" && name !== "description" && name !== "date"
        ? Math.max(parseFloat(value) || 0, 0)
        : value;

    setForm((prev) => {
      let { income, expenses, savings } = prev;

      if (name === "income") {
        income = numValue as number;
        if (expenses > 0) savings = Math.max(income - expenses, 0);
        else if (savings > 0) expenses = Math.max(income - savings, 0);
      }

      if (name === "expenses") {
        expenses = numValue as number;
        savings = Math.max(income - expenses, 0);
      }

      if (name === "savings") {
        savings = numValue as number;
        expenses = Math.max(income - savings, 0);
      }

      return { ...prev, income, expenses, savings, [name]: numValue };
    });
  };

  // === Validaciones ===
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const { income, expenses, savings, category } = form;

    if (income <= 0) newErrors.income = "El ingreso debe ser mayor a 0.";
    if (expenses < 0) newErrors.expenses = "El gasto no puede ser negativo.";
    if (savings < 0) newErrors.savings = "El ahorro no puede ser negativo.";
    if (Math.abs(income - (expenses + savings)) > 0.01)
      newErrors.savings = "Ingresos = Gastos + Ahorros debe cumplirse.";
    if (!category) newErrors.category = "Seleccione una categoría.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === Submit ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setToast(null);
    try {
      // convertimos el mes YYYY-MM a una fecha real YYYY-MM-01
      const fullDate = `${form.date}-01`;

      await api.post("/financial/upload", { ...form, user_email: userEmail, date: fullDate });
      setToast({ type: "success", text: "Registro guardado correctamente." });
      setForm({
        income: 0,
        expenses: 0,
        savings: 0,
        category: "",
        description: "",
        date: new Date().toISOString().slice(0, 7),
      });
      setRefreshFlag((p) => !p);
      if (onSuccess) onSuccess();
    } catch {
      setToast({ type: "error", text: "Error al guardar el registro." });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="relative">
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg text-sm text-white z-50 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[ 
          { label: "Ingresos", name: "income", value: form.income, type: "number" },
          { label: "Gastos", name: "expenses", value: form.expenses, type: "number" },
          { label: "Ahorros", name: "savings", value: form.savings, type: "number" },
          { label: "Mes", name: "date", value: form.date, type: "month" }, // <-- aquí el cambio
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              type={f.type}
              name={f.name}
              value={f.value}
              onChange={handleChange}
              disabled={loading}
              required={f.name !== "description"}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent ${
                errors[f.name] ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]}</p>}
          </div>
        ))}

        {/* Categoría */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={loading}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent ${
              errors.category ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Seleccione...</option>
            <option value="Salario">Salario</option>
            <option value="Inversión">Inversión</option>
            <option value="Entretenimiento">Entretenimiento</option>
            <option value="Gastos Fijos">Gastos Fijos</option>
            <option value="Otros">Otros</option>
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>

        {/* Observaciones (opcional) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            disabled={loading}
            placeholder="Agregue detalles adicionales si lo desea..."
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent transition"
          />
        </div>

        <div className="md:col-span-2 text-right">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-accent hover:text-primary transition disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
