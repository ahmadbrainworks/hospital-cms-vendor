"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { cpApi } from "../../lib/api";
import { Shell } from "../../components/Shell";
import Link from "next/link";

interface Metrics {
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  activeEncounters?: number;
  totalPatients?: number;
  uptimeSeconds?: number;
  reportedAt: string;
}

interface Instance {
  instanceId: string;
  hospitalName: string;
  hospitalSlug: string;
  agentVersion: string;
  lastHeartbeatAt: string;
  lastHeartbeatIp: string;
  hardwareFingerprintHash: string;
  backupStatus?: {
    backupConfigured: boolean;
    lastBackupAt?: string;
    lastBackupSizeBytes?: number;
    backupMethod: string;
    backupLocation: string;
    staleDays: number;
    healthy: boolean;
  };
  networkQuality: "excellent" | "good" | "degraded" | "offline";
  metrics: Metrics;
}

interface InstancesResponse {
  success: boolean;
  data: {
    instances: Instance[];
    total: number;
  };
}

const fetcher = (path: string): Promise<any> => cpApi.get(path);

function MetricGauge({ label, value, unit = "%", warn = 70, danger = 85 }: { label: string; value: number; unit?: string; warn?: number; danger?: number }) {
  let color = "text-green-600";
  let bgColor = "bg-green-100";
  if (value >= danger) {
    color = "text-red-600";
    bgColor = "bg-red-100";
  } else if (value >= warn) {
    color = "text-yellow-600";
    bgColor = "bg-yellow-100";
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      <div className={`text-3xl font-bold ${color} mb-2`}>{value.toFixed(1)}{unit}</div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${bgColor.replace("bg-", "bg-")}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function HealthBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; icon: string }> = {
    excellent: { color: "bg-green-100 text-green-800", icon: "✓" },
    good: { color: "bg-blue-100 text-blue-800", icon: "✓" },
    degraded: { color: "bg-yellow-100 text-yellow-800", icon: "⚠" },
    offline: { color: "bg-red-100 text-red-800", icon: "✕" },
  };

  const config = statusConfig[status] || statusConfig.degraded;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.icon} {status}
    </span>
  );
}

function BackupStatus({ backup }: { backup?: { healthy: boolean; lastBackupAt?: string; staleDays?: number } }) {
  if (!backup) return <span className="text-gray-400 text-sm">No backup info</span>;

  if (!backup.healthy) {
    return <span className="text-red-600 text-sm font-medium">⚠ Backup unhealthy ({backup.staleDays}d stale)</span>;
  }

  return (
    <span className="text-green-600 text-sm">
      ✓ Last: {backup.lastBackupAt ? new Date(backup.lastBackupAt).toLocaleDateString() : "Unknown"}
    </span>
  );
}

function TimeAgo({ date }: { date: string }) {
  const [relative, setRelative] = useState("");

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const then = new Date(date).getTime();
      const diff = now - then;

      if (diff < 60000) setRelative("just now");
      else if (diff < 3600000) setRelative(`${Math.floor(diff / 60000)}m ago`);
      else if (diff < 86400000) setRelative(`${Math.floor(diff / 3600000)}h ago`);
      else setRelative(`${Math.floor(diff / 86400000)}d ago`);
    };

    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [date]);

  return <span className="text-gray-600 text-sm">{relative}</span>;
}

export default function MonitoringPage() {
  const { data, error, isLoading } = useSWR<InstancesResponse>(
    "/api/vendor/instances",
    fetcher,
    { refreshInterval: 30000 },
  );

  const instances = data?.data?.instances ?? [];

  // Compute health metrics
  const healthyCount = instances.filter((i) => i.networkQuality !== "offline").length;
  const degradedCount = instances.filter((i) => i.networkQuality === "degraded" || i.networkQuality === "offline").length;

  const avgCpu = instances.length ? (instances.reduce((sum, i) => sum + (i.metrics?.cpuPercent || 0), 0) / instances.length) : 0;
  const avgMemory = instances.length ? (instances.reduce((sum, i) => sum + (i.metrics?.memoryPercent || 0), 0) / instances.length) : 0;
  const avgDisk = instances.length ? (instances.reduce((sum, i) => sum + (i.metrics?.diskPercent || 0), 0) / instances.length) : 0;

  const topCpuInstance = instances.reduce((max, inst) => (!max || (inst.metrics?.cpuPercent || 0) > (max.metrics?.cpuPercent || 0)) ? inst : max, undefined as Instance | undefined);
  const topMemoryInstance = instances.reduce((max, inst) => (!max || (inst.metrics?.memoryPercent || 0) > (max.metrics?.memoryPercent || 0)) ? inst : max, undefined as Instance | undefined);

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Monitoring Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time health monitoring for all hospital instances</p>
      </div>

      {/* System-wide metrics */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Fleet Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Instances Online</span>
              <span className="text-2xl font-bold text-green-600">{healthyCount}/{instances.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Degraded/Offline</span>
              <span className={`text-2xl font-bold ${degradedCount > 0 ? "text-red-600" : "text-green-600"}`}>
                {degradedCount}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Global Resources</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Avg CPU</span>
                <span className="font-medium">{avgCpu.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${avgCpu}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Avg Memory</span>
                <span className="font-medium">{avgMemory.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${avgMemory}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Avg Disk</span>
                <span className="font-medium">{avgDisk.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-amber-500 rounded-full" style={{ width: `${avgDisk}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top instances with issues */}
      {(topCpuInstance || topMemoryInstance) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-yellow-900 mb-4">⚠ Instances Needing Attention</h3>
          <div className="space-y-3">
            {topCpuInstance && topCpuInstance.metrics.cpuPercent > 75 && (
              <div className="flex justify-between items-center">
                <span className="text-yellow-800">
                  <strong>{topCpuInstance.hospitalName}</strong> - High CPU: {topCpuInstance.metrics.cpuPercent.toFixed(1)}%
                </span>
                <Link href={`/instances/${topCpuInstance.instanceId}`} className="text-yellow-700 underline text-sm">
                  View
                </Link>
              </div>
            )}
            {topMemoryInstance && topMemoryInstance.metrics.memoryPercent > 75 && (
              <div className="flex justify-between items-center">
                <span className="text-yellow-800">
                  <strong>{topMemoryInstance.hospitalName}</strong> - High Memory: {topMemoryInstance.metrics.memoryPercent.toFixed(1)}%
                </span>
                <Link href={`/instances/${topMemoryInstance.instanceId}`} className="text-yellow-700 underline text-sm">
                  View
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instances grid */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">All Instances</h2>

      {isLoading && <div className="text-gray-500">Loading instances...</div>}
      {error && <div className="text-red-600">Failed to load instances</div>}

      <div className="space-y-4">
        {instances.map((instance) => (
          <Link key={instance.instanceId} href={`/instances/${instance.instanceId}`}>
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="grid grid-cols-6 gap-4 items-start">
                {/* Hospital info */}
                <div>
                  <h3 className="font-semibold text-gray-900">{instance.hospitalName}</h3>
                  <p className="text-xs text-gray-500 mt-1">{instance.hospitalSlug}</p>
                  <div className="mt-2">
                    <HealthBadge status={instance.networkQuality} />
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 w-12">CPU:</span>
                    <div className="flex-1 bg-gray-200 rounded h-1.5">
                      <div className="h-1.5 bg-blue-500 rounded" style={{ width: `${instance.metrics.cpuPercent}%` }} />
                    </div>
                    <span className="text-xs text-gray-700 w-10 text-right">{instance.metrics.cpuPercent.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 w-12">Mem:</span>
                    <div className="flex-1 bg-gray-200 rounded h-1.5">
                      <div className="h-1.5 bg-purple-500 rounded" style={{ width: `${instance.metrics.memoryPercent}%` }} />
                    </div>
                    <span className="text-xs text-gray-700 w-10 text-right">{instance.metrics.memoryPercent.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 w-12">Disk:</span>
                    <div className="flex-1 bg-gray-200 rounded h-1.5">
                      <div className="h-1.5 bg-amber-500 rounded" style={{ width: `${instance.metrics.diskPercent}%` }} />
                    </div>
                    <span className="text-xs text-gray-700 w-10 text-right">{instance.metrics.diskPercent.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Activity */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">Activity</p>
                  <p className="text-sm font-medium text-gray-900">{instance.metrics.activeEncounters ?? 0}</p>
                  <p className="text-xs text-gray-500">Active Encounters</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">{instance.metrics.totalPatients ?? 0}</p>
                  <p className="text-xs text-gray-500">Total Patients</p>
                </div>

                {/* Backup */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">Backup Status</p>
                  <BackupStatus backup={instance.backupStatus} />
                </div>

                {/* Last heartbeat */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">Last Heartbeat</p>
                  <TimeAgo date={instance.lastHeartbeatAt} />
                  <p className="text-xs text-gray-500 mt-2">Agent v{instance.agentVersion}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
