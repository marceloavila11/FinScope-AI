import { useState } from "react"
import { motion } from "framer-motion"
import { api } from "../services/api"
import logo from "../assets/Logo.png" 

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)
    try {
      const res = await api.post("/auth/login", { email, password })
      const token = res.data.access_token
      localStorage.setItem("token", token)
      localStorage.setItem("user_email", email)

      const profileRes = await api.get("/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const { full_name } = profileRes.data
      localStorage.setItem("full_name", full_name)
      window.location.href = "/"
    } catch (err) {
      console.error(err)
      setMessage("Credenciales inválidas o error en el servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Lado izquierdo: color corporativo */}
      <div
        className="hidden md:flex md:w-1/2 items-center justify-center border-r border-gray-200"
        style={{
          backgroundColor: "#edede7",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center px-6"
        >
          <img
            src={logo}
            alt="FinScope AI Logo"
            className="w-40 h-40 mb-6 select-none"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">FinScope AI</h1>
          <p className="text-gray-600 max-w-md leading-relaxed text-sm">
            Plataforma de análisis financiero inteligente para decisiones basadas en datos.
          </p>
        </motion.div>
      </div>

      {/* Lado derecho: formulario */}
      <div className="flex flex-1 items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md border border-gray-100"
        >
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-1">
            Iniciar Sesión
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Accede a tu panel de control inteligente
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {message && (
              <p className="text-center text-sm text-red-600 bg-red-50 border border-red-100 rounded py-2">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-accent hover:text-primary transition"
            >
              {loading ? "Verificando..." : "Ingresar"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} FinScope AI — Todos los derechos reservados
          </p>
        </motion.div>
      </div>
    </div>
  )
}
