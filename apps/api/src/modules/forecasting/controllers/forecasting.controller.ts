import { Request, Response } from "express";

import {
  checkMLHealth,
  callMLTrain,
  callMLPredict,
  callMLModels,
  getCachedForecast,
  cacheForecast,
} from "../services/forecasting.service";

import { forecastingQueue } from "../queues/forecasting.queue";

export const mlHealth = async (
  req: Request,
  res: Response
) => {
  try {
    const health = await checkMLHealth();
    res.json(health);
  } catch (error: any) {
    res.status(503).json({
      message: "ML service unreachable",
      detail: error.message,
    });
  }
};

export const trainModel = async (
  req: Request,
  res: Response
) => {
  try {
    const { sku, history, model_type } = req.body;

    if (!sku || !Array.isArray(history) || history.length < 2) {
      return res.status(400).json({
        message: "sku and history (min 2 points) required",
      });
    }

    const result = await callMLTrain(
      sku,
      history,
      model_type || "auto"
    );

    res.status(201).json(result);

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const predict = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      sku,
      history = [],
      horizon_days = 90,
      model_type = "auto",
    } = req.body;

    if (!sku) {
      return res.status(400).json({ message: "sku is required" });
    }

    const cached = await getCachedForecast(sku);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const result = await callMLPredict(
      sku,
      history,
      horizon_days,
      model_type
    );

    await cacheForecast(sku, result);

    res.json({ ...result, cached: false });

  } catch (error: any) {
    const status = error.message?.includes("No model") ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const getModels = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await callMLModels();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const scheduleRetrain = async (
  req: Request,
  res: Response
) => {
  try {
    const { sku, history, model_type } = req.body;

    if (!sku || !Array.isArray(history) || history.length < 2) {
      return res.status(400).json({
        message: "sku and history (min 2 points) required",
      });
    }

    await forecastingQueue.add(
      "retrain",
      {
        action: "retrain",
        sku,
        history,
        model_type: model_type || "auto",
      },
      { attempts: 3 }
    );

    res.status(202).json({
      message: "Retraining job queued",
      sku,
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};