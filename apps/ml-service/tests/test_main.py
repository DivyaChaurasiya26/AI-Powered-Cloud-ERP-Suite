import datetime

from fastapi.testclient import TestClient

from main import app


def _synthetic_history(days=40):
    start = datetime.date(2025, 1, 1)
    return [
        {"ds": (start + datetime.timedelta(days=i)).isoformat(), "y": 50 + 5 * (i % 7)}
        for i in range(days)
    ]


def test_health_endpoint():
    with TestClient(app) as client:
        res = client.get("/health")
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "ok"
        assert body["service"] == "ml-forecasting"


def test_train_and_predict_via_api():
    with TestClient(app) as client:
        sku = "TEST-SKU-API-1"
        history = _synthetic_history()

        train_res = client.post(
            "/train", json={"sku": sku, "history": history, "model_type": "prophet"}
        )
        assert train_res.status_code == 200
        assert train_res.json()["result"]["sku"] == sku

        predict_res = client.post(
            "/predict", json={"sku": sku, "horizon_days": 5, "model_type": "prophet"}
        )
        assert predict_res.status_code == 200
        assert len(predict_res.json()["forecast"]) == 5


def test_predict_without_training_returns_404():
    with TestClient(app) as client:
        res = client.post(
            "/predict",
            json={"sku": "NEVER-TRAINED-SKU", "horizon_days": 5, "model_type": "prophet"},
        )
        assert res.status_code == 404


def test_models_endpoint_lists_trained_skus():
    with TestClient(app) as client:
        sku = "TEST-SKU-API-2"
        client.post("/train", json={"sku": sku, "history": _synthetic_history(), "model_type": "prophet"})

        res = client.get("/models")
        assert res.status_code == 200
        skus = [m["sku"] for m in res.json()["models"]]
        assert sku in skus


def test_retrain_job_endpoint_degrades_gracefully_without_redis():
    with TestClient(app) as client:
        res = client.post(
            "/retrain-job",
            json={"sku": "TEST-SKU-API-3", "history": _synthetic_history(), "model_type": "prophet"},
        )
        # Either enqueued (a Redis instance is reachable) or a clean 503 if not.
        assert res.status_code in (200, 503)
