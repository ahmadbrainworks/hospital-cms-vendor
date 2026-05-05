"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import { cpApi, ApiError } from "../../../lib/api";
import { Shell } from "../../../components/Shell";
import { useAuth } from "../../../lib/auth-context";
import { P } from "../../../lib/permissions";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface InstanceDetail {
  instanceId: string;
  hospitalName: string;
  status: string;
  tier: string;
  lastHeartbeat?: string;
  metrics?: Record<string, unknown>;
  desiredState?: {
    plugins: unknown[];
    themeId?: string;
    config: Record<string, string>;
  };
  licenseExpiresAt?: string;
  agentVersion?: string;
  hostname?: string;
}

interface PackageAssignment {
  assignmentId: string;
  instanceId: string;
  packageId: string;
  packageType: string;
  assignedVersion: string;
  status: string;
  assignedAt: string;
  lastSyncAt?: string;
  lastError?: string;
}

function AssignmentStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    assigned: "bg-blue-100 text-blue-800",
    installing: "bg-yellow-100 text-yellow-800",
    pending_update: "bg-orange-100 text-orange-800",
    pending_removal: "bg-red-100 text-red-700",
    disabled: "bg-gray-100 text-gray-700",
    removed: "bg-gray-50 text-gray-400",
    failed: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function MetricDisplay({ label, value, unit }: { label: string; value: number | undefined; unit: string }) {
  if (value === undefined) return <div className="p-4 bg-gray-50 rounded-lg text-center"><p className="text-xs text-gray-500">{label}</p><p className="text-2xl font-bold text-gray-300 mt-2">—</p></div>;
  const isHighUtilization = value > 80;
  return (
    <div className={`p-4 rounded-lg border ${isHighUtilization ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
      <p className="text-xs text-gray-600 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${isHighUtilization ? "text-red-600" : "text-green-600"}`}>{value.toFixed(1)}<span className="text-sm">{unit}</span></p>
    </div>
  );
}

const COMMANDS: Record<string, { description: string; requiresPayload?: boolean; example?: string }> = {
  RESTART_API: {
    description: "Gracefully restart the API service. The hospital instance will be temporarily unavailable (~30 seconds).",
    requiresPayload: false,
  },
  CLEAR_CACHE: {
    description: "Clear all in-memory caches (Redis, application cache). Useful for resetting stale data without a full restart.",
    requiresPayload: false,
  },
  ROTATE_INSTANCE_KEY: {
    description: "Rotate the instance's RSA private key for enhanced security. This is a critical security operation.",
    requiresPayload: false,
  },
  SET_LOG_LEVEL: {
    description: "Change the log level for this instance (trace, debug, info, warn, error) for troubleshooting issues.",
    requiresPayload: true,
    example: '{\n  "level": "debug"\n}',
  },
} as const;

const COMMAND_TYPES = Object.keys(COMMANDS);

function generateMockMetricsHistory() {
  const data = [];
  for (let i = 12; i > 0; i--) {
    const time = new Date();
    time.setHours(time.getHours() - i);
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      cpu: Math.floor(30 + Math.random() * 40),
      memory: Math.floor(40 + Math.random() * 30),
      disk: Math.floor(50 + Math.random() * 20),
    });
  }
  return data;
}

export default function InstanceDetailPage() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const key = `/api/vendor/instances/${instanceId}`;

  const { data, error, isLoading } = useSWR<{ data: InstanceDetail }>(
    key,
    (path: string): Promise<any> => cpApi.get(path),
    { refreshInterval: 15_000 },
  );

  const router = useRouter();
  const { hasPermission } = useAuth();

  const { data: assignmentsData } = useSWR(
    `/api/vendor/assignments/instance/${instanceId}`,
    (url: string): Promise<any> => cpApi.get(url),
    { refreshInterval: 15_000 },
  );
  const assignments: PackageAssignment[] = assignmentsData?.data ?? [];

  const [cmdType, setCmdType] = useState<string>(COMMAND_TYPES[0]);
  const [cmdPayload, setCmdPayload] = useState("{}");
  const [cmdLoading, setCmdLoading] = useState(false);
  const [cmdMsg, setCmdMsg] = useState("");

  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    if (!confirm(`Delete "${inst?.hospitalName ?? instanceId}"? This will permanently remove the instance and all its licenses, commands, and data.`)) return;
    setDeleting(true);
    try {
      await cpApi.delete(`/api/vendor/instances/${instanceId}`);
      router.push("/instances");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete instance.");
      setDeleting(false);
    }
  };

  const [removingPkg, setRemovingPkg] = useState<string | null>(null);
  const handleRemoveAssignment = async (packageId: string) => {
    if (!confirm(`Remove ${packageId} from this instance? It will be uninstalled on the next sync.`)) return;
    setRemovingPkg(packageId);
    try {
      await cpApi.delete(`/api/vendor/assignments/${instanceId}/${packageId}`);
      mutate(`/api/vendor/assignments/instance/${instanceId}`);
    } catch (err: any) {
      alert(err.message ?? "Remove failed");
    } finally {
      setRemovingPkg(null);
    }
  };

  const handleDisableAssignment = async (packageId: string) => {
    try {
      await cpApi.put(`/api/vendor/assignments/${instanceId}/${packageId}/disable`);
      mutate(`/api/vendor/assignments/instance/${instanceId}`);
    } catch (err: any) {
      alert(err.message ?? "Disable failed");
    }
  };

  const issueCommand = async () => {
    setCmdLoading(true);
    setCmdMsg("");
    try {
      let payload: unknown = {};
      try { payload = JSON.parse(cmdPayload); } catch { /* use empty object */ }
      await cpApi.post(`/api/vendor/instances/${instanceId}/commands`, {
        type: cmdType,
        payload,
      });
      setCmdMsg("Command queued successfully.");
    } catch (err) {
      setCmdMsg(err instanceof ApiError ? err.message : "Failed to issue command.");
    } finally {
      setCmdLoading(false);
    }
  };

  const inst = data?.data;

  return (
    <Shell>
      <div className="mb-6 flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {inst?.hospitalName ?? instanceId}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Instance ID: {instanceId}</p>
        </div>
        {inst && (
          <div className="ml-auto flex items-center gap-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              inst.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
            }`}>
              {inst.status}
            </span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              {deleting ? "Deleting..." : "Delete Instance"}
            </button>
          </div>
        )}
      </div>

      {isLoading && <div className="text-sm text-gray-400">Loading…</div>}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error.message}
        </div>
      )}

      {inst && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instance info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Instance Info</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-gray-500">Tier</dt>
              <dd className="font-medium capitalize">{inst.tier}</dd>
              <dt className="text-gray-500">License Expires</dt>
              <dd className="font-medium">{inst.licenseExpiresAt ? new Date(inst.licenseExpiresAt).toLocaleDateString() : "—"}</dd>
              <dt className="text-gray-500">Agent Version</dt>
              <dd className="font-medium">{inst.agentVersion ?? "—"}</dd>
              <dt className="text-gray-500">Hostname</dt>
              <dd className="font-medium font-mono text-xs">{inst.hostname ?? "—"}</dd>
              <dt className="text-gray-500">Last Heartbeat</dt>
              <dd className="font-medium">{inst.lastHeartbeat ? new Date(inst.lastHeartbeat).toLocaleString() : "—"}</dd>
            </dl>
          </div>

          {/* Metrics */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">System Metrics</h2>
            {inst.metrics ? (
              <div className="grid grid-cols-3 gap-4">
                <MetricDisplay label="CPU Usage" value={inst.metrics.cpuPercent} unit="%" />
                <MetricDisplay label="Memory Usage" value={inst.metrics.memoryPercent} unit="%" />
                <MetricDisplay label="Disk Usage" value={inst.metrics.diskPercent} unit="%" />
                <MetricDisplay label="Uptime" value={inst.metrics.uptimeSeconds ? inst.metrics.uptimeSeconds / 86400 : 0} unit="days" />
                <MetricDisplay label="Active Encounters" value={inst.metrics.activeEncounters} unit="" />
                <MetricDisplay label="Total Patients" value={inst.metrics.totalPatients} unit="" />
              </div>
            ) : (
              <p className="text-sm text-gray-500">No metrics available yet. Waiting for first heartbeat.</p>
            )}
          </div>

          {/* Metrics Chart */}
          {inst.metrics && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={generateMockMetricsHistory()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    stroke="#ef4444"
                    dot={false}
                    strokeWidth={2}
                    name="CPU %"
                  />
                  <Line
                    type="monotone"
                    dataKey="memory"
                    stroke="#3b82f6"
                    dot={false}
                    strokeWidth={2}
                    name="Memory %"
                  />
                  <Line
                    type="monotone"
                    dataKey="disk"
                    stroke="#8b5cf6"
                    dot={false}
                    strokeWidth={2}
                    name="Disk %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Issue command */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 lg:col-span-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Remote Commands</h2>
              <p className="text-sm text-gray-600">Send operational commands to this hospital instance. Commands are executed on the next heartbeat cycle.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Command</label>
                <select
                  value={cmdType}
                  onChange={(e) => setCmdType(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {COMMAND_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {cmdType && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      {(COMMANDS as any)[cmdType]?.description || "No description available."}
                    </p>
                  </div>
                )}
              </div>

              {(COMMANDS as any)[cmdType]?.requiresPayload && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payload (JSON)</label>
                  <textarea
                    value={cmdPayload}
                    onChange={(e) => setCmdPayload(e.target.value)}
                    rows={3}
                    placeholder={(COMMANDS as any)[cmdType]?.example || '{}'}
                    className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {cmdMsg && (
                <div className={`p-3 rounded-lg ${cmdMsg.includes("success") || cmdMsg.includes("queued") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  <p className="text-sm">{cmdMsg}</p>
                </div>
              )}

              <button
                onClick={issueCommand}
                disabled={cmdLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {cmdLoading ? "Sending…" : "Send Command to Instance"}
              </button>
            </div>
          </div>

          {/* Desired state */}
          {inst.desiredState && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Desired State</h2>
              <pre className="text-xs bg-gray-50 rounded-lg p-3 overflow-auto max-h-48 font-mono">
                {JSON.stringify(inst.desiredState, null, 2)}
              </pre>
            </div>
          )}

          {/* Assigned Packages */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                Assigned Packages ({assignments.length})
              </h2>
              {hasPermission(P.PACKAGE_ASSIGN) && (
                <Link
                  href={`/packages`}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  + Assign Package
                </Link>
              )}
            </div>
            {assignments.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-2">Package</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Version</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Last Sync</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {assignments.map((a) => (
                    <tr key={a.assignmentId} className="hover:bg-gray-50">
                      <td className="py-2">
                        <Link
                          href={`/packages/${a.packageId}`}
                          className="text-indigo-700 hover:text-indigo-900 font-mono text-xs"
                        >
                          {a.packageId}
                        </Link>
                      </td>
                      <td className="py-2 text-xs text-gray-500 capitalize">
                        {a.packageType}
                      </td>
                      <td className="py-2 font-mono text-xs text-gray-600">
                        {a.assignedVersion}
                      </td>
                      <td className="py-2">
                        <AssignmentStatusBadge status={a.status} />
                        {a.lastError && (
                          <div className="text-xs text-red-500 mt-0.5 truncate max-w-xs" title={a.lastError}>
                            {a.lastError}
                          </div>
                        )}
                      </td>
                      <td className="py-2 text-xs text-gray-400">
                        {a.lastSyncAt
                          ? new Date(a.lastSyncAt).toLocaleString()
                          : "Pending"}
                      </td>
                      <td className="py-2 text-right">
                        {hasPermission(P.PACKAGE_ASSIGN) &&
                          a.status !== "removed" &&
                          a.status !== "pending_removal" && (
                            <div className="flex gap-2 justify-end">
                              {a.status === "active" && (
                                <button
                                  onClick={() => handleDisableAssignment(a.packageId)}
                                  className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                  Disable
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveAssignment(a.packageId)}
                                disabled={removingPkg === a.packageId}
                                className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                {removingPkg === a.packageId ? "..." : "Remove"}
                              </button>
                            </div>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-400">
                No packages assigned to this instance yet.
              </p>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}
