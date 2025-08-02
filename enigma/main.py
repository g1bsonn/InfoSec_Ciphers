from fastapi import FastAPI
from enigma.routers import enigma_router, config_router, jefferson_router

app = FastAPI()
app.include_router(enigma_router)
app.include_router(config_router)
app.include_router(jefferson_router)


