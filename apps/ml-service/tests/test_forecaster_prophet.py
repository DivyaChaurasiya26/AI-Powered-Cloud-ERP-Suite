"""
Regression test for the forecaster_prophet.py bug: `train()` used to call
`prophet.prophet.Prophet(...)` (an unbound name) instead of `Prophet(...)`,
which raised NameError on every training call. This test trains a real
Prophet model end-to-end and would fail if that bug reappeared.
"""

import datetime

import forecaster_prophet


def _synthetic_history(days=40):
    start = datetime.date(2025, 1, 1)
    history = []
    for i in range(days):
        d = start + datetime.timedelta(days=i)
        y = 100 + 10 * (i % 7) + (5 if i % 7 in (5, 6) else 0)
        history.append({"ds": d.isoformat(), "y": y})
    return history


def test_train_does_not_raise_and_saves_model():
    sku = "TEST-SKU-PROPHET-1"
    result = forecaster_prophet.train(sku, _synthetic_history())

    assert result["sku"] == sku
    assert result["model_type"] == "prophet"
    assert result["version"] == 1
    assert "mape" in result


def test_predict_returns_a_valid_forecast():
    sku = "TEST-SKU-PROPHET-2"
    forecaster_prophet.train(sku, _synthetic_history())

    forecast = forecaster_prophet.predict(sku, horizon_days=7)

    assert forecast["sku"] == sku
    assert forecast["horizon_days"] == 7
    assert len(forecast["forecast"]) == 7
    for row in forecast["forecast"]:
        assert row["yhat"] >= 0
        assert row["yhat_lower"] >= 0
        assert row["yhat_upper"] >= row["yhat_lower"]


def test_train_rejects_insufficient_history():
    import pytest

    with pytest.raises(ValueError):
        forecaster_prophet.train("TEST-SKU-PROPHET-3", [{"ds": "2025-01-01", "y": 10}])
