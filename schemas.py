from datetime import datetime
from fastapi import UploadFile, Form
from anyio.streams import file
from pydantic import BaseModel, Field, ConfigDict


class UserAdd(BaseModel):
    name: str
    surname: str
    mail: str
    admin: bool = False

class User(UserAdd):
    id: int

class ExcursionAdd(BaseModel):
    name: str
    gid: str
    date: datetime = Field(description="Date of excursion, format: YYYY-MM-DD")
    photo: UploadFile = Form(...)

class Excursion(ExcursionAdd):
    id: int
    photo: str
    model_config = ConfigDict(from_attributes=True)
