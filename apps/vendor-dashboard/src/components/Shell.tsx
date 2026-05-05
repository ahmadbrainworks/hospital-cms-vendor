"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import { P } from "@/lib/permissions";
import { ThemeSwitcher } from "./ThemeSwitcher";
import {
  BarChart3,
  TrendingUp,
  Building2,
  Key,
  FileText,
  Zap,
  Radio,
  Package,
  Palette,
  Users,
  LogOut,
  Menu,
  X,
  Plug,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  permissions?: string[];
}

const NAV: NavItem[] = [
  { href: "/overview", label: "Overview", icon: <BarChart3 size={20} /> },
  { href: "/monitoring", label: "Monitoring", icon: <TrendingUp size={20} />, permissions: [P.INSTANCE_VIEW] },
  { href: "/instances", label: "Instances", icon: <Building2 size={20} />, permissions: [P.INSTANCE_VIEW] },
  { href: "/registration-tokens", label: "Tokens", icon: <Key size={20} />, permissions: [P.INSTANCE_VIEW] },
  { href: "/licenses", label: "Licenses", icon: <FileText size={20} />, permissions: [P.LICENSE_VIEW] },
  { href: "/commands", label: "Commands", icon: <Zap size={20} />, permissions: [P.COMMAND_VIEW] },
  { href: "/telemetry", label: "Telemetry", icon: <Radio size={20} />, permissions: [P.TELEMETRY_VIEW] },
  { href: "/packages", label: "Packages", icon: <Package size={20} />, permissions: [P.PACKAGE_VIEW] },
  { href: "/plugins", label: "Plugins", icon: <Plug size={20} />, permissions: [P.PACKAGE_VIEW] },
  { href: "/themes", label: "Themes", icon: <Palette size={20} />, permissions: [P.PACKAGE_VIEW] },
  { href: "/staff", label: "Staff", icon: <Users size={20} />, permissions: [P.STAFF_VIEW] },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user, logout, hasAnyPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const visibleNav = NAV.filter((n) => !n.permissions || hasAnyPermission(...n.permissions));

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--theme-bg)" }}>
      {/* Sidebar */}
      <aside
        className={clsx(
          "border-r flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out z-40",
          sidebarOpen ? "w-64" : "w-20",
        )}
        style={{
          backgroundColor: "var(--theme-surface)",
          borderColor: "var(--theme-border)",
        }}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b" style={{ borderColor: "var(--theme-border)" }}>
          <div
            className={clsx(
              "font-bold transition-all",
              sidebarOpen ? "text-2xl" : "text-sm text-center"
            )}
            style={{ color: "var(--theme-primary)" }}
          >
            {sidebarOpen ? "Hospital CMS" : "HC"}
          </div>
          {sidebarOpen && (
            <div className="text-xs mt-1" style={{ color: "var(--theme-textSecondary)" }}>
              Vendor Dashboard
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNav.map((n) => {
            const active = path === n.href || (n.href !== "/overview" && path.startsWith(n.href + "/"));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  sidebarOpen ? "" : "justify-center",
                  active ? "card-hover" : "hover:opacity-80"
                )}
                title={!sidebarOpen ? n.label : undefined}
                style={active ? {
                  backgroundColor: "rgba(2, 136, 209, 0.15)",
                  borderColor: "var(--theme-primary)",
                  color: "var(--theme-primaryLight)",
                } : {
                  color: "var(--theme-textSecondary)",
                }}
              >
                {n.icon}
                {sidebarOpen && <span>{n.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Toggle button */}
        <div className="p-3 border-t" style={{ borderColor: "var(--theme-border)" }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-secondary w-full justify-center"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* User footer */}
        {user && (
          <div className="px-4 py-4 border-t" style={{ borderColor: "var(--theme-border)" }}>
            {sidebarOpen && (
              <>
                <div className="text-xs font-medium truncate" style={{ color: "var(--theme-text)" }}>
                  {user.displayName}
                </div>
                <div className="text-xs truncate mb-3" style={{ color: "var(--theme-textSecondary)" }}>
                  {user.email}
                </div>
              </>
            )}
            <button
              onClick={() => logout()}
              className="btn btn-danger w-full text-xs justify-center gap-2"
            >
              <LogOut size={16} />
              {sidebarOpen && "Sign out"}
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div
          className="border-b px-8 py-4 flex items-center justify-between"
          style={{
            backgroundColor: "var(--theme-surface)",
            borderColor: "var(--theme-border)",
          }}
        >
          <div className="flex-1" />
          <ThemeSwitcher />
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-8 py-8 animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  );
}
