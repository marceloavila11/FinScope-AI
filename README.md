# 🧠 FinScope AI – Backend

**FinScope AI** es una plataforma inteligente para la gestión, análisis y predicción de datos financieros personales. Este repositorio contiene el backend desarrollado con **FastAPI** y MongoDB como base de datos NoSQL.

---

## 🚀 Características principales

- 📤 **Carga de datos financieros** por usuario (ingresos, gastos, ahorro, categoría, descripción).
- 📈 **Consulta de historial financiero** por correo de usuario.
- 🔐 Autenticación JWT (en proceso).
- 🌐 API documentada con Swagger UI.
- 💾 Base de datos MongoDB flexible y escalable.
- 🔧 Preparado para integración con frontend (Vite + React) y despliegue en la nube.

---

## 🗂️ Estructura del backend

```

backend/
│
├── app/
│   ├── models/              # Esquemas Pydantic
│   ├── routes/              # Endpoints organizados por módulo
│   ├── services/            # Lógica de negocio
│   ├── utils/               # Conexión a base de datos, helpers
│   └── config.py            # Variables de entorno
│
├── main.py                  # Punto de entrada FastAPI
├── .env                     # Configuraciones sensibles (NO subir)
├── requirements.txt         # Dependencias
└── README.md                # Este archivo

````

---

## 🛠️ Requisitos

- Python 3.11+
- MongoDB (local o Atlas)
- Virtualenv recomendado

---

## ⚙️ Instalación local

```bash
# 1. Clonar el repo
git clone https://github.com/tuusuario/finscope-backend.git
cd finscope-backend

# 2. Crear entorno virtual
python -m venv .venv
source .venv/bin/activate     # Linux/macOS
.venv\Scripts\activate        # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Crear archivo .env
touch .env
````

Ejemplo `.env`:

```
APP_NAME=FinScope AI Backend
APP_VERSION=1.0
MONGO_URI=mongodb://localhost:27017
ALLOWED_ORIGINS=http://localhost:5173
JWT_SECRET=tu_clave_secreta
```

---

## ▶️ Ejecutar

```bash
uvicorn app.main:app --reload
```

Accede a la documentación Swagger:

```
http://localhost:8000/docs
```

---

## 🔮 Próximamente

* 📊 Módulo de análisis inteligente del historial
* 🌍 Despliegue con Docker + AWS ECS/Fargate
* 🔐 Roles de usuario y dashboards personalizados
* ☁️ Integración CI/CD

---

## 🧑‍💻 Autor

**Marcelo Ávila**
[LinkedIn](https://www.linkedin.com/) – *Ecuador*

---

## 📄 Licencia

MIT License – libre para uso educativo y profesional.
