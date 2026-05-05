"use client";

import useSWR from "swr";
import { cpApi, ApiError } from "../../lib/api";
import { Shell } from "../../components/Shell";
import Link from "next/link";
import {
  getInstanceStatus,
  formatLastHeartbeat,
  getNetworkQualityLabel,
} from "../../lib/instance-utils";

interface Instance {
  instanceId: string;
  hospitalName: string;
  status: string;
  tier: string;
  lastHeartbeat?: string;
  networkQuality?: string;
  metrics?: {
    cpuPercent?: number;
    memoryPercent?: number;
    diskPercent?: number;
    uptimeSeconds?: number;
    activeEncounters?: number;
    totalPatients?: number;
  };
  licenseExpiresAt?: string;
  agentVersion?: string;
}

interface InstancesResponse {
  data: Instance[] | {
    instances: Instance[];
    total?: number;
  };
}

function StatusBadge({ status, lastHeartbeat, networkQuality }: { status: string; lastHeartbeat?: string; networkQuality?: string }) {
  const health = getInstanceStatus(lastHeartbeat, networkQuality);
  const variants = {
    online: "bg-green-500/20 text-green-300 border-green-500/30",
    degraded: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    offline: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  const dotColor = {
    online: "bg-green-400",
    degraded: "bg-yellow-400",
    offline: "bg-red-400",
  };
  return (
    <span className={`badge ${variants[health as keyof typeof variants]}`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${dotColor[health as keyof typeof dotColor]}`} />
      {health.charAt(0).toUpperCase() + health.slice(1)}
    </span>
  );
}

function MetricCard({ label, value, unit, warning = 70, critical = 85 }: { label: string; value?: number; unit: string; warning?: number; critical?: number }) {
  if (value == null) return <div className="text-center"><p className="text-xs text-slate-500 mb-1">{label}</p><p className="text-2xl font-bold text-slate-400">—</p></div>;
  const isDanger = value >= critical;
  const isWarning = value >= warning;
  const textColor = isDanger ? "text-red-400" : isWarning ? "text-yellow-400" : "text-green-400";
  return (
    <div className="text-center">
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{value.toFixed(0)}{unit}</p>
      <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-3">
        <div
          className={`h-1.5 rounded-full transition-all ${isDanger ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-green-500"}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function InstancesPage() {
  const { data, error, isLoading, mutate } = useSWR<InstancesResponse>(
    "/api/vendor/instances",
    (path: string): Promise<any> => cpApi.get(path),
    { refreshInterval: 30_000 },
  );
  const instances = Array.isArray(data?.data)
    ? data.data
    : data?.data.instances ?? [];

  const handleDelete = async (instanceId: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will permanently remove the instance, all licenses, commands, and data.`)) return;
    try {
      await cpApi.delete(`/api/vendor/instances/${instanceId}`);
      mutate();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete instance.");
    }
  };

  return (
    <Shell>
      <div className="mb-8 animate-slide-up">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Hospital Instances
        </h1>
        <p className="text-slate-400 mt-2">Monitor and manage all distributed CMS instances</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full mb-3" />
            <p className="text-sm">Loading instances…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300 animate-slide-up">
          Failed to load instances: {error.message}
        </div>
      )}

      {data && instances.length === 0 && (
        <div className="text-center py-16 card rounded-2xl">
          <div className="text-5xl mb-3">🏥</div>
          <p className="text-slate-400">No instances registered yet</p>
        </div>
      )}

      {data && instances.length > 0 && (
        <div className="grid gap-6">
          {instances.map((inst, i) => (
            <div
              key={inst.instanceId}
              className="card-hover rounded-2xl overflow-hidden group animate-scale-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-transparent">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-slate-50">{inst.hospitalName}</h3>
                      <StatusBadge status={inst.status} lastHeartbeat={inst.lastHeartbeat} networkQuality={inst.networkQuality} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>ID: <span className="font-mono text-slate-300">{inst.instanceId.slice(0, 8)}</span></span>
                      <span>Tier: <span className="font-medium capitalize text-slate-200">{inst.tier}</span></span>
                      <span>Agent: <span className="text-slate-300">v{inst.agentVersion}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Last Heartbeat</p>
                    <p className="font-medium text-slate-100">{formatLastHeartbeat(inst.lastHeartbeat)}</p>
                    {inst.networkQuality && (
                      <p className="text-xs mt-2 text-slate-400">
                        {getNetworkQualityLabel(inst.networkQuality)} Network
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              {inst.metrics && (
                <div className="p-6 grid grid-cols-6 gap-4 border-b border-slate-700/50 bg-slate-900/20">
                  <MetricCard label="CPU" value={inst.metrics.cpuPercent} unit="%" />
                  <MetricCard label="Memory" value={inst.metrics.memoryPercent} unit="%" />
                  <MetricCard label="Disk" value={inst.metrics.diskPercent} unit="%" warning={80} critical={90} />
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Uptime</p>
                    <p className="text-2xl font-bold text-slate-100">
                      {inst.metrics.uptimeSeconds ? (inst.metrics.uptimeSeconds / 86400).toFixed(1) : "—"}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Encounters</p>
                    <p className="text-2xl font-bold text-blue-400">{inst.metrics.activeEncounters ?? "—"}</p>
                    <p className="text-xs text-slate-500 mt-2">active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Patients</p>
                    <p className="text-2xl font-bold text-purple-400">{inst.metrics.totalPatients ?? "—"}</p>
                    <p className="text-xs text-slate-500 mt-2">total</p>
                  </div>
                </div>
              )}

              {/* License & Actions */}
              <div className="p-6 flex items-center justify-between bg-slate-900/20">
                <div>
                  {inst.licenseExpiresAt && (
                    <p className="text-xs text-slate-400">
                      License expires <span className="font-medium text-slate-300">{new Date(inst.licenseExpiresAt).toLocaleDateString()}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/instances/${inst.instanceId}`}
                    className="btn btn-primary text-xs"
                  >
                    Manage
                  </Link>
                  <button
                    onClick={() => handleDelete(inst.instanceId, inst.hospitalName)}
                    className="btn btn-danger text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
