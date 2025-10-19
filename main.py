from fastapi import FastAPI

from router import router_datebase, router_excursions

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(router_datebase)
app.include_router(router_excursions)

app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:63342', '127.0.0.1:63342'], allow_methods=['*'])