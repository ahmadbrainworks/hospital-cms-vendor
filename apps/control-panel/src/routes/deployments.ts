import { Router, Request, Response } from "express";

const router: Router = Router();

// Mock deployments database
const deploymentsDb: Record<string, any> = {
  deploy_1: {
    _id: "deploy_1",
    hospitalId: "hosp_1",
    hospitalName: "St. Mary Medical Center",
    packageId: "pkg_1",
    packageName: "Patient Alerts v2.1",
    version: "2.1.0",
    status: "success",
    startedAt: "2026-04-18T10:00:00Z",
    completedAt: "2026-04-18T10:05:00Z",
  },
  deploy_2: {
    _id: "deploy_2",
    hospitalId: "hosp_2",
    hospitalName: "Johnson Hospital",
    packageId: "pkg_1",
    packageName: "Patient Alerts v2.1",
    version: "2.1.0",
    status: "success",
    startedAt: "2026-04-15T14:30:00Z",
    completedAt: "2026-04-15T14:35:00Z",
  },
  deploy_3: {
    _id: "deploy_3",
    hospitalId: "hosp_3",
    hospitalName: "City Health Clinic",
    packageId: "pkg_2",
    packageName: "Reports Module v1.5",
    version: "1.5.0",
    status: "success",
    startedAt: "2026-04-12T09:00:00Z",
    completedAt: "2026-04-12T09:08:00Z",
  },
  deploy_4: {
    _id: "deploy_4",
    hospitalId: "hosp_1",
    hospitalName: "St. Mary Medical Center",
    packageId: "pkg_2",
    packageName: "Reports Module v1.5",
    version: "1.5.0",
    status: "in-progress",
    startedAt: "2026-04-22T11:00:00Z",
  },
  deploy_5: {
    _id: "deploy_5",
    hospitalId: "hosp_2",
    hospitalName: "Johnson Hospital",
    packageId: "pkg_3",
    packageName: "HL7 FHIR Connector v1.0",
    version: "1.0.0",
    status: "failed",
    startedAt: "2026-04-20T15:00:00Z",
    completedAt: "2026-04-20T15:02:00Z",
    errorMessage: "Incompatible system version. Requires Node.js 18+",
  },
};

// GET /api/deployments - List deployments
router.get("/", (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query["limit"] as string) || 200;
    const offset = parseInt(req.query["offset"] as string) || 0;
    const status = req.query["status"] as string;

    let deployments = Object.values(deploymentsDb);

    if (status) {
      deployments = deployments.filter((d) => d.status === status);
    }

    const paginated = deployments.slice(offset, offset + limit);

    res.json({
      data: paginated,
      total: deployments.length,
      limit,
      offset,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch deployments" });
  }
});

// GET /api/deployments/:id - Get deployment details
router.get("/:id", (req: Request, res: Response) => {
  try {
    const deployment = deploymentsDb[req.params["id"]!];

    if (!deployment) {
      return res.status(404).json({ error: "Deployment not found" });
    }

    res.json({ data: deployment });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch deployment" });
  }
});

// POST /api/deployments/:id/retry - Retry failed deployment
router.post("/:id/retry", (req: Request, res: Response) => {
  try {
    const deployment = deploymentsDb[req.params["id"]!];

    if (!deployment) {
      return res.status(404).json({ error: "Deployment not found" });
    }

    const retried = {
      ...deployment,
      status: "pending",
      startedAt: new Date().toISOString(),
    };

    deploymentsDb[req.params["id"]!] = retried;

    res.json({
      data: retried,
      message: "Deployment retry initiated",
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to retry deployment",
    });
  }
});

export default router;
