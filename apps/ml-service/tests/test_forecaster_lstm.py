import datetime

import forecaster_lstm


def _synthetic_history(days=70):
    start = datetime.date(2025, 1, 1)
    history = []
    for i in range(days):
        d = start + datetime.timedelta(days=i)
        y = 200 + 15 * (i % 7)
        history.append({"ds": d.isoformat(), "y": y})
    return history


def test_train_requires_at_least_lstm_min_points():
    import pytest

    with pytest.raises(ValueError):
        forecaster_lstm.train("TEST-SKU-LSTM-SHORT", _synthetic_history(days=10))


def test_train_and_predict_end_to_end():
    sku = "TEST-SKU-LSTM-1"
    history = _synthetic_history()

    result = forecaster_lstm.train(sku, history)
    assert result["sku"] == sku
    assert result["model_type"] == "lstm"
    assert result["data_points"] == len(history)

    forecast = forecaster_lstm.predict(sku, history, horizon_days=5)
    assert forecast["sku"] == sku
    assert forecast["model_type"] == "lstm"
    assert len(forecast["forecast"]) == 5
    for row in forecast["forecast"]:
        assert row["yhat"] >= 0
