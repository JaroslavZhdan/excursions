from datetime import datetime

from pydantic import BaseModel, Field

from databases import TaskOrmExcursions


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
    date: datetime
