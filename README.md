# 💼 FinScope AI

**FinScope AI** es una plataforma de análisis financiero inteligente desarrollada con **React + TypeScript + Vite** en el frontend y **FastAPI + Python** en el backend.  
Combina analítica de datos, IA generativa y visualizaciones dinámicas para ofrecer una visión integral de las finanzas personales o empresariales.

---

## 🚀 Características principales

### 🔹 Panel Financiero Inteligente
- Visualiza ingresos, gastos y ahorros acumulados con **gráficos interactivos y KPIs dinámicos**.  
- Histórico filtrable y actualizable en tiempo real.  
- Gestión de registros financieros con modal inteligente (agregar, eliminar y filtrar).

### 🤖 Asistente IA Integrado
- Chat financiero con modelo de lenguaje conectado al backend.  
- Capacidad para generar **resúmenes automáticos de tendencias y predicciones**.  
- Respuestas contextuales basadas en datos del usuario (IA generativa vía API interna).  
- Comportamiento tipo “Messenger” con animaciones suaves (minimizar/maximizar).

### 📊 Visualización de Tendencias
- Gráfico mensual comparativo de ingresos, gastos y ahorros.  
- Transiciones suaves y adaptativas mediante **Framer Motion**.

### 🧠 Backend Inteligente
- Implementado en **FastAPI**, con endpoints para:
  - Subir registros financieros (`/financial/upload`)
  - Consultar histórico (`/financial/history`)
  - Eliminar registros (`/financial/delete/:id`)
  - Generar resúmenes IA (`/financial/summary`)
- Base de datos en **MongoDB**.
- Validaciones robustas y tests automáticos con `pytest`.

### 🧩 Arquitectura Modular
- `routes/financial_data.py` → Endpoints financieros  
- `services/financial_service.py` → Lógica de negocio  
- `models/financial.py` → Modelos Pydantic  
- `frontend/src/context/FinancialContext.tsx` → Contexto global React  
- `frontend/src/components/*` → UI modular (charts, tablas, modales, IA panel)

---

## 🖥️ Frontend

**Stack:**
- React + TypeScript + Vite  
- TailwindCSS (con componentes responsivos y animaciones)  
- Framer Motion  
- Axios (servicios API)  

**Diseño:**
- Dashboard responsive (totalmente adaptable a escritorio, tablet y móvil)  
- Navbar dinámico con expansión lateral  
- Layout con animaciones suaves y transiciones por secciones  
- Temas sobrios, con enfoque profesional tipo enterprise  

**Componentes Clave:**
- `AIChatPanel.tsx` → Chat con IA y memoria local  
- `AIInsights.tsx` → Panel de análisis con módulos IA  
- `Dashboard.tsx` → Vista principal con KPIs y gráficos  
- `Login.tsx` → Pantalla moderna con diseño corporativo y responsive  

---

## 🧰 Tecnologías utilizadas

| Tipo | Tecnologías |
|------|--------------|
| **Frontend** | React, TypeScript, Vite, TailwindCSS, Framer Motion |
| **Backend** | FastAPI, Python, Pydantic, Pytest |
| **Base de Datos** | MongoDB |
| **Infraestructura** | Docker (backend + frontend), AWS EC2/S3 (planificado) |
| **IA / ML** | Integración con servicios externos de análisis y resúmenes IA |

---

## ⚙️ Instalación y ejecución

### 🔸 Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # o .venv\Scripts\activate en Windows
pip install -r requirements.txt
uvicorn main:app --reload
````

### 🔸 Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Tests

Ejecutar pruebas del backend:

```bash
pytest -v
```

---

## 🧠 Próximas mejoras

* Panel de predicción avanzada con IA (forecast financiero).
* Sistema de alertas automáticas (gastos excesivos o ahorro insuficiente).
* Dashboard global multiusuario con autenticación JWT.
* Despliegue completo en AWS (EC2, S3, RDS y CI/CD).

---

## 👨‍💻 Autor

**Marcelo Avila** |
Ingeniero en Ciencias de la Computación |
Banco del Austro | Universidad de Cuenca |
[GitHub](https://github.com/marceloavila11)

---

## 🏷️ Licencia

Este proyecto se distribuye bajo licencia **MIT**.
© 2025 FinScope AI — Análisis Financiero Inteligente

```
