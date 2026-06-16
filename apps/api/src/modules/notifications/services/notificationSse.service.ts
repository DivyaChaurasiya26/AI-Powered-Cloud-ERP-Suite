import { Response } from "express";

// Per-user SSE map. Keyed by userId (string).
// Different from dashboard/services/sse.service.ts which is keyed by tenantId.

const clients = new Map<string, Response>();

export const addNotificationClient = (
  userId: string,
  res: Response
): void => {
  clients.set(userId, res);
};

export const removeNotificationClient = (
  userId: string
): void => {
  clients.delete(userId);
};

export const sendToUser = (
  userId: string,
  eventName: string,
  data: any
): void => {
  const res = clients.get(userId);

  if (!res) {
    return;
  }

  const payload =
    `event: ${eventName}\n` +
    `data: ${JSON.stringify(data)}\n\n`;

  try {
    res.write(payload);
  } catch {
    clients.delete(userId);
  }
};