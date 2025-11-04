import { Menu, X, PlusCircle, BarChart2, Home } from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import FinScopeLogo from "../assets/Logo.svg"

interface NavbarProps {
  onToggle?: () => void
  sidebarVisible?: boolean
  onAddRecord?: () => void
}

export default function Navbar({
  onToggle,
  sidebarVisible = true,
  onAddRecord,
}: NavbarProps) {
  const fullName = localStorage.getItem("full_name") || "Usuario"
  const initials = fullName.charAt(0).toUpperCase()
  const [animateOut, setAnimateOut] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  useEffect(() => {
    if (!sidebarVisible) {
      setAnimateOut(true)
      const timer = setTimeout(() => setAnimateOut(false), 400)
      return () => clearTimeout(timer)
    }
  }, [sidebarVisible])

  const isDashboard = location.pathname === "/" || location.pathname === "/dashboard"
  const isAIPage = location.pathname === "/ai-insights"

  return (
    <aside
      className={`h-screen w-64 bg-primary text-white flex flex-col justify-between shadow-lg transform transition-all duration-500 ease-in-out ${
        sidebarVisible ? "animate-slideIn" : animateOut ? "animate-slideOut" : "hidden"
      }`}
    >
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* ✅ Logo del proyecto */}
          <img
            src={FinScopeLogo}
            alt="FinScope AI Logo"
            className="w-7 h-7 object-contain"
          />
          <h1 className="text-xl font-bold tracking-wide">FinScope AI</h1>
        </div>

        <button
          onClick={onToggle}
          className="text-white hover:text-accent transition-transform duration-300 hover:rotate-90"
          title={sidebarVisible ? "Ocultar menú" : "Mostrar menú"}
        >
          {sidebarVisible ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col flex-grow p-6 gap-3">
        {isAIPage && (
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border-l-4 border-transparent hover:border-accent transition-all"
          >
            <Home size={18} />
            <span className="font-medium">Dashboard</span>
          </button>
        )}

        {isDashboard && (
          <>
            <button
              onClick={() => navigate("/ai-insights")}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border-l-4 border-transparent hover:border-accent transition-all"
            >
              <BarChart2 size={18} />
              <span className="font-medium">Análisis IA</span>
            </button>

            <button
              onClick={onAddRecord}
              className="mt-5 flex items-center justify-center gap-2 bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-white hover:text-primary transition-all transform hover:scale-[1.03]"
            >
              <PlusCircle size={18} />
              Nuevo Registro
            </button>
          </>
        )}
      </nav>

      {/* Perfil */}
      <div className="p-5 border-t border-white/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-accent text-primary w-9 h-9 rounded-full flex items-center justify-center font-bold">
            {initials}
          </div>
          <span className="text-sm font-medium">{fullName.split(" ")[0]}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-white/80 hover:text-white transition text-sm"
          title="Cerrar sesión"
        >
          ⎋
        </button>
      </div>
    </aside>
  )
}
