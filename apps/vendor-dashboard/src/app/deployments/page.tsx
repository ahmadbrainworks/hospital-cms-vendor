"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Button,
  Input,
  Select,
  Table,
  Badge,
  Card,
  CardContent,
  Alert,
  Topbar,
  Skeleton,
  Dropdown,
} from "@/components/ui";
import { Search, Eye, RotateCw, MoreVertical } from "lucide-react";

interface Deployment {
  _id: string;
  hospitalId: string;
  hospitalName: string;
  packageId: string;
  packageName: string;
  version: string;
  status: "pending" | "in-progress" | "success" | "failed";
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
        const res = await fetch(`${baseUrl}/deployments?limit=200`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch deployments");

        const data = await res.json();
        const deploymentsList = Array.isArray(data.data)
          ? data.data
          : data.deployments || [];
        setDeployments(deploymentsList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load deployments");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeployments();
  }, []);

  const filteredDeployments = useMemo(() => {
    return deployments.filter((d) => {
      const matchesSearch =
        d.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.packageName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deployments, searchQuery, statusFilter]);

  const tableColumns = [
    { key: "hospitalName", label: "Hospital", width: "200px" },
    { key: "packageName", label: "Package" },
    { key: "version", label: "Version" },
    { key: "status", label: "Status" },
    { key: "startedAt", label: "Started" },
    { key: "completedAt", label: "Completed" },
    { key: "actions", label: "" },
  ];

  const tableRows = filteredDeployments.map((d) => ({
    hospitalName: d.hospitalName,
    packageName: d.packageName,
    version: `v${d.version}`,
    status: (
      <Badge
        variant={
          d.status === "success"
            ? "success"
            : d.status === "failed"
              ? "error"
              : d.status === "in-progress"
                ? "warning"
                : "default"
        }
      >
        {d.status}
      </Badge>
    ),
    startedAt: new Date(d.startedAt).toLocaleString(),
    completedAt: d.completedAt ? new Date(d.completedAt).toLocaleString() : "—",
    actions: (
      <Dropdown
        trigger={<Button variant="ghost" size="sm" icon={<MoreVertical size={16} />} />}
        items={[
          {
            id: "view",
            label: "View Details",
            icon: <Eye size={16} />,
            onClick: () => (window.location.href = `/deployments/${d._id}`),
          },
          {
            id: "retry",
            label: "Retry",
            icon: <RotateCw size={16} />,
            onClick: () => console.log("Retry deployment", d._id),
          },
        ]}
      />
    ),
  }));

  const successCount = deployments.filter((d) => d.status === "success").length;
  const failedCount = deployments.filter((d) => d.status === "failed").length;
  const pendingCount = deployments.filter((d) => d.status === "pending").length;
  const inProgressCount = deployments.filter((d) => d.status === "in-progress").length;

  return (
    <div className="min-h-screen bg-neutral-900">
      <Topbar
        title="Deployments"
        subtitle="View all package deployments"
        sticky
      />

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

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-neutral-400 text-sm">Successful</p>
              <p className="text-2xl font-bold mt-1">{successCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-neutral-400 text-sm">Failed</p>
              <p className="text-2xl font-bold mt-1 text-error-400">{failedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-neutral-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold mt-1 text-warning-400">{inProgressCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-neutral-400 text-sm">Pending</p>
              <p className="text-2xl font-bold mt-1">{pendingCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Search deployments"
                placeholder="Search by hospital or package..."
                icon={<Search size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select
                label="Filter by status"
                placeholder="All statuses"
                options={[
                  { value: "success", label: "Successful" },
                  { value: "failed", label: "Failed" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "pending", label: "Pending" },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <Skeleton count={5} />
            </CardContent>
          </Card>
        ) : filteredDeployments.length > 0 ? (
          <Card>
            <CardContent className="pt-6">
              <Table columns={tableColumns} rows={tableRows} hoverable />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="py-12 text-center">
                <p className="text-neutral-400">
                  {searchQuery || statusFilter
                    ? "No deployments match your filters"
                    : "No deployments yet"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-4 text-sm text-neutral-400">
          Showing {filteredDeployments.length} of {deployments.length} deployments
        </div>
      </div>
    </div>
  );
}
