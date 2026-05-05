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
import { Search, Eye, Settings, Trash2, MoreVertical } from "lucide-react";

interface Hospital {
  _id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  patientCount: number;
  status: "active" | "inactive" | "pending";
  licenseExpiry?: string;
  createdAt: string;
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
        const res = await fetch(`${baseUrl}/hospitals?limit=100`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch hospitals");

        const data = await res.json();
        const hospitalsList = Array.isArray(data.data) ? data.data : data.hospitals || [];
        setHospitals(hospitalsList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load hospitals");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const matchesSearch =
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.state.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || h.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [hospitals, searchQuery, statusFilter]);

  const tableColumns = [
    { key: "name", label: "Hospital Name", width: "240px" },
    { key: "location", label: "Location" },
    { key: "patientCount", label: "Patients" },
    { key: "status", label: "Status" },
    { key: "created", label: "Created" },
    { key: "actions", label: "" },
  ];

  const tableRows = filteredHospitals.map((h) => ({
    name: h.name,
    location: `${h.city}, ${h.state}, ${h.country}`,
    patientCount: h.patientCount.toLocaleString(),
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
            label: "View Details",
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
            label: "Remove Hospital",
            icon: <Trash2 size={16} />,
            variant: "danger",
            onClick: () => {
              if (confirm(`Remove ${h.name}?`)) {
                console.log("Remove hospital", h._id);
              }
            },
          },
        ]}
      />
    ),
  }));

  return (
    <div className="min-h-screen bg-neutral-900">
      <Topbar
        title="Hospitals"
        subtitle="Manage all hospital instances"
        rightSlot={
          <Link href="/hospitals/new">
            <Button>+ Add Hospital</Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Search hospitals"
                placeholder="Search by name, city, or state..."
                icon={<Search size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select
                label="Filter by status"
                placeholder="All statuses"
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "pending", label: "Pending Setup" },
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
        ) : filteredHospitals.length > 0 ? (
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
                  {searchQuery || statusFilter
                    ? "No hospitals match your filters"
                    : "No hospitals yet"}
                </p>
                {!searchQuery && !statusFilter && (
                  <Link href="/hospitals/new">
                    <Button>Create First Hospital</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-4 text-sm text-neutral-400">
          Showing {filteredHospitals.length} of {hospitals.length} hospitals
        </div>
      </div>
    </div>
  );
}
