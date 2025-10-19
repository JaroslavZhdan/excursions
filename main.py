from fastapi import FastAPI

from router import router as excursions_router

app = FastAPI()

app.include_router(excursions_router)