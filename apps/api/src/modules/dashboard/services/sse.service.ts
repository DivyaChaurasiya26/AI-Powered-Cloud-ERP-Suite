import { Response } from "express";

const clients = new Map<string, Set<Response>>();

export const addClient = (
  tenantId: string,
  res: Response
): void => {
  if (!clients.has(tenantId)) {
    clients.set(tenantId, new Set());
  }
  clients.get(tenantId)!.add(res);
};

export const removeClient = (
  tenantId: string,
  res: Response
): void => {
  clients.get(tenantId)?.delete(res);
};

export const broadcast = (
  tenantId: string,
  eventName: string,
  data: any
): void => {
  const tenantClients = clients.get(tenantId);

  if (!tenantClients || tenantClients.size === 0) {
    return;
  }

  const payload =
    `event: ${eventName}\n` +
    `data: ${JSON.stringify(data)}\n\n`;

  tenantClients.forEach((res) => {
    try {
      res.write(payload);
    } catch {
      tenantClients.delete(res);
    }
  });
};

export const broadcastKPIUpdate = (
  tenantId: string,
  data: any
): void => {
  broadcast(tenantId, "kpi_update", {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};