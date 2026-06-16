import { Request, Response } from "express";

import { Notification } from "../models/notification.model";
import { NotificationPreference } from "../models/notificationPreference.model";
import {
  addNotificationClient,
  removeNotificationClient,
} from "../services/notificationSse.service";

// GET /api/notifications
export const getNotifications = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const notifications = await Notification
      .find({
        userId: user.id,
        tenantId: user.tenantId,
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// PATCH /api/notifications/:id/read
export const markRead = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: user.id,
        },
        { $set: { isRead: true } },
        { new: true }
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.json({
      message: "Marked as read",
      notification,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// POST /api/notifications/read-all
export const markAllRead = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    await Notification.updateMany(
      { userId: user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      message: "All notifications marked as read",
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/notifications/preferences
export const getPreferences = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const prefs = await NotificationPreference
      .findOne({ userId: user.id });

    if (!prefs) {
      return res.json({
        userId: user.id,
        PROJECT_OVERRUN:    { email: true,  inApp: true,  webhook: false },
        LEAVE_APPROVED:     { email: true,  inApp: true,  webhook: false },
        PAYROLL_PROCESSED:  { email: false, inApp: true,  webhook: false },
        LOW_STOCK:          { email: true,  inApp: true,  webhook: false },
        FORECAST_GENERATED: { email: false, inApp: true,  webhook: false },
        webhookUrl: "",
      });
    }

    res.json(prefs);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// PUT /api/notifications/preferences
export const updatePreferences = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const prefs =
      await NotificationPreference.findOneAndUpdate(
        { userId: user.id },
        {
          $set: {
            ...req.body,
            userId: user.id,
            tenantId: user.tenantId,
          },
        },
        { upsert: true, new: true }
      );

    res.json({
      message: "Preferences updated",
      prefs,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/notifications/live  — SSE stream
export const streamNotifications = (
  req: Request,
  res: Response
) => {
  const user = (req as any).user;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  addNotificationClient(user.id, res);

  res.write(
    `event: connected\n` +
    `data: ${JSON.stringify({ message: "Notification stream connected" })}\n\n`
  );

  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 15_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeNotificationClient(user.id);
  });
};