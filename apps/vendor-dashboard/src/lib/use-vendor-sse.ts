"use client";

import { useEffect, useRef, useCallback } from "react";

const API_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_CP_API_URL ?? "http://localhost:4001")
    : "";

export interface SseEvent<T = unknown> {
  type: string;
  data: T;
}

type Handler<T = unknown> = (event: SseEvent<T>) => void;

/**
 * Opens an SSE connection to /api/vendor/sse and calls `onEvent` for every
 * named event received. Reconnects automatically with exponential backoff.
 */
export function useVendorSse(onEvent: Handler, enabled = true): void {
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef(1000);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(async () => {
    if (!enabled) return;

    try {
      // Get access token from localStorage or session
      const token = typeof window !== "undefined"
        ? localStorage.getItem("vendorToken")
        : null;

      if (!token) return;

      // Exchange JWT for a short-lived SSE ticket
      const ticketRes = await fetch(`${API_URL}/api/vendor/sse/ticket`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!ticketRes.ok) {
        throw new Error(`Ticket exchange failed: ${ticketRes.status}`);
      }

      const ticketData = (await ticketRes.json()) as { success: boolean; data: { ticket: string } };
      const ticket = ticketData.data.ticket;

      // Open SSE connection with ticket
      const url = `${API_URL}/api/vendor/sse?ticket=${encodeURIComponent(ticket)}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.onopen = () => {
        retryRef.current = 1000; // reset backoff
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        setTimeout(connect, Math.min(retryRef.current, 30_000));
        retryRef.current = Math.min(retryRef.current * 2, 30_000);
      };

      // Listen to vendor events
      const eventTypes = [
        "connected",
        "instance.heartbeat",
        "package.status.changed",
        "assignment.updated",
      ];

      for (const type of eventTypes) {
        es.addEventListener(type, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEventRef.current({ type, data });
          } catch {
            // ignore malformed events
          }
        });
      }
    } catch (err) {
      console.warn("Vendor SSE ticket exchange failed, will retry:", err);
      setTimeout(connect, Math.min(retryRef.current, 30_000));
      retryRef.current = Math.min(retryRef.current * 2, 30_000);
    }
  }, [enabled]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [connect]);
}
