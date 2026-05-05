"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
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
import { Search, Eye, Download, Copy, MoreVertical, Plus } from "lucide-react";

interface Package {
  _id: string;
  name: string;
  type: string;
  latestVersion: string;
  description: string;
  status: "stable" | "beta" | "deprecated";
  deployedCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
        const res = await fetch(`${baseUrl}/packages?limit=100`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch packages");

        const data = await res.json();
        const packagesList = Array.isArray(data.data) ? data.data : data.packages || [];
        setPackages(packagesList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load packages");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const filteredPackages = useMemo(() => {
    return packages.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !typeFilter || p.type === typeFilter;
      const matchesStatus = !statusFilter || p.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [packages, searchQuery, typeFilter, statusFilter]);

  const uniqueTypes = [...new Set(packages.map((p) => p.type))];

  const tableColumns = [
    { key: "name", label: "Package", width: "200px" },
    { key: "type", label: "Type" },
    { key: "latestVersion", label: "Latest Version" },
    { key: "status", label: "Status" },
    { key: "deployedCount", label: "Deployments" },
    { key: "updated", label: "Updated" },
    { key: "actions", label: "" },
  ];

  const tableRows = filteredPackages.map((p) => ({
    name: p.name,
    type: p.type,
    latestVersion: `v${p.latestVersion}`,
    status: (
      <Badge
        variant={
          p.status === "stable"
            ? "success"
            : p.status === "beta"
              ? "warning"
              : "error"
        }
      >
        {p.status}
      </Badge>
    ),
    deployedCount: p.deployedCount.toLocaleString(),
    updated: new Date(p.updatedAt).toLocaleDateString(),
    actions: (
      <Dropdown
        trigger={<Button variant="ghost" size="sm" icon={<MoreVertical size={16} />} />}
        items={[
          {
            id: "view",
            label: "View Details",
            icon: <Eye size={16} />,
            onClick: () => (window.location.href = `/packages/${p._id}`),
          },
          {
            id: "download",
            label: "Download",
            icon: <Download size={16} />,
            onClick: () => console.log("Download package", p._id),
          },
          {
            id: "copy-id",
            label: "Copy Package ID",
            icon: <Copy size={16} />,
            onClick: () => {
              navigator.clipboard.writeText(p._id);
            },
          },
        ]}
      />
    ),
  }));

  return (
    <div className="min-h-screen bg-neutral-900">
      <Topbar
        title="Packages"
        subtitle="Manage deployable packages"
        rightSlot={
          <Link href="/packages/new">
            <Button icon={<Plus size={16} />}>+ Create Package</Button>
          </Link>
        }
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

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Search packages"
                placeholder="Search by name or description..."
                icon={<Search size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select
                label="Filter by type"
                placeholder="All types"
                options={uniqueTypes.map((t) => ({ value: t, label: t }))}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              />

              <Select
                label="Filter by status"
                placeholder="All statuses"
                options={[
                  { value: "stable", label: "Stable" },
                  { value: "beta", label: "Beta" },
                  { value: "deprecated", label: "Deprecated" },
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
        ) : filteredPackages.length > 0 ? (
          <Card>
            <CardContent className="pt-6">
              <Table columns={tableColumns} rows={tableRows} hoverable />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="py-12 text-center">
                <p className="text-neutral-400 mb-4">
                  {searchQuery || typeFilter || statusFilter
                    ? "No packages match your filters"
                    : "No packages yet"}
                </p>
                {!searchQuery && !typeFilter && !statusFilter && (
                  <Link href="/packages/new">
                    <Button>Create First Package</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-4 text-sm text-neutral-400">
          Showing {filteredPackages.length} of {packages.length} packages
        </div>
      </div>
    </div>
  );
}
