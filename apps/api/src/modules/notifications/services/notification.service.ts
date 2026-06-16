import eventBus from "../../../config/eventBus";

import { Notification } from "../models/notification.model";
import { NotificationPreference } from "../models/notificationPreference.model";
import { emailQueue } from "../queues/email.queue";
import { webhookQueue } from "../queues/webhook.queue";
import { sendToUser } from "./notificationSse.service";

export interface NotificationPayload {
  userId: string;
  tenantId: string;
  eventType: string;
  title: string;
  message: string;
  metadata?: object;
}

export const dispatchNotification = async (
  payload: NotificationPayload
): Promise<void> => {
  const {
    userId,
    tenantId,
    eventType,
    title,
    message,
    metadata = {},
  } = payload;

  const prefs = await NotificationPreference
    .findOne({ userId })
    .lean() as any;

  const eventPrefs = prefs?.[eventType] ?? {
    email: true,
    inApp: true,
    webhook: false,
  };

  // ── In-app channel ──────────────────────────────────────────────
  if (eventPrefs.inApp) {
    const notification = await Notification.create({
      userId,
      tenantId,
      eventType,
      title,
      message,
      channel: "inApp",
      isRead: false,
      metadata,
    });

    sendToUser(userId, "notification", {
      _id: notification._id,
      eventType,
      title,
      message,
      isRead: false,
      metadata,
      createdAt: (notification as any).createdAt,
    });
  }

  // ── Email channel ───────────────────────────────────────────────
  if (eventPrefs.email) {
    const { User } = await import(
      "../../auth/models/user.model"
    );

    const user = await User.findById(userId)
      .select("email")
      .lean() as any;

    if (user?.email) {
      await emailQueue.add(
        "notification-email",
        {
          to: user.email,
          subject: title,
          text: message,
        },
        { attempts: 3 }
      );
    }
  }

  // ── Webhook channel ─────────────────────────────────────────────
  if (eventPrefs.webhook && prefs?.webhookUrl) {
    await webhookQueue.add(
      "notification-webhook",
      {
        url: prefs.webhookUrl,
        payload: {
          eventType,
          title,
          message,
          metadata,
          userId,
          tenantId,
          timestamp: new Date().toISOString(),
        },
      }
    );
  }
};

// Register wildcard listener — catches all "notification.**" events
eventBus.on(
  "notification.**",
  async (payload: NotificationPayload) => {
    try {
      await dispatchNotification(payload);
    } catch (err) {
      console.error(
        "[notification.service] dispatch error:",
        err
      );
    }
  }
);