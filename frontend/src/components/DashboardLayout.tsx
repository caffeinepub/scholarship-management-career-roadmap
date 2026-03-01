import React, { useState } from 'react';
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  FolderOpen,
  User,
  HelpCircle,
  BookOpen,
  Menu,
  X,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useQueries';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' as const },
  { label: 'Scholarships', icon: GraduationCap, path: '/scholarships' as const },
  { label: 'My Applications', icon: FileText, path: '/applications' as const },
  { label: 'Documents', icon: FolderOpen, path: '/documents' as const },
  { label: 'Resume Builder', icon: BookOpen, path: '/resume' as const },
  { label: 'Profile', icon: User, path: '/profile' as const },
  { label: 'Help', icon: HelpCircle, path: '/help' as const },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPath = routerState.location.pathname;
  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/login' });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const displayName = userProfile?.name || identity?.getPrincipal().toString().slice(0, 8) + '...' || 'Guest';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <img src="/assets/generated/scholarpath-logo.dim_128x128.png" alt="ScholarPath" className="w-8 h-8 rounded-lg" />
        <span className="font-bold text-lg text-foreground">ScholarPath</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate({ to: item.path });
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 cursor-pointer text-left
                ${isActive
                  ? 'bg-primary/10 text-primary border-l-4 border-primary pl-2'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-border space-y-2">
        {isAuthenticated && (
          <div className="px-3 py-2 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {identity?.getPrincipal().toString().slice(0, 20)}...
            </p>
          </div>
        )}
        <button
          onClick={handleAuth}
          disabled={loginStatus === 'logging-in'}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
        >
          {isAuthenticated ? (
            <>
              <LogOut className="w-4 h-4" />
              Logout
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              {loginStatus === 'logging-in' ? 'Logging in...' : 'Login'}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/assets/generated/scholarpath-logo.dim_128x128.png" alt="ScholarPath" className="w-6 h-6 rounded" />
            <span className="font-bold text-foreground">ScholarPath</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer opacity-0 pointer-events-none"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="shrink-0 text-center py-3 text-muted-foreground text-xs border-t border-border bg-card">
          © {new Date().getFullYear()} ScholarPath · Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'scholarpath')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline cursor-pointer"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
