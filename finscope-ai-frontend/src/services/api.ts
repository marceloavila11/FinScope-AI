import axios from "axios"
import { isTokenValid } from "../utils/auth"

export const api = axios.create({
  baseURL: "http://localhost:8000",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token && isTokenValid(token)) {
    config.headers.Authorization = `Bearer ${token}`
  } else if (token && !isTokenValid(token)) {
    localStorage.removeItem("token")
    localStorage.removeItem("user_email")
    window.location.href = "/login"
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user_email")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)
