from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RequestStatus(BaseModel):
    timestamp: datetime
    status: bool #False -> fail
    message: Optional[str] = None