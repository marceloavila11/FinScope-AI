import { useEffect, useState } from "react";
import HistoryTable from "./HistoryTable";
import { api } from "../services/api";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import Navbar from "../components/Navbar";
import { useFinancial } from "../context/FinancialContext";
import ModalNewRecord from "../components/ModalNewRecord";
import { getAISummary } from "../services/aiService";

export default function Dashboard() {
    const { records, setRecords, refreshFlag } = useFinancial();
    const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 1024);
    const [mounted, setMounted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [aiSummary, setAISummary] = useState<{ summary: string; source?: string }>({
        summary: "Cargando resumen IA...",
        source: "loading",
    });

    const userEmail = localStorage.getItem("user_email") || "";

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!userEmail) return;
        (async () => {
            try {
                const res = await api.post("/financial/history", { user_email: userEmail });
                setRecords(res.data);
            } catch (err) {
                console.error("Error cargando registros:", err);
            }
        })();
    }, [userEmail, refreshFlag, setRecords]);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await getAISummary();
                setAISummary(data);
            } catch (err) {
                console.error("Error obteniendo resumen IA:", err);
                setAISummary({
                    summary: "No se pudo obtener el resumen financiero.",
                    source: "error",
                });
            }
        };

        fetchSummary();
    }, [refreshFlag]);
    useEffect(() => {
        const handleResize = () => setSidebarVisible(window.innerWidth >= 1024);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const totals = {
        income: records.reduce((a, b) => a + b.income, 0),
        expenses: records.reduce((a, b) => a + b.expenses, 0),
        savings: records.reduce((a, b) => a + b.savings, 0),
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* === Sidebar === */}
            <div
                className={`fixed lg:static z-40 transition-all duration-500 ease-in-out ${sidebarVisible ? "translate-x-0 w-64" : "-translate-x-full w-0"
                    }`}
            >
                {sidebarVisible && (
                    <Navbar
                        onToggle={() => setSidebarVisible(!sidebarVisible)}
                        sidebarVisible={sidebarVisible}
                        onAddRecord={() => setShowModal(true)}
                    />
                )}
            </div>

            {/* === Contenido principal === */}
            <div
                className={`flex-1 flex flex-col overflow-y-auto transition-all duration-700 ease-in-out scrollbar-thin scrollbar-thumb-gray-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
            >

                <main className="p-4 sm:p-6 md:p-8 flex-1">
                    {/* === Encabezado === */}
                    <header className="mb-8 flex flex-wrap items-center justify-between gap-3 text-center sm:text-left">
                        <div className="flex items-center gap-3">
                            {!sidebarVisible && (
                                <button
                                    onClick={() => setSidebarVisible(true)}
                                    className="bg-primary text-white px-3 py-2 rounded-md shadow hover:bg-accent hover:text-primary transition"
                                    title="Mostrar menú"
                                >
                                    ☰
                                </button>
                            )}
                            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Panel Financiero</h1>
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base hidden sm:block">
                            Visualiza tus registros y analiza tu progreso económico.
                        </p>
                    </header>

                    {/* === KPIs === */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                        {[
                            { label: "Ingresos Totales", value: totals.income, color: "green-500" },
                            { label: "Gastos Totales", value: totals.expenses, color: "red-500" },
                            { label: "Ahorros Acumulados", value: totals.savings, color: "blue-500" },
                        ].map((kpi, i) => (
                            <div
                                key={i}
                                className={`bg-white shadow-lg rounded-xl p-5 border-t-4 border-${kpi.color} transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}
                            >
                                <h3 className="text-gray-500 text-sm">{kpi.label}</h3>
                                <p
                                    className={`text-xl sm:text-2xl font-bold text-${kpi.color.replace(
                                        "-500",
                                        "-600"
                                    )}`}
                                >
                                    ${kpi.value.toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* === Tabla + Gráficos + IA === */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                        <section className="lg:col-span-7 bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col h-full">
                            <HistoryTable selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
                        </section>

                        <aside className="md:col-span-1 lg:col-span-5 space-y-6 flex flex-col h-full justify-between">
                            <MonthlyTrendChart records={records} selectedMonth={selectedMonth} />

                            {/* === Resumen IA === */}
                            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col relative overflow-hidden group transition-all duration-300 hover:shadow-lg">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                        🤖 Resumen IA{" "}
                                        {aiSummary.source === "cache" && (
                                            <span className="text-xs text-gray-400">*</span>
                                        )}
                                    </h2>
                                    {aiSummary.source === "gemini" && (
                                        <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">
                                            Actualizado
                                        </span>
                                    )}
                                </div>

                                {/* Contenido */}
                                <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line leading-relaxed tracking-wide">
                                    {aiSummary.summary}
                                </p>

                                {/* Pie de información */}
                                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
                                    <span>
                                        {aiSummary.source === "cache"
                                            ? "Datos IA desde caché reciente"
                                            : aiSummary.source === "gemini"
                                                ? "Generado con análisis IA actualizado"
                                                : "Resumen financiero IA"}
                                    </span>
                                    <span className="italic">💡 FinScope AI</span>
                                </div>

                                {/* Efecto visual sutil */}
                                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary/30 via-accent/40 to-primary/20 w-0 group-hover:w-full transition-all duration-700"></div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>

            {/* === Modal global === */}
            <ModalNewRecord isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
}
