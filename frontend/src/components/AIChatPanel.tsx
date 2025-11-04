import { useState, useEffect, useRef } from "react"
import { askFinancialAssistant } from "../services/aiService"
import { SendHorizonal, Bot, User, Loader2, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  role: "user" | "ai"
  text: string
}

interface AIChatPanelProps {
  onHeaderClick?: () => void
}

export default function AIChatPanel({ onHeaderClick }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem("ai_chat_history")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  useEffect(() => {
    localStorage.setItem("ai_chat_history", JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMessage = { role: "user" as const, text: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await askFinancialAssistant(userMessage.text)
      const aiResponse = res?.answer || "No se pudo generar una respuesta."
      setMessages((prev) => [...prev, { role: "ai", text: aiResponse }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Error al consultar el asistente financiero." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = (e: React.MouseEvent) => {
    e.stopPropagation() 
    localStorage.removeItem("ai_chat_history")
    setMessages([])
  }

  return (
    <section className="flex flex-col bg-white h-full rounded-xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header clickeable */}
      <div
        className="bg-primary text-white p-4 flex items-center justify-between cursor-pointer hover:bg-accent hover:text-primary transition"
        onClick={onHeaderClick}
      >
        <div className="flex items-center gap-2 font-semibold">
          <Bot size={20} />
          Asistente Financiero IA
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            title="Limpiar chat"
            className="text-white/80 hover:text-white transition"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300">
        <AnimatePresence>
          {messages.length === 0 && !loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-center mt-10"
            >
              💬 Comienza tu conversación financiera.
            </motion.p>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow ${
                  msg.role === "user"
                    ? "bg-green-500 text-white rounded-br-none"
                    : "bg-gray-100 border border-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <div className="flex items-center gap-2 mb-1 text-xs opacity-75">
                  {msg.role === "ai" ? (
                    <>
                      <Bot size={12} /> <span>IA</span>
                    </>
                  ) : (
                    <>
                      <User size={12} /> <span>Tú</span>
                    </>
                  )}
                </div>
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-gray-400 text-sm mt-2"
            >
              <Loader2 className="animate-spin" size={16} />
              <span>La IA está pensando...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3 bg-white flex items-center gap-3">
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Escribe tu pregunta financiera..."
          className="flex-1 resize-none border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className={`p-2 rounded-lg transition ${
            loading || !input.trim()
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-primary text-white hover:bg-accent hover:text-primary"
          }`}
        >
          <SendHorizonal size={20} />
        </button>
      </div>
    </section>
  )
}
