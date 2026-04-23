from fastapi import APIRouter, Depends, Request, HTTPException, status
from src.auth.dependencies import get_current_user
from src.users.models.user import ApiKeyUpdate, UserProfile

router = APIRouter(prefix="/api/users", tags=["Users"], dependencies=[Depends(get_current_user)])

@router.get("/me", response_model=UserProfile)
async def get_me(request: Request, user_id: str = Depends(get_current_user)):
    user_dal = request.app.state.user_dal
    user = await user_dal.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return UserProfile(
        user_id=str(user["_id"]),
        email=user["email"],
        has_openrouter_api_key=bool(user.get("openrouter_api_key"))
    )


@router.put("/api-key")
async def set_api_key(payload: ApiKeyUpdate, request: Request, user_id: str = Depends(get_current_user)):
    user_dal = request.app.state.user_dal
    await user_dal.update_openrouter_api_key(user_id, payload.api_key)
    return {"status": True, "message": "API key saved"}

# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OWU5ZTEwNGM0NTRlNDk0YzFkNWQ0OGEiLCJleHAiOjE3Nzc1NDA2OTl9.PGI6XmjcuoRmae0GgTYivNnI20pltwlsmEVeBA6qDyA