from fastapi import APIRouter, HTTPException
from app.models.user import UserRegister, UserLogin, TokenResponse, UserOut
from app.services.auth_service import register_user, login_user

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register(data: UserRegister):
    user = register_user(data)
    if not user:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    return user

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin):
    token = login_user(data)
    if not token:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return {"access_token": token, "token_type": "bearer"}
