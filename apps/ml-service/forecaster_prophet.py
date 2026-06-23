"""
forecaster_prophet.py
Prophet-based SKU demand forecasting.
Used for all SKUs as the primary forecasting engine.
"""

import importlib
import importlib.util
import logging
import numpy as np
import pandas as pd

try:
    from prophet import Prophet
except ImportError:
    from fbprophet import Prophet

from model_registry import save_prophet, load_prophet, prophet_meta

logger = logging.getLogger(__name__)


def train(sku: str, history: list) -> dict:
    """
    Train Prophet model for one SKU.
    history: [{"ds": "YYYY-MM-DD", "y": demand_quantity}, ...]  min 2 points.
    """
    if len(history) < 2:
        raise ValueError(f"Need >= 2 data points, got {len(history)}")

    df = pd.DataFrame(history)
    df["ds"] = pd.to_datetime(df["ds"])
    df["y"] = pd.to_numeric(df["y"], errors="coerce").fillna(0).clip(lower=0)
    df = df.sort_values("ds").reset_index(drop=True)

    model = prophet.prophet.Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        interval_width=0.80,
        changepoint_prior_scale=0.05,
    )
    model.fit(df)

    forecast = model.predict(df[["ds"]])
    y_true = df["y"].values
    y_pred = forecast["yhat"].values
    non_zero = y_true > 0
    mape = float(
        np.mean(np.abs((y_true[non_zero] - y_pred[non_zero]) / y_true[non_zero])) * 100
    ) if non_zero.any() else 0.0

    meta = {
        "sku": sku,
        "model_type": "prophet",
        "data_points": len(df),
        "mape": round(mape, 2),
        "trained_at": pd.Timestamp.utcnow().isoformat(),
    }

    return save_prophet(sku, model, meta)


def predict(sku: str, horizon_days: int = 90) -> dict:
    """
    Generate daily demand forecast for a trained SKU.
    Returns: {sku, horizon_days, model_type, version, forecast, mape, trained_at}
    """
    model, version = load_prophet(sku)
    meta = prophet_meta(sku)

    future = model.make_future_dataframe(periods=horizon_days, freq="D")
    raw = model.predict(future)

    future_rows = raw.tail(horizon_days)[
        ["ds", "yhat", "yhat_lower", "yhat_upper"]
    ].copy()

    future_rows["yhat"] = future_rows["yhat"].clip(lower=0).round(2)
    future_rows["yhat_lower"] = future_rows["yhat_lower"].clip(lower=0).round(2)
    future_rows["yhat_upper"] = future_rows["yhat_upper"].clip(lower=0).round(2)
    future_rows["ds"] = future_rows["ds"].dt.strftime("%Y-%m-%d")

    return {
        "sku": sku,
        "horizon_days": horizon_days,
        "model_type": "prophet",
        "version": version,
        "trained_at": meta.get("trained_at"),
        "mape": meta.get("mape"),
        "forecast": future_rows.to_dict(orient="records"),
    }