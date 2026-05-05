"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  Topbar,
  Alert,
  Tabs,
  Table,
  Skeleton,
  SkeletonGroup,
} from "@/components/ui";
import { ArrowLeft, Package, TrendingUp, AlertCircle } from "lucide-react";

interface Hospital {
  _id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
  patientCount: number;
  status: "active" | "inactive" | "pending";
  licenseExpiry: string;
  createdAt: string;
}

interface PackageAssignment {
  _id: string;
  packageId: string;
  packageName: string;
  packageType: string;
  version: string;
  status: "active" | "pending" | "disabled";
  assignedAt: string;
}

interface UsageMetrics {
  apiCalls: number;
  dataUsageGB: number;
  userCount: number;
  lastUpdated: string;
}

export default function HospitalDetailPage() {
  const params = useParams();
  const hospitalId = params.id as string;

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [packages, setPackages] = useState<PackageAssignment[]>([]);
  const [usage, setUsage] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

        // Fetch hospital details
        const hospitalRes = await fetch(`${baseUrl}/hospitals/${hospitalId}`, {
          credentials: "include",
        });

        if (!hospitalRes.ok) throw new Error("Hospital not found");
        const hospitalData = await hospitalRes.json();
        setHospital(hospitalData.data || hospitalData);

        // Fetch package assignments
        const packagesRes = await fetch(
          `${baseUrl}/hospitals/${hospitalId}/packages`,
          { credentials: "include" }
        );

        if (packagesRes.ok) {
          const packagesData = await packagesRes.json();
          setPackages(Array.isArray(packagesData.data) ? packagesData.data : packagesData.packages || []);
        }

        // Fetch usage metrics
        const usageRes = await fetch(
          `${baseUrl}/hospitals/${hospitalId}/usage`,
          { credentials: "include" }
        );

        if (usageRes.ok) {
          const usageData = await usageRes.json();
          setUsage(usageData.data || usageData);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load hospital details");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (hospitalId) {
      fetchData();
    }
  }, [hospitalId]);

  const tabsContent = [
    { id: "overview", label: "Overview" },
    { id: "packages", label: "Packages", badge: <Badge size="sm">{packages.length}</Badge> },
    { id: "usage", label: "Usage Metrics" },
  ];

  const packageColumns = [
    { key: "packageName", label: "Package", width: "200px" },
    { key: "packageType", label: "Type" },
    { key: "version", label: "Version" },
    { key: "status", label: "Status" },
    { key: "assignedAt", label: "Assigned" },
  ];

  const packageRows = packages.map((p) => ({
    packageName: p.packageName,
    packageType: p.packageType,
    version: p.version,
    status: (
      <Badge
        variant={
          p.status === "active" ? "success" : p.status === "pending" ? "warning" : "error"
        }
      >
        {p.status}
      </Badge>
    ),
    assignedAt: new Date(p.assignedAt).toLocaleDateString(),
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <Topbar
          title="Hospital Details"
          subtitle="Loading..."
          rightSlot={
            <Link href="/hospitals">
              <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
                Back
              </Button>
            </Link>
          }
          sticky
        />
        <div className="p-8 max-w-7xl mx-auto">
          <SkeletonGroup count={3} />
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <Topbar
          title="Hospital Not Found"
          rightSlot={
            <Link href="/hospitals">
              <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
                Back
              </Button>
            </Link>
          }
          sticky
        />
        <div className="p-8 max-w-7xl mx-auto">
          <Alert variant="error" title="Error">
            Hospital could not be found. It may have been deleted or you don't have access.
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <Topbar
        title={hospital.name}
        subtitle={`${hospital.city}, ${hospital.state} • ${hospital.status}`}
        rightSlot={
          <Link href="/hospitals">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
              Back
            </Button>
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

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-neutral-400 text-sm">Total Patients</p>
              <p className="text-3xl font-bold mt-2">{hospital.patientCount.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-neutral-400 text-sm">Status</p>
              <Badge
                variant={
                  hospital.status === "active"
                    ? "success"
                    : hospital.status === "pending"
                      ? "warning"
                      : "error"
                }
                className="mt-2"
              >
                {hospital.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-neutral-400 text-sm">License Expires</p>
              <p className="text-lg font-semibold mt-2">
                {new Date(hospital.licenseExpiry).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-neutral-400 text-sm">Active Packages</p>
              <p className="text-3xl font-bold mt-2">{packages.filter((p) => p.status === "active").length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Contact Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-neutral-400 text-sm">Email</p>
                <p className="text-neutral-100 font-medium">{hospital.contactEmail}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Phone</p>
                <p className="text-neutral-100 font-medium">{hospital.contactPhone}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Location</p>
                <p className="text-neutral-100 font-medium">
                  {hospital.city}, {hospital.state}, {hospital.country}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Hospital Details</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-neutral-400 text-sm">Created</p>
                <p className="text-neutral-100 font-medium">
                  {new Date(hospital.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Hospital ID</p>
                <p className="text-xs font-mono text-neutral-400">{hospital._id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Actions</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="secondary" fullWidth>
                Manage Packages
              </Button>
              <Button variant="secondary" fullWidth>
                View Settings
              </Button>
              <Button variant="danger" fullWidth>
                Remove Hospital
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Hospital Management</h2>
          </CardHeader>
          <CardContent>
            <Tabs tabs={tabsContent}>
              {(tabId) => {
                if (tabId === "overview") {
                  return (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-neutral-800 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-neutral-100 font-medium">Active and Running</p>
                          <p className="text-neutral-400 text-sm">
                            All systems operational. Last health check:{" "}
                            {new Date().toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {packages.length > 0 && (
                        <div>
                          <h4 className="text-neutral-300 font-medium mb-3">Active Packages</h4>
                          <div className="space-y-2">
                            {packages
                              .filter((p) => p.status === "active")
                              .map((p) => (
                                <div key={p._id} className="flex items-center justify-between p-3 bg-neutral-800 rounded">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-primary-500" />
                                    <div>
                                      <p className="text-neutral-100 text-sm font-medium">{p.packageName}</p>
                                      <p className="text-neutral-400 text-xs">v{p.version}</p>
                                    </div>
                                  </div>
                                  <Badge variant="success">Active</Badge>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (tabId === "packages") {
                  return packages.length > 0 ? (
                    <Table columns={packageColumns} rows={packageRows} hoverable />
                  ) : (
                    <div className="py-8 text-center">
                      <Package className="w-12 h-12 text-neutral-600 mx-auto mb-3 opacity-50" />
                      <p className="text-neutral-400">No packages assigned yet</p>
                      <Button variant="secondary" className="mt-4">
                        Assign Package
                      </Button>
                    </div>
                  );
                }

                if (tabId === "usage") {
                  return usage ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-neutral-800 rounded-lg">
                        <p className="text-neutral-400 text-sm">API Calls (Last 30 days)</p>
                        <p className="text-2xl font-bold text-neutral-100 mt-2">
                          {usage.apiCalls.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-neutral-800 rounded-lg">
                        <p className="text-neutral-400 text-sm">Data Usage</p>
                        <p className="text-2xl font-bold text-neutral-100 mt-2">
                          {usage.dataUsageGB.toFixed(2)} GB
                        </p>
                      </div>
                      <div className="p-4 bg-neutral-800 rounded-lg">
                        <p className="text-neutral-400 text-sm">Active Users</p>
                        <p className="text-2xl font-bold text-neutral-100 mt-2">
                          {usage.userCount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <AlertCircle className="w-12 h-12 text-neutral-600 mx-auto mb-3 opacity-50" />
                      <p className="text-neutral-400">Usage metrics not available</p>
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
