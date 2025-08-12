from contextlib import asynccontextmanager
from fastapi import FastAPI

def fake_ml_model(x: float):
    return x * 42

ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # laod the ml models
    # during startup of app
    ml_models["answer_to_everything"] = fake_ml_model
    yield
    #clean up the ml models and realse the resources
    # during end of the app
    ml_models.clear()

app = FastAPI(lifespan=lifespan)

@app.get("/predict")
async def predict(x: float):
    result = ml_models["answer_to_everything"](x)
    return {"result": result}