import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "../components/Navbar"
import AIForecast from "../components/AIForecast"
import AIRisk from "../components/AIRisk"
import AIScenario from "../components/AIScenario"
import AIChatPanel from "../components/AIChatPanel"

export default function AIInsights() {
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 1024)
  const [chatMinimized, setChatMinimized] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const handleResize = () => setSidebarVisible(window.innerWidth >= 1024)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const triggerAutoLoad = async () => {
      document.querySelector<HTMLButtonElement>("button[data-auto='risk']")?.click()
      document.querySelector<HTMLButtonElement>("button[data-auto='scenario']")?.click()
      document.querySelector<HTMLButtonElement>("button[data-auto='forecast']")?.click()
    }
    const timeout = setTimeout(triggerAutoLoad, 800)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed lg:static z-40 transition-all duration-500 ${
          sidebarVisible ? "translate-x-0 w-64" : "-translate-x-full w-0"
        }`}
      >
        <Navbar
          onToggle={() => setSidebarVisible(!sidebarVisible)}
          sidebarVisible={sidebarVisible}
        />
      </div>

      {/* Contenido principal */}
      <div
        className={`flex-1 flex flex-col transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <main className="flex-1 flex flex-col p-6 md:p-10 overflow-hidden">
          {/* Header */}
          <header className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {!sidebarVisible && (
                <button
                  onClick={() => setSidebarVisible(true)}
                  className="bg-primary text-white px-3 py-2 rounded-md shadow hover:bg-accent hover:text-primary transition"
                >
                  ☰
                </button>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                Análisis Inteligente
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">
              Insights automáticos generados con IA sobre tus finanzas.
            </p>
          </header>

          {/* === GRID PRINCIPAL === */}
          <div className="flex flex-1 gap-6 overflow-hidden relative">
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <AIRisk />
                <AIScenario />
              </div>
              <AIForecast />
            </div>
          </div>
        </main>
      </div>

      {/* 🔹 Chat flotante con header clickeable dentro del componente */}
      <AnimatePresence>
        {!chatMinimized && (
          <motion.div
            key="chat-expanded"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed bottom-0 right-5 md:right-10 w-[95%] md:w-[380px] h-[500px] md:h-[600px] rounded-t-xl shadow-xl border border-gray-100 bg-white overflow-hidden z-50"
          >
            <AIChatPanel onHeaderClick={() => setChatMinimized(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔹 Chat minimizado (barra verde) */}
      <AnimatePresence>
        {chatMinimized && (
          <motion.div
            key="chat-minimized"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-0 right-5 md:right-10 w-[95%] md:w-[380px] rounded-t-xl shadow-lg cursor-pointer bg-primary text-white flex items-center justify-center p-3 z-50 hover:bg-accent hover:text-primary transition"
            onClick={() => setChatMinimized(false)}
          >
            💬 Asistente Financiero IA
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
