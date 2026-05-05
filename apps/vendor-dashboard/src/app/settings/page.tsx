"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Alert,
  Topbar,
  Tabs,
  Badge,
  Skeleton,
  SkeletonGroup,
} from "@/components/ui";
import { Copy, Eye, EyeOff, Trash2, Plus } from "lucide-react";

interface ApiKey {
  _id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
  status: "active" | "revoked";
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
  status: "active" | "pending";
  joinedAt: string;
}

interface VendorProfile {
  companyName: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  logo?: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

        // Fetch profile
        const profileRes = await fetch(`${baseUrl}/vendor/profile`, {
          credentials: "include",
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.data || profileData);
        }

        // Fetch API keys
        const keysRes = await fetch(`${baseUrl}/vendor/api-keys`, {
          credentials: "include",
        });
        if (keysRes.ok) {
          const keysData = await keysRes.json();
          setApiKeys(Array.isArray(keysData.data) ? keysData.data : keysData.keys || []);
        }

        // Fetch team members
        const teamRes = await fetch(`${baseUrl}/vendor/team`, {
          credentials: "include",
        });
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeamMembers(
            Array.isArray(teamData.data) ? teamData.data : teamData.members || []
          );
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const toggleKeyReveal = (keyId: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  const maskKey = (key: string) => {
    return key.substring(0, 10) + "..." + key.substring(key.length - 8);
  };

  const tabsContent = [
    { id: "profile", label: "Profile" },
    { id: "api-keys", label: "API Keys", badge: <Badge size="sm">{apiKeys.length}</Badge> },
    { id: "team", label: "Team Members", badge: <Badge size="sm">{teamMembers.length}</Badge> },
    { id: "billing", label: "Billing" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <Topbar title="Settings" subtitle="Manage account & preferences" sticky />
        <div className="p-8 max-w-7xl mx-auto">
          <SkeletonGroup count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <Topbar title="Settings" subtitle="Manage account & preferences" sticky />

      <div className="p-8 max-w-7xl mx-auto">
        {error && (
          <Alert
            variant="error"
            title="Error"
            dismissible
            onClose={() => setError(null)}
            className="mb-6"
          >
            {error}
          </Alert>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Settings</h2>
          </CardHeader>
          <CardContent>
            <Tabs tabs={tabsContent}>
              {(tabId) => {
                if (tabId === "profile") {
                  return (
                    <div className="space-y-6 max-w-2xl">
                      <Input
                        label="Company Name"
                        value={profile?.companyName || ""}
                        readOnly
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={profile?.email || ""}
                        readOnly
                      />
                      <Input
                        label="Phone"
                        value={profile?.phone || ""}
                        readOnly
                      />
                      <Input
                        label="Website"
                        value={profile?.website || ""}
                        readOnly
                      />
                      <Textarea
                        label="Description"
                        value={profile?.description || ""}
                        readOnly
                      />
                      <div className="flex gap-3 pt-4">
                        <Button>Edit Profile</Button>
                        <Button variant="secondary">Change Password</Button>
                      </div>
                    </div>
                  );
                }

                if (tabId === "api-keys") {
                  return (
                    <div className="space-y-4">
                      <Button icon={<Plus size={16} />}>+ Generate New Key</Button>

                      <div className="space-y-3">
                        {apiKeys.length > 0 ? (
                          apiKeys.map((key) => (
                            <Card key={key._id}>
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-neutral-100 font-medium mb-2">
                                      {key.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <code className="text-xs bg-neutral-800 px-2 py-1 rounded font-mono">
                                        {revealedKeys.has(key._id)
                                          ? key.key
                                          : maskKey(key.key)}
                                      </code>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={
                                          revealedKeys.has(key._id) ? (
                                            <EyeOff size={14} />
                                          ) : (
                                            <Eye size={14} />
                                          )
                                        }
                                        onClick={() => toggleKeyReveal(key._id)}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={<Copy size={14} />}
                                        onClick={() => {
                                          navigator.clipboard.writeText(key.key);
                                        }}
                                      />
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-2">
                                      Created {new Date(key.createdAt).toLocaleDateString()}
                                      {key.lastUsedAt &&
                                        ` • Last used ${new Date(
                                          key.lastUsedAt
                                        ).toLocaleDateString()}`}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={
                                        key.status === "active" ? "success" : "error"
                                      }
                                    >
                                      {key.status}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      icon={<Trash2 size={16} />}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="py-8 text-center">
                            <p className="text-neutral-400">No API keys yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                if (tabId === "team") {
                  return (
                    <div className="space-y-4">
                      <Button icon={<Plus size={16} />}>+ Invite Team Member</Button>

                      <div className="space-y-3">
                        {teamMembers.length > 0 ? (
                          teamMembers.map((member) => (
                            <Card key={member._id}>
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-neutral-100 font-medium">
                                      {member.name}
                                    </p>
                                    <p className="text-sm text-neutral-400">
                                      {member.email}
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={
                                        member.role === "admin"
                                          ? "primary"
                                          : member.role === "manager"
                                            ? "info"
                                            : "default"
                                      }
                                    >
                                      {member.role}
                                    </Badge>
                                    <Badge
                                      variant={
                                        member.status === "active"
                                          ? "success"
                                          : "warning"
                                      }
                                    >
                                      {member.status}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      icon={<Trash2 size={16} />}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="py-8 text-center">
                            <p className="text-neutral-400">No team members yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                if (tabId === "billing") {
                  return (
                    <div className="space-y-6 max-w-2xl">
                      <Card>
                        <CardHeader>
                          <h3 className="font-semibold">Current Plan</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-neutral-100 font-medium">Pro Plan</p>
                              <p className="text-sm text-neutral-400">
                                $99/month • Unlimited hospitals & packages
                              </p>
                            </div>
                            <Button variant="secondary">Manage Plan</Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <h3 className="font-semibold">Usage This Month</h3>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <p className="text-neutral-400">API Requests</p>
                            <p className="text-neutral-100 font-medium">
                              45,230 / 1,000,000
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-neutral-400">Deployments</p>
                            <p className="text-neutral-100 font-medium">
                              156 / unlimited
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-neutral-400">Storage</p>
                            <p className="text-neutral-100 font-medium">
                              2.3 GB / 500 GB
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <h3 className="font-semibold">Billing History</h3>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 border-b border-neutral-700">
                              <div>
                                <p className="text-neutral-100">May 2026 Invoice</p>
                                <p className="text-xs text-neutral-400">
                                  Due May 31, 2026
                                </p>
                              </div>
                              <p className="font-medium">$99.00</p>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <div>
                                <p className="text-neutral-100">April 2026 Invoice</p>
                                <p className="text-xs text-neutral-400 text-success-400">
                                  Paid April 30, 2026
                                </p>
                              </div>
                              <p className="font-medium">$99.00</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                }
              }}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
