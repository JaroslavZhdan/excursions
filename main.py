from fastapi import FastAPI

from router import router_datebase, router_excursions

from fastapi.middleware.cors import CORSMiddleware

from photos.router import router as photos_router

app = FastAPI()

app.include_router(router_datebase)
app.include_router(router_excursions)

app.include_router(photos_router)

app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:63342', '127.0.0.1:63342'], allow_methods=['*'])