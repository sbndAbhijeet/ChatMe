from pydantic import BaseModel, EmailStr, field_validator

class UserCreate(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password too short")
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password too long (max 72 bytes)")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ApiKeyUpdate(BaseModel):
    api_key: str


class UserProfile(BaseModel):
    user_id: str
    email: EmailStr
    has_openrouter_api_key: bool = False