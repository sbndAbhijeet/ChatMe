from fastapi import APIRouter, HTTPException, Request, Response, status
from ..users.models.user import UserCreate, UserLogin
from .utils import hash_password, verify_password, create_access_token, create_refresh_token, DEBUG

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
async def login(user: UserLogin, request: Request, response: Response):
    user_dal = request.app.state.user_dal

    db_user = await user_dal.get_user_by_email(user.email)
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": str(db_user["_id"])})
    refresh_token = create_refresh_token({"sub": str(db_user["_id"])})

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=not DEBUG,  # True in prod, False in local dev HTTP
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 days in seconds
        path="/api/auth",  # only send cookie to auth endpoints
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")

    try:
        from jose import jwt
        from .utils import SECRET_KEY, ALGORITHM
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        user_id = payload["sub"]
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    # Generate new access token
    new_access_token = create_access_token({"sub": user_id})
    
    # Rotate refresh token
    new_refresh_token = create_refresh_token({"sub": user_id})
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=not DEBUG,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
        path="/api/auth",
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="refresh_token", path="/api/auth")
    return {"status": True, "message": "Logged out successfully"}