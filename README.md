# 💼 FinScope AI

> **Plataforma de análisis financiero inteligente** que combina visualización avanzada, IA generativa y análisis de tendencias.  
Desarrollada con **React + TypeScript + Vite** en el frontend y **FastAPI + Python** en el backend, desplegada en **AWS (S3 + EC2 + CloudFront)** con integración CI/CD mediante GitHub Actions.

---

## 🌐 Enlaces

🔹 **Repositorio:** [github.com/marceloavila11/FinScope-AI](https://github.com/marceloavila11/FinScope-AI)  
🔹 **Frontend en AWS:** _(CloudFront URL)_  
🔹 **API Backend:** _(EC2 IP:8000/docs)_

---

## 🚀 Características principales

### 🧭 Panel Financiero Inteligente
- Seguimiento de ingresos, gastos y ahorros con **gráficos interactivos**.  
- Filtros dinámicos por rango de fechas y categorías.  
- Modales para **crear, editar y eliminar** registros financieros.  
- KPIs adaptativos y visualización histórica.

### 🤖 Asistente de IA Integrado
- Chat con IA financiera conectada al backend (API generativa).  
- Resúmenes automáticos de tendencias, ahorro y predicciones.  
- Diseño estilo **Messenger** con animaciones suaves y modo compacto.

### 📈 Visualizaciones Dinámicas
- Gráficos comparativos por mes y categoría.  
- Interfaz responsive, moderna y orientada a productividad.

---

## 🧠 Arquitectura del Proyecto

```

📦 FinScope-AI
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── financial_data.py
│   │   │   └── ai_assistant.py
│   │   ├── services/
│   │   │   └── financial_service.py
│   │   ├── models/
│   │   │   └── financial.py
│   │   └── config.py
│   └── tests/
│       └── test_financial.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── vite.config.ts
│
└── docker-compose.yml

````

---

## 🧩 Stack Tecnológico

| Capa | Tecnologías |
|------|--------------|
| **Frontend** | React, TypeScript, Vite, TailwindCSS, Framer Motion |
| **Backend** | FastAPI, Python, Pydantic, Pytest |
| **Base de datos** | MongoDB (Atlas) |
| **Infraestructura** | Docker, AWS EC2 (backend), S3 + CloudFront (frontend), GitHub Actions |
| **IA / ML** | OpenAI API (resúmenes y predicciones) |

---

## ⚙️ Instalación Local

### 🔸 Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # o .venv\Scripts\activate en Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
````

### 🔸 Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🧰 Dockerización

```bash
docker-compose build
docker-compose up -d
```

Esto lanza:

* `finscope-backend` → FastAPI en puerto 8000
* `finscope-frontend` → React (Nginx) en puerto 5173

---

## 🧪 Pruebas

```bash
pytest -v
```

Pruebas automáticas para endpoints `/financial/upload` y `/financial/history`.

---

## ☁️ Despliegue en AWS

* **Frontend:**

  * S3 (hosting estático) + CloudFront (CDN + HTTPS)
  * Deploy automatizado con GitHub Actions → `main` branch

* **Backend:**

  * EC2 con Ubuntu + Docker + Nginx (proxy reverso)
  * Base de datos en MongoDB Atlas (cloud)
  * Acceso mediante `http://<EC2-IP>:8000/docs`

---

## 🧾 Créditos

👤 **Marcelo Avila**
*Ingeniero en Ciencias de la Computación — Banco del Austro*
📍 *Cuenca, Ecuador*
🌐 [GitHub](https://github.com/marceloavila11)

---

## 🏷️ Licencia

Proyecto distribuido bajo licencia **MIT**.
© 2025 **FinScope AI** — *Análisis Financiero Inteligente*.


