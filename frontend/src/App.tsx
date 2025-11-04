import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import React from "react"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import AIInsights from "./pages/AIInsights"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token")
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de Login (libre) */}
        <Route path="/login" element={<Login />} />

        {/* Redirección automática del root */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard principal protegido */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Página de análisis IA protegida */}
        <Route
          path="/ai-insights"
          element={
            <ProtectedRoute>
              <AIInsights />
            </ProtectedRoute>
          }
        />

        {/* Cualquier ruta no existente */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
