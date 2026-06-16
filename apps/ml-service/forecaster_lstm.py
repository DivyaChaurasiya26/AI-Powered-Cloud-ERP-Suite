"""
forecaster_lstm.py
PyTorch LSTM forecasting for high-volume SKUs (>= 60 data points).
"""

import logging
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
from model_registry import save_lstm, load_lstm, lstm_meta

logger = logging.getLogger(__name__)

LSTM_MIN_POINTS = 60
LOOK_BACK = 30
HIDDEN_SIZE = 64
NUM_LAYERS = 2
DROPOUT = 0.2
EPOCHS = 50
BATCH_SIZE = 16
LEARNING_RATE = 0.001


class DemandLSTM(nn.Module):
    def __init__(self, input_size=1, hidden_size=HIDDEN_SIZE,
                 num_layers=NUM_LAYERS, output_size=1, dropout=DROPOUT):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size, hidden_size, num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])


def _build_sequences(data: np.ndarray, look_back: int):
    X, y = [], []
    for i in range(len(data) - look_back):
        X.append(data[i: i + look_back])
        y.append(data[i + look_back])
    return np.array(X), np.array(y)


def _compute_mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    mask = y_true > 0
    if not mask.any():
        return 0.0
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)


def train(sku: str, history: list) -> dict:
    """
    Train LSTM for a high-volume SKU.
    Requires >= 60 data points. Use Prophet for smaller datasets.
    """
    if len(history) < LSTM_MIN_POINTS:
        raise ValueError(
            f"LSTM requires >= {LSTM_MIN_POINTS} data points, got {len(history)}. "
            f"Use Prophet for smaller datasets."
        )

    df = pd.DataFrame(history)
    df["ds"] = pd.to_datetime(df["ds"])
    df["y"] = pd.to_numeric(df["y"], errors="coerce").fillna(0).clip(lower=0)
    df = df.sort_values("ds").reset_index(drop=True)

    values = df["y"].values.reshape(-1, 1).astype(np.float32)
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(values)

    X, y = _build_sequences(scaled, LOOK_BACK)
    X_t = torch.tensor(X, dtype=torch.float32)
    y_t = torch.tensor(y, dtype=torch.float32)

    dataset = torch.utils.data.TensorDataset(X_t, y_t)
    loader = torch.utils.data.DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)

    model = DemandLSTM()
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)

    model.train()
    for epoch in range(EPOCHS):
        for xb, yb in loader:
            optimizer.zero_grad()
            pred = model(xb)
            loss = criterion(pred, yb)
            loss.backward()
            optimizer.step()

    model.eval()
    with torch.no_grad():
        preds_scaled = model(X_t).numpy()
    preds = scaler.inverse_transform(preds_scaled).flatten()
    actuals = scaler.inverse_transform(y).flatten()
    mape = _compute_mape(actuals, preds)

    meta = {
        "sku": sku,
        "model_type": "lstm",
        "data_points": len(df),
        "look_back": LOOK_BACK,
        "epochs": EPOCHS,
        "mape": round(mape, 2),
        "trained_at": pd.Timestamp.utcnow().isoformat(),
    }

    return save_lstm(sku, model.state_dict(), scaler, meta)


def predict(sku: str, history: list, horizon_days: int = 90) -> dict:
    """
    Forecast using LSTM autoregressive rollout.
    history: recent data points — needs >= LOOK_BACK (30) points.
    """
    state, scaler, version = load_lstm(sku, DemandLSTM)
    model = DemandLSTM()
    model.load_state_dict(state)
    model.eval()

    meta = lstm_meta(sku)

    df = pd.DataFrame(history)
    df["ds"] = pd.to_datetime(df["ds"])
    df["y"] = pd.to_numeric(df["y"], errors="coerce").fillna(0).clip(lower=0)
    df = df.sort_values("ds").reset_index(drop=True)

    if len(df) < LOOK_BACK:
        raise ValueError(
            f"Need >= {LOOK_BACK} history points for LSTM prediction, got {len(df)}"
        )

    values = df["y"].values[-LOOK_BACK:].reshape(-1, 1).astype(np.float32)
    scaled_seed = scaler.transform(values)
    window = scaled_seed.copy()
    forecasts = []
    last_date = df["ds"].iloc[-1]

    with torch.no_grad():
        for i in range(horizon_days):
            x = torch.tensor(window.reshape(1, LOOK_BACK, 1), dtype=torch.float32)
            pred_scaled = model(x).numpy()
            pred_val = float(scaler.inverse_transform(pred_scaled)[0][0])
            pred_val = max(0.0, round(pred_val, 2))
            step_date = last_date + pd.Timedelta(days=i + 1)
            forecasts.append({
                "ds": step_date.strftime("%Y-%m-%d"),
                "yhat": pred_val,
            })
            window = np.vstack([window[1:], pred_scaled])

    return {
        "sku": sku,
        "horizon_days": horizon_days,
        "model_type": "lstm",
        "version": version,
        "trained_at": meta.get("trained_at"),
        "mape": meta.get("mape"),
        "forecast": forecasts,
    }