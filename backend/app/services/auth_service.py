from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.utils.db import user_collection
from app.models.user import UserRegister, UserLogin
from app.utils.jwt_handler import create_access_token
from app.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def register_user(user: UserRegister):
    existing = user_collection.find_one({"email": user.email})
    if existing:
        return None 

    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password[:72])
    user_dict["role"] = "user"
    user_collection.insert_one(user_dict)
    return user_dict

def login_user(data: UserLogin):
    user = user_collection.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        return None

    token = create_access_token({"sub": user["email"], "role": user["role"]})
    return token

def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Decodifica el token JWT y devuelve la identidad del usuario actual.
    Lanza 401 si el token es inválido o ha expirado.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        user_email: str = payload.get("sub")
        user_role: str = payload.get("role")

        if user_email is None:
            raise credentials_exception

        user = user_collection.find_one({"email": user_email})
        if not user:
            raise credentials_exception

        return {"email": user_email, "role": user_role}

    except JWTError:
        raise credentials_exception
