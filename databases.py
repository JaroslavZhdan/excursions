from datetime import datetime

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped

engine = create_async_engine('sqlite+aiosqlite:///excursions.db')

new_session = async_sessionmaker(engine, expire_on_commit=False)

class Model(DeclarativeBase):
    pass

class TaskOrmExcursions(Model):
    __tablename__ = "excursions"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    gid: Mapped[str]
    date: Mapped[datetime]
    photo: Mapped[str]

class TaskOrmUsers(Model):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    surname: Mapped[str]
    mail: Mapped[str]
    admin: Mapped[bool] = False

async def create_all():
    async with engine.begin() as conn:
        await conn.run_sync(TaskOrmExcursions.metadata.create_all)
        await conn.run_sync(TaskOrmUsers.metadata.create_all)

async def drop_all():
    async with engine.begin() as conn:
        await conn.run_sync(TaskOrmUsers.metadata.drop_all)
        await conn.run_sync(TaskOrmExcursions.metadata.drop_all)



