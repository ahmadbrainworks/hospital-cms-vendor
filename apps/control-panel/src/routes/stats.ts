import { Router, Request, Response } from "express";

const router = Router();

// GET /api/stats/dashboard - Get vendor dashboard statistics
router.get("/dashboard", (req: Request, res: Response) => {
  try {
    const stats = {
      totalHospitals: 24,
      totalPatients: 45230,
      activePackages: 8,
      systemHealth: 99,
      totalDeployments: 156,
      successfulDeployments: 151,
      failedDeployments: 3,
      averageDeploymentTime: 285, // seconds
    };

    res.json({ data: stats });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
