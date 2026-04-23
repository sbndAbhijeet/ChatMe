from fastapi import APIRouter, HTTPException, Request, status
from ..users.models.user import UserCreate, UserLogin
from .utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
async def register(user: UserCreate, request: Request):
    user_dal = request.app.state.user_dal

    existing = await user_dal.get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")

    hashed = hash_password(user.password)

    await user_dal.create_user(email=user.email, password=hashed)

    return {"msg": "User created"}


@router.post("/login")
async def login(user: UserLogin, request: Request):
    user_dal = request.app.state.user_dal

    db_user = await user_dal.get_user_by_email(user.email)
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": str(db_user["_id"])})

    return {
        "access_token": token,
        "token_type": "bearer"
    }