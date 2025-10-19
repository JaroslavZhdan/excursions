from fastapi import APIRouter

from databases import create_all, drop_all

router = APIRouter(prefix="/excursions")

@router.get("/")
async def main():
    return {"say": "Hello World!"}

@router.post("/database")
async def create_datebase():
    await create_all()
    return {'okay': True, 'say': 'Database created!'}

@router.post("/datebase")
async def drop_datebase():
    await drop_all()
    return {'okay': True, 'say': 'Database dropped!'}
