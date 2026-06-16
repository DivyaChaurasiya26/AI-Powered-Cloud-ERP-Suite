"""
scheduler.py
Redis BLPOP consumer for async retraining jobs.
Run as a separate process: python scheduler.py

Job payload (pushed by Express to Redis list "ml:retrain:jobs"):
{
  "sku": "SKU-001",
  "model_type": "prophet" | "lstm" | "auto",
  "history": [{"ds": "YYYY-MM-DD", "y": 120}, ...]
}
"""

import os
import json
import time
import logging
import redis as redis_lib
import forecaster_prophet
import forecaster_lstm

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [scheduler] %(message)s",
)
logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
JOB_KEY = "ml:retrain:jobs"
RESULT_KEY = "ml:retrain:results"


def run():
    r = redis_lib.from_url(REDIS_URL, decode_responses=True)
    logger.info(f"Scheduler listening on Redis key '{JOB_KEY}'")

    while True:
        try:
            item = r.blpop(JOB_KEY, timeout=5)
            if item is None:
                continue

            _, raw = item
            job = json.loads(raw)
            sku = job.get("sku")
            model_type = job.get("model_type", "prophet")
            history = job.get("history", [])

            if not sku or not history:
                logger.warning(f"Invalid job: {raw[:120]}")
                continue

            logger.info(f"Retraining SKU={sku} model_type={model_type} points={len(history)}")

            if model_type == "lstm":
                result = forecaster_lstm.train(sku, history)
            else:
                result = forecaster_prophet.train(sku, history)

            r.lpush(RESULT_KEY, json.dumps(result))
            logger.info(f"Done: {result}")

        except Exception as e:
            logger.error(f"Scheduler error: {e}", exc_info=True)
            time.sleep(2)


if __name__ == "__main__":
    run()