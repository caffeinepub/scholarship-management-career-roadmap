import { useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Briefcase,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  Menu,
  User,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { clearProfileId } from "../hooks/useProfile";
import LanguageToggle from "./LanguageToggle";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/profile", label: "Profile", icon: User },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/scholarships", label: "Scholarships", icon: Award },
  { path: "/applications", label: "My Applications", icon: BookOpen },
  { path: "/resume", label: "Resume Builder", icon: Briefcase },
  { path: "/roadmap", label: "Career Roadmap", icon: MapIcon },
  { path: "/help", label: "Help", icon: HelpCircle },
];

export default function DashboardLayout() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    clearProfileId();
    await clear();
    queryClient.clear();
  };

  const appId = encodeURIComponent(
    window.location.hostname || "scholarsync-app",
  );

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const currentPageLabel =
    navItems.find((n) => isActive(n.path))?.label ?? "ScholarSync";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: overlay dismiss
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Glassmorphic Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-30 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "oklch(0.18 0.05 265)",
          borderRight: "1px solid oklch(0.28 0.07 265 / 0.6)",
        }}
      >
        {/* Glass overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%)",
            backdropFilter: "blur(20px)",
          }}
        />

        <div className="relative flex flex-col h-full">
          {/* Logo */}
          <div
            className="flex items-center gap-3 px-6 py-5"
            style={{ borderBottom: "1px solid oklch(0.28 0.07 265 / 0.5)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "oklch(0.78 0.12 60)" }}
            >
              <GraduationCap
                className="w-4 h-4"
                style={{ color: "oklch(0.18 0.05 265)" }}
              />
            </div>
            <span
              className="font-display font-bold text-lg tracking-tight"
              style={{ color: "oklch(0.93 0.02 265)" }}
            >
              ScholarSync
            </span>
            <button
              type="button"
              className="ml-auto lg:hidden transition-colors"
              style={{ color: "oklch(0.93 0.02 265 / 0.6)" }}
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  data-ocid={`nav.${label.toLowerCase().replace(/\s+/g, "_")}.link`}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group overflow-hidden"
                  style={
                    active
                      ? {
                          background: "oklch(0.25 0.07 265)",
                          color: "oklch(0.93 0.02 265)",
                        }
                      : {
                          color: "oklch(0.93 0.02 265 / 0.55)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background =
                        "oklch(0.25 0.07 265 / 0.5)";
                      (e.currentTarget as HTMLElement).style.color =
                        "oklch(0.93 0.02 265)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "";
                      (e.currentTarget as HTMLElement).style.color =
                        "oklch(0.93 0.02 265 / 0.55)";
                    }
                  }}
                >
                  {/* Active left bar */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full"
                      style={{ background: "oklch(0.78 0.12 60)" }}
                    />
                  )}
                  <Icon className="w-4 h-4 shrink-0 ml-1" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User info + logout */}
          <div
            className="px-3 pb-4 pt-3"
            style={{ borderTop: "1px solid oklch(0.28 0.07 265 / 0.5)" }}
          >
            {identity && (
              <div
                className="mb-2 px-3 py-2 rounded-lg"
                style={{ background: "oklch(0.25 0.07 265 / 0.6)" }}
              >
                <p
                  className="text-xs truncate font-mono"
                  style={{ color: "oklch(0.93 0.02 265 / 0.5)" }}
                >
                  {identity.getPrincipal().toString().slice(0, 22)}...
                </p>
              </div>
            )}
            <button
              type="button"
              data-ocid="nav.logout.button"
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{ color: "oklch(0.93 0.02 265 / 0.55)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "oklch(0.65 0.2 25)";
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.65 0.2 25 / 0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "oklch(0.93 0.02 265 / 0.55)";
                (e.currentTarget as HTMLElement).style.background = "";
              }}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-4">
          <button
            type="button"
            data-ocid="nav.menu.toggle"
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-foreground hidden sm:block">
            {currentPageLabel}
          </span>
          <div className="flex-1" />
          <LanguageToggle />
        </header>

        {/* Page content with fade-in transition */}
        <main className="flex-1 overflow-auto animate-in fade-in duration-300">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} ScholarSync. Built with </span>
          <span className="text-red-500">♥</span>
          <span> using </span>
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
