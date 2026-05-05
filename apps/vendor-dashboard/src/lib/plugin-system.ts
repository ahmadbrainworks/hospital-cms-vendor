// Hospital plugin system for vendor dashboard

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  icon: string;
  enabled: boolean;
  installDate?: string;
  config?: Record<string, any>;
}

export interface SamplePlugin extends PluginMetadata {
  id: "patient-stats-panel";
  name: "Patient Stats Panel";
  description: "Real-time patient statistics and health metrics";
  icon: "👥";
}

export interface SampleWidget extends PluginMetadata {
  id: "heartbeat-status";
  name: "Heartbeat Status Card";
  description: "Live heartbeat monitoring widget";
  icon: "❤️";
}

// Sample plugins that can be distributed
export const SAMPLE_PLUGINS: (SamplePlugin | SampleWidget)[] = [
  {
    id: "patient-stats-panel",
    name: "Patient Stats Panel",
    version: "1.0.0",
    author: "Hospital CMS Team",
    description: "Real-time patient statistics and health metrics dashboard panel",
    icon: "👥",
    enabled: true,
    installDate: new Date().toISOString(),
  },
  {
    id: "heartbeat-status",
    name: "Heartbeat Status Card",
    version: "1.0.0",
    author: "Hospital CMS Team",
    description: "Live heartbeat monitoring widget with visual indicators",
    icon: "❤️",
    enabled: true,
    installDate: new Date().toISOString(),
  },
];

export function getInstalledPlugins(): PluginMetadata[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("hospital-cms-plugins");
  return stored ? JSON.parse(stored) : [];
}

export function saveInstalledPlugins(plugins: PluginMetadata[]) {
  localStorage.setItem("hospital-cms-plugins", JSON.stringify(plugins));
}

export function installPlugin(plugin: PluginMetadata) {
  const installed = getInstalledPlugins();
  const existing = installed.find((p) => p.id === plugin.id);

  if (!existing) {
    installed.push({
      ...plugin,
      installDate: new Date().toISOString(),
    });
    saveInstalledPlugins(installed);
  }
}

export function uninstallPlugin(pluginId: string) {
  const installed = getInstalledPlugins();
  const filtered = installed.filter((p) => p.id !== pluginId);
  saveInstalledPlugins(filtered);
}

export function togglePlugin(pluginId: string, enabled: boolean) {
  const installed = getInstalledPlugins();
  const plugin = installed.find((p) => p.id === pluginId);

  if (plugin) {
    plugin.enabled = enabled;
    saveInstalledPlugins(installed);
  }
}
