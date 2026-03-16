"use client";

import { useState } from "react";
import useSWR from "swr";
import { cpApi, ApiError } from "../../lib/api";
import { Shell } from "../../components/Shell";

interface RegistrationToken {
  token: string;
  hospitalName?: string;
  createdAt: string;
  expiresAt: string;
  consumedAt?: string;
  consumedByInstanceId?: string;
}

interface TokensResponse {
  success: boolean;
  data: RegistrationToken[];
}

interface IssueResponse {
  success: boolean;
  data: { token: string };
}

export default function RegistrationTokensPage() {
  const { data, error, isLoading, mutate } = useSWR<TokensResponse>(
    "/api/registration-tokens",
    (path: string) => cpApi.get(path),
    { refreshInterval: 30_000 },
  );

  const [hospitalName, setHospitalName] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [issueError, setIssueError] = useState("");

  const tokens = data?.data ?? [];

  async function handleIssue() {
    setIssuing(true);
    setIssueError("");
    setIssuedToken(null);
    try {
      const res = await cpApi.post<IssueResponse>("/api/registration-tokens", {
        hospitalName: hospitalName.trim() || undefined,
      });
      setIssuedToken(res.data.token);
      setHospitalName("");
      mutate();
    } catch (err) {
      setIssueError(
        err instanceof ApiError ? err.message : "Failed to issue token",
      );
    } finally {
      setIssuing(false);
    }
  }

  async function handleRevoke(token: string) {
    try {
      await cpApi.delete(`/api/registration-tokens/${token}`);
      mutate();
    } catch {
      // Token may already be consumed
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Registration Tokens
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate single-use tokens for new hospital deployments. Share the
          token with the hospital operator to complete their installation.
        </p>
      </div>

      {/* Issue new token */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Issue New Token
        </h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Hospital Name (optional)
            </label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="e.g. City General Hospital"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleIssue}
            disabled={issuing}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
          >
            {issuing ? "Generating..." : "Generate Token"}
          </button>
        </div>

        {issueError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {issueError}
          </div>
        )}

        {issuedToken && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">
                Token generated — copy and share with the hospital operator
              </span>
              <button
                onClick={() => handleCopy(issuedToken)}
                className="text-xs font-medium text-green-700 hover:text-green-900 px-2 py-1 rounded border border-green-300 bg-white"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <code className="block text-xs font-mono text-green-900 bg-green-100 rounded p-2 break-all select-all">
              {issuedToken}
            </code>
            <p className="text-xs text-green-600 mt-2">
              This token is single-use and expires in 7 days.
            </p>
          </div>
        )}
      </div>

      {/* All tokens list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">
            Registration Tokens
          </h2>
        </div>

        {isLoading && (
          <div className="px-5 py-8 text-sm text-gray-400 text-center">
            Loading...
          </div>
        )}

        {error && (
          <div className="px-5 py-4 text-sm text-red-600">
            Failed to load tokens: {error.message}
          </div>
        )}

        {data && tokens.length === 0 && (
          <div className="px-5 py-8 text-sm text-gray-400 text-center">
            No tokens yet. Generate one above to onboard a new hospital.
          </div>
        )}

        {tokens.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Token</th>
                <th className="px-5 py-3">Hospital</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Expires</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tokens.map((t) => {
                const isConsumed = !!t.consumedAt;
                const isExpired = !isConsumed && new Date(t.expiresAt) < new Date();
                return (
                  <tr key={t.token} className={`hover:bg-gray-50 ${isConsumed || isExpired ? "opacity-60" : ""}`}>
                    <td className="px-5 py-3">
                      <code className="text-xs font-mono text-gray-600">
                        {t.token.slice(0, 12)}...{t.token.slice(-8)}
                      </code>
                      {!isConsumed && (
                        <button
                          onClick={() => handleCopy(t.token)}
                          className="ml-2 text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          Copy
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {t.hospitalName || "—"}
                    </td>
                    <td className="px-5 py-3">
                      {isConsumed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Used
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {isConsumed
                        ? new Date(t.consumedAt!).toLocaleDateString()
                        : new Date(t.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {!isConsumed && !isExpired && (
                        <button
                          onClick={() => handleRevoke(t.token)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}
