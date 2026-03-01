import React, { useState } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  BookOpen,
  FolderOpen,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../hooks/useTranslation';
import LanguageToggle from './LanguageToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Separator } from '@/components/ui/separator';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const currentPath = router.state.location.pathname;

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/scholarships', label: t('nav.scholarships'), icon: GraduationCap },
    { path: '/my-applications', label: t('nav.myApplications'), icon: FileText },
    { path: '/resume-builder', label: t('nav.resumeBuilder'), icon: BookOpen },
    { path: '/documents', label: t('nav.documents'), icon: FolderOpen },
    { path: '/profile', label: t('nav.profile'), icon: User },
    { path: '/help', label: t('nav.help'), icon: HelpCircle },
  ];

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    router.navigate({ to: '/login' });
  };

  const userName = profile?.name || identity?.getPrincipal().toString().slice(0, 8) + '...';
  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-teal-700/30">
        <img
          src="/assets/generated/scholarpath-logo.dim_128x128.png"
          alt="ScholarPath Portal Logo"
          className="h-9 w-9 rounded-lg object-cover"
        />
        <div>
          <p className="font-bold text-white text-sm leading-tight">{t('nav.appName')}</p>
          <p className="text-teal-300 text-xs leading-tight">{t('nav.tagline')}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = currentPath === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-saffron text-white shadow-sm'
                  : 'text-teal-100 hover:bg-teal-700/50 hover:text-white'
              }`}
            >
              <Icon
                className={`shrink-0 ${isActive ? 'text-white' : 'text-teal-300 group-hover:text-white'}`}
                style={{ height: '1.125rem', width: '1.125rem' }}
              />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-teal-700/30">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <Avatar className="h-8 w-8 bg-saffron shrink-0">
            <AvatarFallback className="bg-saffron text-white text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{userName}</p>
            <p className="text-teal-300 text-xs truncate">{profile?.email || 'Student'}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-teal-200 hover:text-white hover:bg-teal-700/50 text-xs gap-2"
        >
          <LogOut className="h-3.5 w-3.5" />
          {t('nav.logout')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-teal-900 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-teal-900 z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
              <span className="text-teal-700 font-semibold">{t('nav.appName')}</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-gray-700 font-medium">
                {navItems.find((n) => n.path === currentPath)?.label ?? t('nav.dashboard')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-teal-700 text-white text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {userName}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
