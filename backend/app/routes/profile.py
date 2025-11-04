from fastapi import Depends, APIRouter
from app.utils.dependencies import get_current_user
from app.utils.security import bearer_scheme
from app.models.user import UserOut

router = APIRouter()

@router.get("/profile", response_model=UserOut, dependencies=[Depends(bearer_scheme)])
def get_profile(current_user=Depends(get_current_user)):
    return current_user
