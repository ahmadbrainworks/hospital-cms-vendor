"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { cpApi } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  Button,
  Topbar,
  Alert,
  Table,
  Tabs,
  Skeleton,
  SkeletonGroup,
  Dropdown,
} from "@/components/ui";
import { Building2, Package, TrendingUp, MoreVertical, Eye, Settings, Trash2 } from "lucide-react";

interface Hospital {
  _id: string;
  name: string;
  city: string;
  state: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

export default function VendorDashboard() {
  const auth = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [stats, setStats] = useState({
    totalHospitals: 0,
    totalPatients: 0,
    activePackages: 0,
    systemHealth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch hospitals
        const hospitalsRes = await cpApi.get<{ success: boolean; data: { results: Hospital[]; total: number } }>(
          "/api/hospitals?page=1&limit=10"
        );
        setHospitals(hospitalsRes.data?.results || []);

        // Fetch stats (if available)
        try {
          const statsRes = await cpApi.get<{ success: boolean; data: any }>("/api/stats/dashboard");
          setStats(statsRes.data || stats);
        } catch {
          // Stats endpoint may not exist yet
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!auth.loading && auth.user) {
      fetchDashboardData();
    }
  }, [auth.loading, auth.user]);

  const tableColumns = [
    { key: "name", label: "Hospital", width: "220px" },
    { key: "location", label: "Location" },
    { key: "status", label: "Status" },
    { key: "created", label: "Created" },
    { key: "actions", label: "" },
  ];

  const tableRows = hospitals.map((h) => ({
    name: h.name,
    location: `${h.city}, ${h.state}`,
    status: (
      <Badge
        variant={h.status === "active" ? "success" : h.status === "pending" ? "warning" : "error"}
      >
        {h.status}
      </Badge>
    ),
    created: new Date(h.createdAt).toLocaleDateString(),
    actions: (
      <Dropdown
        trigger={<Button variant="ghost" size="sm" icon={<MoreVertical size={16} />} />}
        items={[
          {
            id: "view",
            label: "View Hospital",
            icon: <Eye size={16} />,
            onClick: () => (window.location.href = `/hospitals/${h._id}`),
          },
          {
            id: "settings",
            label: "Settings",
            icon: <Settings size={16} />,
            onClick: () => (window.location.href = `/hospitals/${h._id}/settings`),
          },
          {
            id: "delete",
            label: "Remove",
            icon: <Trash2 size={16} />,
            variant: "danger",
            onClick: () => console.log("Remove hospital", h._id),
          },
        ]}
      />
    ),
  }));

  const tabsContent = [
    { id: "overview", label: "Overview" },
    {
      id: "hospitals",
      label: "Hospitals",
      badge: <Badge size="sm">{hospitals.length}</Badge>,
    },
  ];

  const statCards = [
    {
      label: "Active Hospitals",
      value: stats.totalHospitals,
      trend: "+3 this month",
      icon: <Building2 className="w-6 h-6 text-primary-500" />,
    },
    {
      label: "Total Patients",
      value: (stats.totalPatients || 0).toLocaleString(),
      trend: "across all hospitals",
      icon: <Package className="w-6 h-6 text-success-500" />,
    },
    {
      label: "System Health",
      value: `${stats.systemHealth || 99}%`,
      trend: "uptime",
      icon: <TrendingUp className="w-6 h-6 text-info-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-900">
      <Topbar
        title="Vendor Control Panel"
        subtitle="Manage hospitals, packages & deployments"
        rightSlot={
          <Link href="/hospitals/new">
            <Button size="sm">+ New Hospital</Button>
          </Link>
        }
        sticky
      />

      <div className="p-8 max-w-7xl mx-auto">
        {error && <Alert variant="error" title="Error" dismissible onClose={() => setError(null)} className="mb-8">{error}</Alert>}

        {loading ? (
          <SkeletonGroup count={3} layout="horizontal" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.label} hoverable>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-neutral-400 text-sm font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-neutral-100 mt-2">{stat.value}</p>
                      <p className="text-xs text-neutral-400 mt-2">{stat.trend}</p>
                    </div>
                    <div className="opacity-20">{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-neutral-100">Hospital Management</h2>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton count={5} />
            ) : (
              <Tabs tabs={tabsContent}>
                {(tabId) => {
                  if (tabId === "overview") {
                    return hospitals.length > 0 ? (
                      <Table columns={tableColumns} rows={tableRows} hoverable />
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-neutral-400">No hospitals yet. Create your first hospital to get started.</p>
                      </div>
                    );
                  }
                  return (
                    <div>
                      <Link href="/hospitals">
                        <Button variant="secondary" size="sm" className="mb-4">
                          View All Hospitals
                        </Button>
                      </Link>
                      {hospitals.length > 0 ? (
                        <Table columns={tableColumns} rows={tableRows} hoverable />
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-neutral-400">No hospitals assigned yet.</p>
                        </div>
                      )}
                    </div>
                  );
                }}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
