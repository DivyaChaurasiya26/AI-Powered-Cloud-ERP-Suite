"""
Ensures every model saved/loaded during the test run goes to a throwaway
directory instead of the real ./models store. MODEL_STORE_PATH is read by
model_registry.py at import time, so it must be set before any test module
imports model_registry (directly or via forecaster_prophet/forecaster_lstm/main).
"""

import atexit
import os
import shutil
import tempfile

_test_model_dir = tempfile.mkdtemp(prefix="erp_ml_test_models_")
os.environ["MODEL_STORE_PATH"] = _test_model_dir
atexit.register(lambda: shutil.rmtree(_test_model_dir, ignore_errors=True))
