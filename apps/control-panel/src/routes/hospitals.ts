import { Router, Request, Response } from "express";
import { Db } from "mongodb";
import { CP_COLLECTIONS } from "../db";
import type { InstanceRecord, LicenseRecord } from "../types";

export function createHospitalsRouter(db: Db): Router {
  const router: Router = Router();

  // GET /api/hospitals - List hospitals with license and heartbeat info
  router.get("/", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query["limit"] as string) || 50;
      const offset = parseInt(req.query["offset"] as string) || 0;

      const instancesCol = db.collection<InstanceRecord>(CP_COLLECTIONS.INSTANCES);
      const licensesCol = db.collection<LicenseRecord>(CP_COLLECTIONS.LICENSES);

      const instances = await instancesCol
        .find({})
        .sort({ registeredAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      const hospitals = await Promise.all(
        instances.map(async (instance) => {
          const license = await licensesCol.findOne({
            instanceId: instance.instanceId,
            revokedAt: null,
            expiresAt: { $gt: new Date() },
          });

          const isHealthy = instance.lastHeartbeatAt
            ? new Date().getTime() - new Date(instance.lastHeartbeatAt).getTime() <
              120000
            : false;

          return {
            _id: instance._id,
            instanceId: instance.instanceId,
            hospitalName: instance.hospitalName,
            hospitalSlug: instance.hospitalSlug,
            licenseStatus: license ? "active" : "inactive",
            licenseTier: license?.tier || null,
            licenseExpiresAt: license?.expiresAt || null,
            agentVersion: instance.agentVersion,
            lastHeartbeat: instance.lastHeartbeatAt,
            isHealthy,
            networkQuality: instance.networkQuality,
            cpuPercent: instance.metrics?.cpuPercent || 0,
            memoryPercent: instance.metrics?.memoryPercent || 0,
            diskPercent: instance.metrics?.diskPercent || 0,
            registeredAt: instance.registeredAt,
          };
        })
      );

      const total = await instancesCol.countDocuments({});

      res.json({
        data: hospitals,
        total,
        limit,
        offset,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch hospitals",
      });
    }
  });

  // GET /api/hospitals/:id - Get hospital details with full context
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const instancesCol = db.collection<InstanceRecord>(CP_COLLECTIONS.INSTANCES);
      const licensesCol = db.collection<LicenseRecord>(CP_COLLECTIONS.LICENSES);
      const assignmentsCol = db.collection(CP_COLLECTIONS.PACKAGE_ASSIGNMENTS);

      const instance = await instancesCol.findOne({ instanceId: req.params["id"] });

      if (!instance) {
        return res.status(404).json({ error: "Hospital not found" });
      }

      const license = await licensesCol.findOne({
        instanceId: instance.instanceId,
        revokedAt: null,
      });

      const assignments = await assignmentsCol
        .find({ instanceId: instance.instanceId })
        .toArray();

      res.json({
        data: {
          ...instance,
          license: license || null,
          packages: assignments,
          healthStatus: instance.lastHeartbeatAt
            ? new Date().getTime() - new Date(instance.lastHeartbeatAt).getTime() < 120000
              ? "healthy"
              : "degraded"
            : "offline",
        },
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch hospital",
      });
    }
  });

  // GET /api/hospitals/:id/packages - Get hospital's assigned packages
  router.get("/:id/packages", async (req: Request, res: Response) => {
    try {
      const instancesCol = db.collection<InstanceRecord>(CP_COLLECTIONS.INSTANCES);
      const assignmentsCol = db.collection(CP_COLLECTIONS.PACKAGE_ASSIGNMENTS);

      const instance = await instancesCol.findOne({
        instanceId: req.params["id"],
      });

      if (!instance) {
        return res.status(404).json({ error: "Hospital not found" });
      }

      const packages = await assignmentsCol
        .find({ instanceId: instance.instanceId })
        .sort({ assignedAt: -1 })
        .toArray();

      res.json({ data: packages });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch packages",
      });
    }
  });

  // GET /api/hospitals/:id/usage - Get hospital usage metrics from metrics
  router.get("/:id/usage", async (req: Request, res: Response) => {
    try {
      const instancesCol = db.collection<InstanceRecord>(CP_COLLECTIONS.INSTANCES);

      const instance = await instancesCol.findOne({
        instanceId: req.params["id"],
      });

      if (!instance) {
        return res.status(404).json({ error: "Hospital not found" });
      }

      const usage = {
        cpuUsage: instance.metrics?.cpuPercent || 0,
        memoryUsage: instance.metrics?.memoryPercent || 0,
        diskUsage: instance.metrics?.diskPercent || 0,
        activeEncounters: instance.metrics?.activeEncounters || 0,
        totalPatients: instance.metrics?.totalPatients || 0,
        uptimeSeconds: instance.metrics?.uptimeSeconds || 0,
        lastUpdated: instance.metrics?.reportedAt || new Date().toISOString(),
      };

      res.json({ data: usage });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch usage data",
      });
    }
  });

  return router;
}

export default createHospitalsRouter;
