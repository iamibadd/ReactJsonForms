from fastapi import FastAPI, Request, status,Depends,HTTPException
import models
from database import engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import api


models.Base.metadata.create_all(engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_class=JSONResponse)
def home(request: Request):
    return "Home"

app.include_router(api.router)
