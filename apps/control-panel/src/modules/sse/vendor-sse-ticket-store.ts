/**
 * Vendor SSE ticket store — short-lived, single-use tokens.
 * Tickets allow EventSource to authenticate without custom headers.
 */
import { randomBytes } from "node:crypto";

export interface SseTicket {
  ticket: string;
  staffId: string;
  expiresAt: Date;
  used: boolean;
}

const tickets = new Map<string, SseTicket>();

// Cleanup expired tickets every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [key, ticket] of tickets.entries()) {
    if (now > ticket.expiresAt) {
      tickets.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function createTicket(staffId: string): string {
  const ticket = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  tickets.set(ticket, {
    ticket,
    staffId,
    expiresAt,
    used: false,
  });

  return ticket;
}

export function consumeTicket(ticket: string): string | null {
  const record = tickets.get(ticket);

  if (!record || record.used || new Date() > record.expiresAt) {
    return null;
  }

  record.used = true;
  return record.staffId;
}
