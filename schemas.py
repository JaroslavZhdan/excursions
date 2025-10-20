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
    photo: UploadFile = Field(description="Upload photo")
    max_people: int|None = Field(default = None, description="Max number of people", ge=5)
    price: float = Field(default = 0.0, description="Price of excursion", ge=0)
    created: datetime = Field(default = datetime.now(), description="Created at")

class Excursion(ExcursionAdd):
    id: int
    photo: str
    actual_people: int
    model_config = ConfigDict(from_attributes=True)
