"use client";

import { useState } from "react";
import useSWR from "swr";
import { cpApi, ApiError } from "../../lib/api";
import { Shell } from "../../components/Shell";

interface Instance {
  instanceId: string;
  hospitalName: string;
}

interface InstancesResponse {
  data: Instance[] | { instances: Instance[]; total?: number };
}

interface LicenseRecord {
  licenseId: string;
  instanceId: string;
  tier: string;
  revokedAt: string | null;
  expiresAt: string;
  issuedAt: string;
  features: string[];
  maxUsers: number;
  maxBeds?: number;
  signature: string;
}

const TIERS = ["community", "professional", "enterprise"] as const;

export default function LicensesPage() {
  const { data, error, isLoading, mutate } = useSWR<{ data: LicenseRecord[] }>(
    "/api/vendor/licenses",
    (path: string): Promise<any> => cpApi.get(path),
  );

  const { data: instancesData } = useSWR<InstancesResponse>(
    "/api/vendor/instances",
    (path: string): Promise<any> => cpApi.get(path),
  );

  const instances: Instance[] = instancesData
    ? Array.isArray(instancesData.data)
      ? instancesData.data
      : instancesData.data.instances ?? []
    : [];

  // Build a lookup map: instanceId → hospitalName
  const hospitalNames = new Map(
    instances.map((i) => [i.instanceId, i.hospitalName]),
  );

  const [issuing, setIssuing] = useState(false);
  const [form, setForm] = useState({
    instanceId: "",
    tier: "professional",
    validDays: "365",
  });
  const [msg, setMsg] = useState("");

  const issueLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssuing(true);
    setMsg("");
    try {
      await cpApi.post("/api/vendor/licenses", {
        instanceId: form.instanceId,
        tier: form.tier,
        validDays: parseInt(form.validDays),
      });
      setMsg("License issued successfully.");
      mutate();
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Failed to issue license.");
    } finally {
      setIssuing(false);
    }
  };

  const revoke = async (licenseId: string) => {
    if (!confirm("Revoke this license? The hospital will lose access.")) return;
    try {
      await cpApi.post(`/api/vendor/licenses/${licenseId}/revoke`, {});
      mutate();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to revoke.");
    }
  };

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Licenses</h1>
        <p className="text-sm text-gray-500 mt-1">Issue and manage RSA-signed license tokens for hospital instances.</p>
      </div>

      {/* Issue form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Issue New License</h2>
        <form onSubmit={issueLicense} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hospital Instance</label>
            <select
              value={form.instanceId}
              onChange={(e) => setForm((prev) => ({ ...prev, instanceId: e.target.value }))}
              required
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select an instance...</option>
              {instances.map((inst) => (
                <option key={inst.instanceId} value={inst.instanceId}>
                  {inst.hospitalName} ({inst.instanceId.slice(0, 8)}...)
                </option>
              ))}
            </select>
            {instances.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                No registered instances. Hospitals must complete the CMS installer first.
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tier</label>
            <select
              value={form.tier}
              onChange={(e) => setForm((prev) => ({ ...prev, tier: e.target.value }))}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
            <select
              value={form.validDays}
              onChange={(e) => setForm((prev) => ({ ...prev, validDays: e.target.value }))}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="30">1 Month</option>
              <option value="90">3 Months</option>
              <option value="180">6 Months</option>
              <option value="365">1 Year</option>
              <option value="730">2 Years</option>
            </select>
          </div>
          <div className="col-span-2 md:col-span-3 flex items-center gap-4">
            <button
              type="submit"
              disabled={issuing || !form.instanceId}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {issuing ? "Issuing..." : "Issue License"}
            </button>
            {msg && (
              <span className={`text-sm ${msg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {msg}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* License table */}
      {isLoading && <div className="text-sm text-gray-400">Loading...</div>}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error.message}
        </div>
      )}
      {data && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Hospital</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Features</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.data.map((lic) => {
                const expired = new Date(lic.expiresAt) < new Date();
                const revoked = !!lic.revokedAt;
                const status = revoked ? "REVOKED" : expired ? "EXPIRED" : "ACTIVE";
                const name = hospitalNames.get(lic.instanceId);
                return (
                  <tr key={lic.licenseId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {name ?? "Unknown"}
                      </div>
                      <div className="font-mono text-xs text-gray-400">
                        {lic.instanceId.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">{lic.tier}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : status === "REVOKED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{new Date(lic.issuedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(lic.expiresAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{lic.features.length} features</td>
                    <td className="px-4 py-3">
                      {status === "ACTIVE" && (
                        <button
                          onClick={() => revoke(lic.licenseId)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {data.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No licenses issued yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}
