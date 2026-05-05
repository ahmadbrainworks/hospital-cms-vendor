/** Instance health and status utilities */

export type InstanceStatus = "online" | "degraded" | "offline";
export type NetworkQuality = "excellent" | "good" | "degraded" | "offline";

export function getInstanceStatus(
  lastHeartbeat: string | null | undefined,
  networkQuality?: string,
): InstanceStatus {
  if (!lastHeartbeat) return "offline";

  const lastHeartbeatTime = new Date(lastHeartbeat).getTime();
  const ageMs = Date.now() - lastHeartbeatTime;
  const ageMinutes = ageMs / 1000 / 60;

  // Online if heartbeat within last 5 minutes (heartbeat every 30s)
  if (ageMinutes < 5 && networkQuality !== "offline") {
    return "online";
  }

  // Degraded if heartbeat within last 15 minutes or network is degraded
  if (ageMinutes < 15 || networkQuality === "degraded") {
    return "degraded";
  }

  return "offline";
}

export function getStatusColor(status: InstanceStatus): string {
  switch (status) {
    case "online":
      return "bg-green-100 text-green-800 border-green-300";
    case "degraded":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "offline":
      return "bg-red-100 text-red-800 border-red-300";
  }
}

export function getStatusBgColor(status: InstanceStatus): string {
  switch (status) {
    case "online":
      return "bg-green-50";
    case "degraded":
      return "bg-yellow-50";
    case "offline":
      return "bg-red-50";
  }
}

export function formatLastHeartbeat(lastHeartbeat: string | null | undefined): string {
  if (!lastHeartbeat) return "Never";

  const date = new Date(lastHeartbeat);
  const ageMs = Date.now() - date.getTime();
  const ageSeconds = Math.floor(ageMs / 1000);
  const ageMinutes = Math.floor(ageSeconds / 60);
  const ageHours = Math.floor(ageMinutes / 60);
  const ageDays = Math.floor(ageHours / 24);

  if (ageSeconds < 60) return "Just now";
  if (ageMinutes < 60) return `${ageMinutes}m ago`;
  if (ageHours < 24) return `${ageHours}h ago`;
  return `${ageDays}d ago`;
}

export function getNetworkQualityColor(quality?: string): string {
  switch (quality) {
    case "excellent":
      return "text-green-600";
    case "good":
      return "text-blue-600";
    case "degraded":
      return "text-yellow-600";
    case "offline":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

export function getNetworkQualityLabel(quality?: string): string {
  switch (quality) {
    case "excellent":
      return "Excellent";
    case "good":
      return "Good";
    case "degraded":
      return "Degraded";
    case "offline":
      return "Offline";
    default:
      return "Unknown";
  }
}
