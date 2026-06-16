import { createHmac } from "node:crypto";

const WEBHOOK_SECRET =
  process.env.WEBHOOK_SECRET || "default-secret";

export const signPayload = (
  body: string
): string => {
  return createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
};

export const deliverWebhook = async (
  url: string,
  payload: object
): Promise<void> => {
  const body = JSON.stringify(payload);
  const signature = signPayload(body);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Signature-SHA256": signature,
      "X-Timestamp": Date.now().toString(),
    },
    body,
  });

  if (!res.ok) {
    throw new Error(
      `Webhook delivery failed: ${res.status} ${res.statusText} to ${url}`
    );
  }
};