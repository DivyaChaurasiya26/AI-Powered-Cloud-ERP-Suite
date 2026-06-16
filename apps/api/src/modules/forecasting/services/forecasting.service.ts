import { redis } from "../../../config/redis";

const ML_URL =
  process.env.ML_SERVICE_URL || "http://localhost:8000";

const CACHE_TTL_SECONDS = 3600;

const mlPost = async (
  path: string,
  body: object
): Promise<any> => {
  const res = await fetch(`${ML_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.detail || `ML service ${res.status}`);
  }
  return data;
};

const mlGet = async (path: string): Promise<any> => {
  const res = await fetch(`${ML_URL}${path}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.detail || `ML service ${res.status}`);
  }
  return data;
};

export const checkMLHealth = () =>
  mlGet("/health");

export const callMLTrain = (
  sku: string,
  history: Array<{ ds: string; y: number }>,
  model_type = "auto"
) =>
  mlPost("/train", { sku, history, model_type });

export const callMLPredict = (
  sku: string,
  history: Array<{ ds: string; y: number }>,
  horizon_days = 90,
  model_type = "auto"
) =>
  mlPost("/predict", { sku, history, horizon_days, model_type });

export const callMLModels = () =>
  mlGet("/models");

export const callMLRetrainJob = (
  sku: string,
  history: Array<{ ds: string; y: number }>,
  model_type = "auto"
) =>
  mlPost("/retrain-job", { sku, history, model_type });

export const getCachedForecast = async (
  sku: string
): Promise<any | null> => {
  const raw = await redis.get(`forecast:${sku}`);
  return raw ? JSON.parse(raw) : null;
};

export const cacheForecast = async (
  sku: string,
  data: any
): Promise<void> => {
  await redis.setex(
    `forecast:${sku}`,
    CACHE_TTL_SECONDS,
    JSON.stringify(data)
  );
};

export const invalidateForecastCache = async (
  sku: string
): Promise<void> => {
  await redis.del(`forecast:${sku}`);
};