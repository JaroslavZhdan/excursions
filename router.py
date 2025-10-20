from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile

from databases import create_all, drop_all
from repository import ExcursionRepository
from schemas import ExcursionAdd, Excursion

router_datebase = APIRouter(prefix="/datebase", tags=['Datebase'])
router_excursions = APIRouter(prefix="/excursions", tags=["excursions"])


@router_datebase.post("")
async def create_datebase():
    await create_all()
    return {'okay': True, 'say': 'Database created!'}

@router_datebase.delete("")
async def drop_datebase():
    await drop_all()
    return {'okay': True, 'say': 'Database dropped!'}

@router_excursions.post("")
async def add_excursion(excursion: Annotated[ExcursionAdd, Depends()]):
    excursion_id = await ExcursionRepository.add_one(excursion)
    return {'okay': True, 'excursion_id': excursion_id}

@router_excursions.get("")
async def get_excursions() -> list[Excursion]:
    excursions = await ExcursionRepository.find_all()
    return excursions

@router_excursions.delete("")
async def delete_excursion(excursion_id: int):
    await ExcursionRepository.del_one(excursion_id)
    return {'okay': True, 'excursion_id': f'{excursion_id} was deleted'}

@router_excursions.get("/{excursion_id}")
async def get_excursion(excursion_id: int) -> Excursion:
    excursion = await ExcursionRepository.get_one(excursion_id)
    return excursion


