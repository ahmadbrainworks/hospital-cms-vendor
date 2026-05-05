"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Package,
  Zap,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["hospitals", "packages"])
  );

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Hospitals",
      icon: <Building2 size={20} />,
      children: [
        { label: "All Hospitals", href: "/hospitals", icon: <Building2 size={16} /> },
        {
          label: "Add Hospital",
          href: "/hospitals/new",
          icon: <Plus size={16} />,
        },
      ],
    },
    {
      label: "Packages",
      icon: <Package size={20} />,
      children: [
        {
          label: "Package Library",
          href: "/packages",
          icon: <Package size={16} />,
        },
        {
          label: "Create Package",
          href: "/packages/new",
          icon: <Plus size={16} />,
        },
      ],
    },
    {
      label: "Deployments",
      href: "/deployments",
      icon: <Zap size={20} />,
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <BarChart3 size={20} />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings size={20} />,
    },
  ];

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="w-64 bg-neutral-800 border-r border-neutral-700 overflow-y-auto flex flex-col">
      {/* Logo / Header */}
      <div className="p-6 border-b border-neutral-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Package size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-100">Hospital CMS</h1>
            <p className="text-xs text-neutral-400">Vendor Control Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.href ? (
              // Simple link
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-primary-600 text-white"
                    : "text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ) : (
              // Collapsible group
              <>
                <button
                  onClick={() => toggleExpand(item.label)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-300 hover:bg-neutral-700 transition-colors"
                >
                  {item.icon}
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      expandedItems.has(item.label) ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Submenu */}
                {expandedItems.has(item.label) && item.children && (
                  <div className="pl-4 space-y-1 mt-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href || "#"}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                          isActive(child.href)
                            ? "bg-primary-500/20 text-primary-300"
                            : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50"
                        }`}
                      >
                        {child.icon}
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-700 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-300 hover:bg-neutral-700 transition-colors text-sm">
          <Settings size={18} />
          <span>Account</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error-400 hover:bg-error-500/10 transition-colors text-sm">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* Vendor Info */}
      <div className="p-4 border-t border-neutral-700 bg-neutral-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
            HS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-100 truncate">
              Hospital Systems
            </p>
            <p className="text-xs text-neutral-400 truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
