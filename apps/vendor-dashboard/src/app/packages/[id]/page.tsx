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
import { ArrowLeft, Download, Eye } from "lucide-react";

interface PackageVersion {
  version: string;
  releaseDate: string;
  downloads: number;
  status: "stable" | "beta" | "deprecated";
}

interface PackageDetail {
  _id: string;
  name: string;
  type: string;
  latestVersion: string;
  description: string;
  longDescription: string;
  status: "stable" | "beta" | "deprecated";
  deployedCount: number;
  author: string;
  license: string;
  homepage: string;
  repository: string;
  createdAt: string;
  updatedAt: string;
  versions: PackageVersion[];
}

interface HospitalDeployment {
  _id: string;
  hospitalName: string;
  hospitalId: string;
  version: string;
  status: "active" | "pending" | "failed";
  deployedAt: string;
  updatedAt: string;
}

export default function PackageDetailPage() {
  const params = useParams();
  const packageId = params.id as string;

  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [deployments, setDeployments] = useState<HospitalDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

        // Fetch package details
        const pkgRes = await fetch(`${baseUrl}/packages/${packageId}`, {
          credentials: "include",
        });

        if (!pkgRes.ok) throw new Error("Package not found");
        const pkgData = await pkgRes.json();
        setPkg(pkgData.data || pkgData);

        // Fetch deployments
        const deploymentsRes = await fetch(
          `${baseUrl}/packages/${packageId}/deployments`,
          { credentials: "include" }
        );

        if (deploymentsRes.ok) {
          const deploymentsData = await deploymentsRes.json();
          setDeployments(
            Array.isArray(deploymentsData.data)
              ? deploymentsData.data
              : deploymentsData.deployments || []
          );
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load package details");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchData();
    }
  }, [packageId]);

  const tabsContent = [
    { id: "overview", label: "Overview" },
    { id: "versions", label: "Versions", badge: <Badge size="sm">{pkg?.versions?.length || 0}</Badge> },
    { id: "deployments", label: "Deployments", badge: <Badge size="sm">{deployments.length}</Badge> },
  ];

  const versionColumns = [
    { key: "version", label: "Version", width: "120px" },
    { key: "releaseDate", label: "Release Date" },
    { key: "downloads", label: "Downloads" },
    { key: "status", label: "Status" },
  ];

  const versionRows = (pkg?.versions || []).map((v) => ({
    version: `v${v.version}`,
    releaseDate: new Date(v.releaseDate).toLocaleDateString(),
    downloads: v.downloads.toLocaleString(),
    status: (
      <Badge
        variant={
          v.status === "stable"
            ? "success"
            : v.status === "beta"
              ? "warning"
              : "error"
        }
      >
        {v.status}
      </Badge>
    ),
  }));

  const deploymentColumns = [
    { key: "hospitalName", label: "Hospital", width: "220px" },
    { key: "version", label: "Version" },
    { key: "status", label: "Status" },
    { key: "deployedAt", label: "Deployed" },
    { key: "updatedAt", label: "Updated" },
  ];

  const deploymentRows = deployments.map((d) => ({
    hospitalName: d.hospitalName,
    version: `v${d.version}`,
    status: (
      <Badge
        variant={
          d.status === "active"
            ? "success"
            : d.status === "pending"
              ? "warning"
              : "error"
        }
      >
        {d.status}
      </Badge>
    ),
    deployedAt: new Date(d.deployedAt).toLocaleDateString(),
    updatedAt: new Date(d.updatedAt).toLocaleDateString(),
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <Topbar
          title="Package Details"
          subtitle="Loading..."
          rightSlot={
            <Link href="/packages">
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

  if (!pkg) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <Topbar
          title="Package Not Found"
          rightSlot={
            <Link href="/packages">
              <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
                Back
              </Button>
            </Link>
          }
          sticky
        />
        <div className="p-8 max-w-7xl mx-auto">
          <Alert variant="error" title="Error">
            Package could not be found. It may have been deleted or you don't have access.
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <Topbar
        title={pkg.name}
        subtitle={`v${pkg.latestVersion} • ${pkg.type} • ${pkg.status}`}
        rightSlot={
          <Link href="/packages">
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
              <p className="text-neutral-400 text-sm">Latest Version</p>
              <p className="text-2xl font-bold mt-2">v{pkg.latestVersion}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-neutral-400 text-sm">Status</p>
              <Badge
                variant={
                  pkg.status === "stable"
                    ? "success"
                    : pkg.status === "beta"
                      ? "warning"
                      : "error"
                }
                className="mt-2"
              >
                {pkg.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-neutral-400 text-sm">Active Deployments</p>
              <p className="text-3xl font-bold mt-2">
                {deployments.filter((d) => d.status === "active").length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-neutral-400 text-sm">Total Deployments</p>
              <p className="text-3xl font-bold mt-2">{pkg.deployedCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Details & Metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Package Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-neutral-400 text-sm">Type</p>
                <p className="text-neutral-100 font-medium">{pkg.type}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Author</p>
                <p className="text-neutral-100 font-medium">{pkg.author}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">License</p>
                <p className="text-neutral-100 font-medium">{pkg.license}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Links</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {pkg.homepage && (
                <a
                  href={pkg.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:text-primary-400 text-sm block"
                >
                  Homepage →
                </a>
              )}
              {pkg.repository && (
                <a
                  href={pkg.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:text-primary-400 text-sm block"
                >
                  Repository →
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Actions</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="secondary" fullWidth icon={<Download size={16} />}>
                Download Latest
              </Button>
              <Button variant="secondary" fullWidth icon={<Eye size={16} />}>
                View on Hub
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="font-semibold">About</h3>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-300 mb-4">{pkg.description}</p>
            {pkg.longDescription && (
              <div className="text-neutral-400 text-sm whitespace-pre-wrap">
                {pkg.longDescription}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Package Details</h2>
          </CardHeader>
          <CardContent>
            <Tabs tabs={tabsContent}>
              {(tabId) => {
                if (tabId === "overview") {
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-neutral-800 rounded-lg">
                          <p className="text-neutral-400 text-xs">Total Versions</p>
                          <p className="text-2xl font-bold mt-1">
                            {pkg.versions?.length || 0}
                          </p>
                        </div>
                        <div className="p-4 bg-neutral-800 rounded-lg">
                          <p className="text-neutral-400 text-xs">Created</p>
                          <p className="text-sm mt-1">
                            {new Date(pkg.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="p-4 bg-neutral-800 rounded-lg">
                          <p className="text-neutral-400 text-xs">Last Updated</p>
                          <p className="text-sm mt-1">
                            {new Date(pkg.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (tabId === "versions") {
                  return versionRows.length > 0 ? (
                    <Table columns={versionColumns} rows={versionRows} hoverable />
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-neutral-400">No versions available</p>
                    </div>
                  );
                }

                if (tabId === "deployments") {
                  return deploymentRows.length > 0 ? (
                    <Table columns={deploymentColumns} rows={deploymentRows} hoverable />
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-neutral-400">Not deployed to any hospitals yet</p>
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
