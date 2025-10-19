from fastapi import UploadFile

from databases import new_session, TaskOrmExcursions
from schemas import ExcursionAdd, Excursion
from sqlalchemy import select


class ExcursionRepository:
    @classmethod
    async def add_one(cls, data: ExcursionAdd) -> int:
        async with new_session() as session:
            file = data.photo.file
            filename = data.photo.filename
            with open(f'photos/{data.name}.{filename}', "wb") as f:
                f.write(file.read())
            data.photo = f'photos/{data.name}.{filename}'
            excursion_dict = data.model_dump()
            excursion = TaskOrmExcursions(**excursion_dict)
            session.add(excursion)
            await session.flush()
            await session.commit()
            return excursion.id



    @classmethod
    async def find_all(cls) -> list[Excursion]:
        async with new_session() as session:
            query = select(TaskOrmExcursions)
            result = await session.execute(query)
            excursion_models = result.scalars().all()
            excursions_schemas = [Excursion.model_validate(excursion_model) for excursion_model in excursion_models]
            return excursions_schemas