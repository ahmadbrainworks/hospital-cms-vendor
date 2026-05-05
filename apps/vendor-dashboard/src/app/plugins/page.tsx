"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import {
  Download,
  Trash2,
  ToggleLeft,
} from "lucide-react";
import {
  SAMPLE_PLUGINS,
  getInstalledPlugins,
  installPlugin,
  uninstallPlugin,
  togglePlugin,
  type PluginMetadata,
} from "@/lib/plugin-system";

export default function PluginsPage() {
  const [installed, setInstalled] = useState<PluginMetadata[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setInstalled(getInstalledPlugins());
  }, []);

  const handleInstall = (plugin: PluginMetadata) => {
    installPlugin(plugin);
    setInstalled(getInstalledPlugins());
  };

  const handleUninstall = (pluginId: string) => {
    if (confirm("Uninstall this plugin?")) {
      uninstallPlugin(pluginId);
      setInstalled(getInstalledPlugins());
    }
  };

  const handleToggle = (pluginId: string, enabled: boolean) => {
    togglePlugin(pluginId, !enabled);
    setInstalled(getInstalledPlugins());
  };

  const isInstalled = (pluginId: string) =>
    installed.some((p) => p.id === pluginId);

  const getPluginStatus = (pluginId: string) =>
    installed.find((p) => p.id === pluginId);

  if (!mounted) return null;

  return (
    <Shell>
      <div className="mb-8 animate-slide-up">
        <h1
          className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(to right, var(--theme-primary), var(--theme-secondary))",
          }}
        >
          Plugins & Widgets
        </h1>
        <p className="mt-2" style={{ color: "var(--theme-textSecondary)" }}>
          Extend hospital functionality with plugins and widgets
        </p>
      </div>

      <div className="grid gap-6">
        {SAMPLE_PLUGINS.map((plugin, idx) => {
          const installed_plugin = getPluginStatus(plugin.id);
          const is_installed = isInstalled(plugin.id);

          return (
            <div
              key={plugin.id}
              className="card-hover p-6 animate-scale-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div
                    className="text-4xl"
                    style={{ opacity: 0.7 }}
                  >
                    {plugin.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold" style={{ color: "var(--theme-text)" }}>
                        {plugin.name}
                      </h3>
                      {is_installed && (
                        <span
                          className="badge-success"
                          style={{
                            backgroundColor: "rgba(16, 185, 129, 0.15)",
                            color: "#6ee7b7",
                            borderColor: "rgba(16, 185, 129, 0.3)",
                          }}
                        >
                          Installed
                        </span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: "var(--theme-textSecondary)" }}>
                      {plugin.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: "var(--theme-textSecondary)" }}>
                      <span>v{plugin.version}</span>
                      <span>by {plugin.author}</span>
                      {is_installed && installed_plugin && (
                        <span>
                          Installed{" "}
                          {new Date(installed_plugin.installDate!).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {is_installed ? (
                    <>
                      <button
                        onClick={() =>
                          handleToggle(plugin.id, installed_plugin?.enabled || false)
                        }
                        className="btn btn-secondary"
                        title={
                          installed_plugin?.enabled ? "Disable" : "Enable"
                        }
                      >
                        <ToggleLeft size={18} />
                      </button>
                      <button
                        onClick={() => handleUninstall(plugin.id)}
                        className="btn btn-danger"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleInstall(plugin)}
                      className="btn btn-primary"
                    >
                      <Download size={18} />
                      <span>Install</span>
                    </button>
                  )}
                </div>
              </div>

              {is_installed && installed_plugin && !installed_plugin.enabled && (
                <div
                  className="text-xs p-2 rounded"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    color: "#fcd34d",
                  }}
                >
                  ⚠️ This plugin is disabled
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
