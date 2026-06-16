"""
main.py
FastAPI ML microservice.

Endpoints:
  GET  /health
  POST /train
  POST /predict
  GET  /models
  POST /retrain-job
"""

import os
import json
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import redis as redis_lib

import forecaster_prophet
import forecaster_lstm
from model_registry import list_all_models, prophet_exists, lstm_exists
from forecaster_lstm import LSTM_MIN_POINTS

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client: Optional[redis_lib.Redis] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client
    try:
        redis_client = redis_lib.from_url(REDIS_URL, decode_responses=True)
        redis_client.ping()
        logger.info("Redis connected")
    except Exception as e:
        logger.warning(f"Redis unavailable: {e}")
        redis_client = None
    yield
    if redis_client:
        redis_client.close()


app = FastAPI(
    title="ERP ML Forecasting Service",
    version="1.0.0",
    description="SKU demand forecasting — Prophet + LSTM",
    lifespan=lifespan,
)


class HistoryPoint(BaseModel):
    ds: str = Field(..., description="Date YYYY-MM-DD")
    y: float = Field(..., description="Demand quantity")


class TrainRequest(BaseModel):
    sku: str
    history: list[HistoryPoint]
    model_type: str = Field(default="auto", description="prophet | lstm | auto")


class PredictRequest(BaseModel):
    sku: str
    history: list[HistoryPoint] = []
    horizon_days: int = Field(default=90, ge=1, le=365)
    model_type: str = Field(default="auto")


class RetrainJobRequest(BaseModel):
    sku: str
    history: list[HistoryPoint]
    model_type: str = Field(default="auto")


@app.get("/health")
def health():
    redis_ok = False
    if redis_client:
        try:
            redis_client.ping()
            redis_ok = True
        except Exception:
            pass
    return {
        "status": "ok",
        "service": "ml-forecasting",
        "redis": "connected" if redis_ok else "unavailable",
    }


@app.post("/train")
def train(req: TrainRequest):
    history = [p.model_dump() for p in req.history]
    n = len(history)
    use_lstm = (
        req.model_type == "lstm"
        or (req.model_type == "auto" and n >= LSTM_MIN_POINTS)
    )
    try:
        if use_lstm:
            result = forecaster_lstm.train(req.sku, history)
        else:
            result = forecaster_prophet.train(req.sku, history)
        return {"message": "Model trained successfully", "result": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Train error SKU={req.sku}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Training failed: {e}")


@app.post("/predict")
def predict(req: PredictRequest):
    history = [p.model_dump() for p in req.history]
    has_lstm = lstm_exists(req.sku)
    has_prophet = prophet_exists(req.sku)

    if req.model_type == "lstm" and not has_lstm:
        raise HTTPException(status_code=404, detail=f"No LSTM model for SKU={req.sku}")
    if req.model_type == "prophet" and not has_prophet:
        raise HTTPException(status_code=404, detail=f"No Prophet model for SKU={req.sku}")
    if req.model_type == "auto" and not has_lstm and not has_prophet:
        raise HTTPException(status_code=404, detail=f"No model for SKU={req.sku}. POST /train first.")

    use_lstm = req.model_type == "lstm" or (req.model_type == "auto" and has_lstm)

    try:
        if use_lstm:
            if not history:
                raise HTTPException(status_code=400, detail="LSTM prediction requires 'history' for seed window")
            result = forecaster_lstm.predict(req.sku, history, req.horizon_days)
        else:
            result = forecaster_prophet.predict(req.sku, req.horizon_days)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Predict error SKU={req.sku}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")


@app.get("/models")
def models():
    return {"models": list_all_models()}


@app.post("/retrain-job")
def retrain_job(req: RetrainJobRequest):
    if not redis_client:
        raise HTTPException(status_code=503, detail="Redis unavailable")
    try:
        payload = {
            "sku": req.sku,
            "model_type": req.model_type,
            "history": [p.model_dump() for p in req.history],
        }
        redis_client.rpush("ml:retrain:jobs", json.dumps(payload))
        return {"message": "Retraining job enqueued", "sku": req.sku}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))