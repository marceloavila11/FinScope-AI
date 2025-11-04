import { useState } from "react";
import { api } from "../services/api";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsg = { role: "user", text: input };
    setMessages([...messages, newMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/ai/assistant",
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const reply =
        res.data.answer ||
        res.data.text ||
        "No se pudo obtener una respuesta del asistente.";

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error al conectar con FinScope AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg max-w-[85%] ${
              m.role === "user"
                ? "bg-primary text-white self-end ml-auto"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {m.text}
          </motion.div>
        ))}
        {loading && (
          <div className="text-center text-gray-500 animate-pulse">
            FinScope AI está analizando tus finanzas...
          </div>
        )}
      </div>

      <div className="border-t p-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Haz una pregunta financiera..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-accent text-primary font-semibold px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
