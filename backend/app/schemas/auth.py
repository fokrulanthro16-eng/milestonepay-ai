import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class UserRegister(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    role: str = Field(default="CLIENT")  # CLIENT | FREELANCER | ADMIN
    full_name: Optional[str] = None
    paypal_email: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    role: str
    full_name: Optional[str] = None
    paypal_email: Optional[str] = None
    created_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
