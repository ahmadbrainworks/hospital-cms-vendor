import { Router, Request, Response } from "express";

const router: Router = Router();

// Mock vendor data
const vendorProfile = {
  companyName: "Hospital Systems Inc.",
  email: "contact@hospitalsystems.com",
  phone: "(555) 999-8888",
  website: "https://hospitalsystems.com",
  description: "Leading healthcare software provider",
  logo: "https://via.placeholder.com/200",
};

const apiKeys = [
  {
    _id: "key_1",
    name: "Production API Key",
    key: "sk_live_51234567890abcdef1234567890abcdef",
    createdAt: "2025-06-01T10:00:00Z",
    lastUsedAt: "2026-04-22T14:30:00Z",
    status: "active",
  },
  {
    _id: "key_2",
    name: "Development API Key",
    key: "sk_test_98765432109fedcba98765432109fedcb",
    createdAt: "2025-07-15T09:00:00Z",
    lastUsedAt: "2026-04-20T11:00:00Z",
    status: "active",
  },
  {
    _id: "key_3",
    name: "Staging API Key",
    key: "sk_staging_abcdef1234567890abcdef1234567890",
    createdAt: "2025-08-01T08:00:00Z",
    lastUsedAt: "2026-02-10T15:30:00Z",
    status: "revoked",
  },
];

const teamMembers = [
  {
    _id: "team_1",
    name: "Alice Johnson",
    email: "alice@hospitalsystems.com",
    role: "admin",
    status: "active",
    joinedAt: "2024-05-15T10:00:00Z",
  },
  {
    _id: "team_2",
    name: "Bob Smith",
    email: "bob@hospitalsystems.com",
    role: "manager",
    status: "active",
    joinedAt: "2024-06-20T09:00:00Z",
  },
  {
    _id: "team_3",
    name: "Carol White",
    email: "carol@hospitalsystems.com",
    role: "viewer",
    status: "pending",
    joinedAt: "2026-04-20T14:00:00Z",
  },
];

// GET /api/vendor/profile - Get vendor profile
router.get("/profile", (req: Request, res: Response) => {
  res.json({ data: vendorProfile });
});

// PUT /api/vendor/profile - Update vendor profile
router.put("/profile", (req: Request, res: Response) => {
  try {
    const updated = {
      ...vendorProfile,
      ...req.body,
    };

    res.json({
      data: updated,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to update profile",
    });
  }
});

// GET /api/vendor/api-keys - List API keys
router.get("/api-keys", (req: Request, res: Response) => {
  try {
    // Mask keys in response
    const maskedKeys = apiKeys.map((key) => ({
      ...key,
      key: key.key.substring(0, 10) + "..." + key.key.substring(key.key.length - 8),
    }));

    res.json({ data: maskedKeys });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch API keys" });
  }
});

// POST /api/vendor/api-keys - Generate new API key
router.post("/api-keys", (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const key = {
      _id: `key_${Date.now()}`,
      name,
      key: `sk_live_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString(),
      status: "active",
    };

    res.status(201).json({
      data: key,
      message: "API key created successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create API key",
    });
  }
});

// DELETE /api/vendor/api-keys/:id - Revoke API key
router.delete("/api-keys/:id", (req: Request, res: Response) => {
  try {
    res.json({
      message: "API key revoked successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to revoke API key",
    });
  }
});

// GET /api/vendor/team - List team members
router.get("/team", (req: Request, res: Response) => {
  try {
    res.json({ data: teamMembers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});

// POST /api/vendor/team - Invite team member
router.post("/team", (req: Request, res: Response) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const member = {
      _id: `team_${Date.now()}`,
      name,
      email,
      role,
      status: "pending",
      joinedAt: new Date().toISOString(),
    };

    res.status(201).json({
      data: member,
      message: "Invitation sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to invite member",
    });
  }
});

// DELETE /api/vendor/team/:id - Remove team member
router.delete("/team/:id", (req: Request, res: Response) => {
  try {
    res.json({
      message: "Team member removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to remove member",
    });
  }
});

export default router;
