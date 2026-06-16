"""
model_registry.py
File-based model versioning. Each SKU gets its own versioned folder.

Structure:
  models/
    <sku>/
      prophet/
        v1.pkl   v1.meta.json
        v2.pkl   v2.meta.json
      lstm/
        v1.pt    v1.meta.json
"""

import os
import json
import pickle
import logging
from pathlib import Path
from datetime import datetime

import torch

logger = logging.getLogger(__name__)

MODEL_STORE = Path(os.getenv("MODEL_STORE_PATH", "./models"))
MODEL_STORE.mkdir(parents=True, exist_ok=True)


def _safe_sku(sku: str) -> str:
    return sku.replace("/", "_").replace(" ", "_")


def _sku_dir(sku: str, model_type: str) -> Path:
    d = MODEL_STORE / _safe_sku(sku) / model_type
    d.mkdir(parents=True, exist_ok=True)
    return d


def _next_version(directory: Path, ext: str) -> int:
    existing = list(directory.glob(f"v*.{ext}"))
    if not existing:
        return 1
    versions = [int(p.stem[1:]) for p in existing if p.stem[1:].isdigit()]
    return max(versions) + 1 if versions else 1


def _latest_version(directory: Path, ext: str):
    existing = list(directory.glob(f"v*.{ext}"))
    if not existing:
        return None
    versions = [int(p.stem[1:]) for p in existing if p.stem[1:].isdigit()]
    return max(versions) if versions else None


# ── Prophet ───────────────────────────────────────────────────────────────────

def save_prophet(sku: str, model, meta: dict) -> dict:
    d = _sku_dir(sku, "prophet")
    v = _next_version(d, "pkl")
    with open(d / f"v{v}.pkl", "wb") as f:
        pickle.dump(model, f)
    meta["version"] = v
    meta["saved_at"] = datetime.utcnow().isoformat()
    with open(d / f"v{v}.meta.json", "w") as f:
        json.dump(meta, f, indent=2)
    logger.info(f"Prophet model saved: SKU={sku} version=v{v}")
    return meta


def load_prophet(sku: str, version=None):
    d = _sku_dir(sku, "prophet")
    v = version or _latest_version(d, "pkl")
    if v is None:
        raise FileNotFoundError(f"No Prophet model for SKU={sku}")
    path = d / f"v{v}.pkl"
    if not path.exists():
        raise FileNotFoundError(f"Prophet model v{v} not found for SKU={sku}")
    with open(path, "rb") as f:
        return pickle.load(f), v


def prophet_meta(sku: str, version=None) -> dict:
    d = _sku_dir(sku, "prophet")
    v = version or _latest_version(d, "pkl")
    if v is None:
        return {}
    meta_path = d / f"v{v}.meta.json"
    if not meta_path.exists():
        return {}
    with open(meta_path) as f:
        return json.load(f)


def prophet_exists(sku: str) -> bool:
    d = _sku_dir(sku, "prophet")
    return _latest_version(d, "pkl") is not None


# ── LSTM ──────────────────────────────────────────────────────────────────────

def save_lstm(sku: str, model_state: dict, scaler, meta: dict) -> dict:
    d = _sku_dir(sku, "lstm")
    v = _next_version(d, "pt")
    torch.save(model_state, d / f"v{v}.pt")
    with open(d / f"v{v}.scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)
    meta["version"] = v
    meta["saved_at"] = datetime.utcnow().isoformat()
    with open(d / f"v{v}.meta.json", "w") as f:
        json.dump(meta, f, indent=2)
    logger.info(f"LSTM model saved: SKU={sku} version=v{v}")
    return meta


def load_lstm(sku: str, model_class, version=None):
    d = _sku_dir(sku, "lstm")
    v = version or _latest_version(d, "pt")
    if v is None:
        raise FileNotFoundError(f"No LSTM model for SKU={sku}")
    state = torch.load(d / f"v{v}.pt", map_location="cpu")
    with open(d / f"v{v}.scaler.pkl", "rb") as f:
        scaler = pickle.load(f)
    return state, scaler, v


def lstm_exists(sku: str) -> bool:
    d = _sku_dir(sku, "lstm")
    return _latest_version(d, "pt") is not None


def lstm_meta(sku: str, version=None) -> dict:
    d = _sku_dir(sku, "lstm")
    v = version or _latest_version(d, "pt")
    if v is None:
        return {}
    meta_path = d / f"v{v}.meta.json"
    if not meta_path.exists():
        return {}
    with open(meta_path) as f:
        return json.load(f)


# ── List all models ───────────────────────────────────────────────────────────

def list_all_models() -> list:
    results = []
    if not MODEL_STORE.exists():
        return results
    for sku_dir in MODEL_STORE.iterdir():
        if not sku_dir.is_dir():
            continue
        sku = sku_dir.name
        entry = {"sku": sku, "prophet": None, "lstm": None}
        p_meta = prophet_meta(sku)
        if p_meta:
            entry["prophet"] = p_meta
        l_meta = lstm_meta(sku)
        if l_meta:
            entry["lstm"] = l_meta
        results.append(entry)
    return results