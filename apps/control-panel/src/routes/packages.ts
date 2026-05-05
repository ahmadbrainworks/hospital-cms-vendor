import { Router, Request, Response } from "express";
import type { PackageRegistryService } from "../services/package-registry.service";
import type { PackageAssignmentService } from "../services/package-assignment.service";

export function createPackagesRouter(
  packageRegistry: PackageRegistryService,
  assignmentService: PackageAssignmentService,
): Router {
  const router: Router = Router();

    // Mock packages database
    const packagesDb: Record<string, any> = {
    pkg_1: {
      _id: "pkg_1",
      name: "Patient Alerts v2.1",
      type: "plugin",
      latestVersion: "2.1.0",
      description: "Real-time patient alert monitoring system",
      longDescription: "Comprehensive patient monitoring with alerts, notifications, and escalation workflows",
      status: "stable",
      deployedCount: 22,
      author: "Hospital Systems Team",
      license: "Commercial",
      homepage: "https://hospital-cms.com/packages/alerts",
      repository: "https://github.com/hospital-cms/patient-alerts",
      createdAt: "2025-08-15T10:00:00Z",
      updatedAt: "2026-04-20T14:30:00Z",
      versions: [
        { version: "2.1.0", releaseDate: "2026-04-20", downloads: 245, status: "stable" },
        { version: "2.0.5", releaseDate: "2026-03-15", downloads: 189, status: "stable" },
        { version: "2.0.0", releaseDate: "2026-02-01", downloads: 156, status: "stable" },
      ],
    },
    pkg_2: {
      _id: "pkg_2",
      name: "Reports Module v1.5",
      type: "plugin",
      latestVersion: "1.5.0",
      description: "Advanced reporting and analytics module",
      longDescription: "Generate custom reports with charts, exports, and scheduling",
      status: "stable",
      deployedCount: 18,
      author: "Analytics Team",
      license: "Commercial",
      homepage: "https://hospital-cms.com/packages/reports",
      repository: "https://github.com/hospital-cms/reports",
      createdAt: "2025-06-10T08:00:00Z",
      updatedAt: "2026-03-10T12:00:00Z",
      versions: [
        { version: "1.5.0", releaseDate: "2026-03-10", downloads: 178, status: "stable" },
        { version: "1.4.2", releaseDate: "2026-02-05", downloads: 145, status: "stable" },
      ],
    },
    pkg_3: {
      _id: "pkg_3",
      name: "HL7 FHIR Connector v1.0",
      type: "plugin",
      latestVersion: "1.0.0",
      description: "FHIR R4 compliance and HL7 integration",
      longDescription: "Standards-based healthcare data exchange",
      status: "beta",
      deployedCount: 5,
      author: "Integration Team",
      license: "Open Source",
      homepage: "https://hospital-cms.com/packages/fhir",
      repository: "https://github.com/hospital-cms/fhir",
      createdAt: "2026-01-05T09:00:00Z",
      updatedAt: "2026-04-15T11:00:00Z",
      versions: [
        { version: "1.0.0", releaseDate: "2026-04-15", downloads: 45, status: "beta" },
      ],
    },
  };

  // GET /api/packages - List packages
  router.get("/", (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query["limit"] as string) || 50;
      const offset = parseInt(req.query["offset"] as string) || 0;

      const packages = Object.values(packagesDb);
      const paginated = packages.slice(offset, offset + limit);

      res.json({
        data: paginated,
        total: packages.length,
        limit,
        offset,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  });

  // GET /api/packages/:id - Get package details
  router.get("/:id", (req: Request, res: Response) => {
    try {
      const pkg = packagesDb[req.params["id"]!];

      if (!pkg) {
        return res.status(404).json({ error: "Package not found" });
      }

      res.json({ data: pkg });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch package" });
    }
  });

  // GET /api/packages/:id/deployments - Get deployments for a package
  router.get("/:id/deployments", (req: Request, res: Response) => {
    try {
      const pkg = packagesDb[req.params["id"]!];

      if (!pkg) {
        return res.status(404).json({ error: "Package not found" });
      }

      const deployments = [
        {
          _id: "deploy_1",
          hospitalName: "St. Mary Medical Center",
          hospitalId: "hosp_1",
          version: pkg.latestVersion,
          status: "active",
          deployedAt: "2026-04-18T10:00:00Z",
          updatedAt: "2026-04-18T10:00:00Z",
        },
        {
          _id: "deploy_2",
          hospitalName: "Johnson Hospital",
          hospitalId: "hosp_2",
          version: pkg.latestVersion,
          status: "active",
          deployedAt: "2026-04-15T14:30:00Z",
          updatedAt: "2026-04-15T14:30:00Z",
        },
      ];

      res.json({ data: deployments });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deployments" });
    }
  });

    return router;
}
