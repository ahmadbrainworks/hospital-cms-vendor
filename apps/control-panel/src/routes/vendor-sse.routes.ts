/**
 * Vendor SSE routes — real-time updates for vendor dashboard.
 */
import { Router, Request, Response, NextFunction } from "express";
import { sseConnect, pushToStaff } from "../modules/sse/vendor-sse-manager";
import { createTicket, consumeTicket } from "../modules/sse/vendor-sse-ticket-store";
import { requireVendorAuth } from "../middleware/vendor-auth";

export function vendorSseRouter(): Router {
  const router = Router();

  /**
   * POST /api/vendor/sse/ticket
   * Exchange JWT for a short-lived ticket that EventSource can use.
   */
  router.post(
    "/ticket",
    requireVendorAuth(),
    async (req: Request, res: Response, _next: NextFunction) => {
      const staffId = (req as any).staffId as string;
      const ticket = createTicket(staffId);

      res.json({
        success: true,
        data: { ticket },
      });
    },
  );

  /**
   * GET /api/vendor/sse
   * Open SSE stream — client must provide ticket via query param.
   */
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = req.query.ticket as string | undefined;

      if (!ticket) {
        return res.status(400).json({ error: "ticket query param required" });
      }

      const staffId = consumeTicket(ticket);
      if (!staffId) {
        return res.status(401).json({ error: "Invalid or expired ticket" });
      }

      sseConnect(staffId, res);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

/**
 * Helper to broadcast events to a specific staff member.
 * Call this from services that need to push real-time updates.
 */
export function broadcastToVendorStaff(
  staffId: string,
  event: string,
  data: unknown,
): void {
  pushToStaff(staffId, event, data);
}
