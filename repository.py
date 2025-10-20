from fastapi import UploadFile

from databases import new_session, TaskOrmExcursions
from schemas import ExcursionAdd, Excursion
from sqlalchemy import select, delete
from fastapi import HTTPException

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

class ExcursionRepository:
    @classmethod
    async def add_one(cls, data: ExcursionAdd) -> int:
        async with new_session() as session:
            if data.photo.content_type not in ALLOWED_IMAGE_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type: {data.photo.content_type}. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}"
                )
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

    @classmethod
    async def del_one(cls, id: int) -> None:
        async with new_session() as session:
            excursion = await session.get(TaskOrmExcursions, id)
            print(excursion)
            if excursion == None:
                raise HTTPException(status_code=404, detail=f"Excursion with id {id} was not found")
            query = delete(TaskOrmExcursions).where(TaskOrmExcursions.id == id)
            await session.execute(query)
            await session.commit()
        return {'OK': True, 'msg': 'Excursion was deleted'}

    @classmethod
    async def get_one(cls, id: int) -> Excursion:
        async with new_session() as session:
            excursion = await session.get(TaskOrmExcursions, id)
            if excursion == None:
                raise HTTPException(404, detail=f"Excursion with id {id} was not found")
            return excursion


