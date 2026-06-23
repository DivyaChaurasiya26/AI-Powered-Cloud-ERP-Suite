import { Request, Response } from "express";

import {
  createWidget,
  getWidgets,
  updateWidget,
  deleteWidget,
  resolveWidgetData,
} from "../services/dashboard.service";

export const addWidget = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const widget = await createWidget(
      user.tenantId,
      req.body
    );

    res.status(201).json({
      message: "Widget created",
      widget,
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const listWidgets = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const dashboardId =
      (req.query.dashboardId as string) || "main";

    const widgets = await getWidgets(
      user.tenantId,
      dashboardId
    );

    res.json({ widgets });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const editWidget = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const widgetId = String(req.params.id);

const widget = await updateWidget(
  user.tenantId,
  widgetId,
  req.body
);

    if (!widget) {
      return res.status(404).json({
        message: "Widget not found",
      });
    }

    res.json({ message: "Widget updated", widget });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeWidget = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const widgetId = String(req.params.id);

    await deleteWidget(user.tenantId, widgetId);

    res.json({ message: "Widget removed" });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getWidgetData = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const { Widget } = await import("../models/widget.model");

    const widget = await Widget.findOne({
      _id: req.params.id,
      tenantId: user.tenantId,
    });

    if (!widget) {
      return res.status(404).json({
        message: "Widget not found",
      });
    }

    const data = await resolveWidgetData(
      user.tenantId,
      widget.dataSource,
      widget.filters
    );

    res.json({ widgetId: widget._id, data });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};