/**
 * Vendor SSE manager — per-staff broadcasts.
 * Emits events to all connected vendor dashboard users.
 */
import type { Response } from "express";

export interface VendorSseClient {
  staffId: string;
  res: Response;
  connectedAt: Date;
}

const clients = new Map<string, VendorSseClient[]>(); // key: staffId

export function sseConnect(
  staffId: string,
  res: Response,
): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const client: VendorSseClient = { staffId, res, connectedAt: new Date() };

  // Store client
  if (!clients.has(staffId)) {
    clients.set(staffId, []);
  }
  clients.get(staffId)!.push(client);

  // Heartbeat every 25s
  const heartbeat = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(heartbeat);
      const list = clients.get(staffId);
      if (list) {
        const idx = list.indexOf(client);
        if (idx >= 0) list.splice(idx, 1);
      }
      return;
    }
    res.write(": heartbeat\n\n");
  }, 25_000);

  res.on("close", () => {
    clearInterval(heartbeat);
    const list = clients.get(staffId);
    if (list) {
      const idx = list.indexOf(client);
      if (idx >= 0) list.splice(idx, 1);
    }
  });

  // Send initial connected event
  pushToClient(client, "connected", { message: "Vendor SSE stream established" });
}

export function pushToStaff(
  staffId: string,
  event: string,
  data: unknown,
): void {
  const staffClients = clients.get(staffId);
  if (!staffClients) return;

  for (const client of staffClients) {
    if (!client.res.writableEnded) {
      pushToClient(client, event, data);
    }
  }
}

export function broadcastToAllVendor(
  event: string,
  data: unknown,
): void {
  for (const staffClients of clients.values()) {
    for (const client of staffClients) {
      if (!client.res.writableEnded) {
        pushToClient(client, event, data);
      }
    }
  }
}

function pushToClient(client: VendorSseClient, event: string, data: unknown): void {
  try {
    client.res.write(`event: ${event}\n`);
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  } catch {
    // Connection dropped
  }
}

export function getConnectionCount(staffId: string): number {
  return clients.get(staffId)?.length ?? 0;
}
