import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useTranslation } from '../hooks/useTranslation';
import {
  useGetCallerUserProfile,
  useGetProfileCompletion,
  useGetUserApplications,
  useListScholarships,
} from '../hooks/useQueries';
import ProfileCompletionMeter from '../components/ProfileCompletionMeter';
import SkillGapAnalysis from '../components/SkillGapAnalysis';
import SummaryCard from '../components/SummaryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GraduationCap,
  FileText,
  Calendar,
  Search,
  User,
  FolderOpen,
  BookOpen,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import ProfileSetupModal from '../components/ProfileSetupModal';

export default function Dashboard() {
  const { t } = useTranslation();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: completion, isLoading: completionLoading } = useGetProfileCompletion();
  const { data: applications, isLoading: appsLoading } = useGetUserApplications();
  const { data: scholarships, isLoading: scholarshipsLoading } = useListScholarships();

  const showProfileSetup = !!identity && !profileLoading && profileFetched && profile === null;

  const activeApps =
    applications?.filter((a) => a.status === 'submitted' || a.status === 'underReview').length ?? 0;

  const upcomingDeadlines =
    scholarships?.filter((s) => {
      const deadline = new Date(s.deadline);
      const now = new Date();
      const diff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 30;
    }).length ?? 0;

  // Pick first scholarship for skill gap
  const topScholarship = scholarships?.[0] ?? null;

  const quickActions = [
    {
      label: t('dashboard.browseScholarships'),
      icon: Search,
      path: '/scholarships',
      color: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
    },
    {
      label: t('dashboard.updateProfile'),
      icon: User,
      path: '/profile',
      color: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    },
    {
      label: t('dashboard.uploadDocuments'),
      icon: FolderOpen,
      path: '/documents',
      color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    },
    {
      label: t('dashboard.buildResume'),
      icon: BookOpen,
      path: '/resume-builder',
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
  ];

  if (!identity) {
    navigate({ to: '/login' });
    return null;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Profile Setup Modal */}
      {showProfileSetup && <ProfileSetupModal />}

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-md">
        <img
          src="/assets/generated/dashboard-hero-banner.dim_1200x300.png"
          alt="Dashboard Banner"
          className="w-full object-cover h-36 sm:h-44"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-teal-700/40 flex items-center px-6 sm:px-8">
          <div>
            <h1 className="text-white text-xl sm:text-2xl font-bold">
              {t('dashboard.welcome')}, {profile?.name || 'Student'}!
            </h1>
            <p className="text-teal-200 text-sm mt-1">{t('dashboard.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {completionLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <SummaryCard
              title={t('dashboard.profileCompletion')}
              value={`${Math.round(completion?.completionPercentage ?? 0)}%`}
              icon={User}
              accentColor="teal"
              description={
                completion?.missingFields.length
                  ? `${completion.missingFields.length} items missing`
                  : 'Complete!'
              }
            />
            <SummaryCard
              title={t('dashboard.activeApplications')}
              value={appsLoading ? '...' : activeApps}
              icon={FileText}
              accentColor="saffron"
              description="In progress"
            />
            <SummaryCard
              title={t('dashboard.scholarshipsMatched')}
              value={scholarshipsLoading ? '...' : scholarships?.length ?? 0}
              icon={GraduationCap}
              accentColor="emerald"
              description="Available"
            />
            <SummaryCard
              title={t('dashboard.upcomingDeadlines')}
              value={scholarshipsLoading ? '...' : upcomingDeadlines}
              icon={Calendar}
              accentColor="blue"
              description="Within 30 days"
            />
          </>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Profile Completion + Quick Actions */}
        <div className="space-y-6">
          {/* Profile Completion Meter */}
          <Card className="border-teal-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-teal-800">
                {t('profile.completion')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {completionLoading ? (
                <Skeleton className="h-32 w-32 rounded-full" />
              ) : (
                <ProfileCompletionMeter
                  completionPercentage={completion?.completionPercentage ?? 0}
                  missingItems={completion?.missingFields ?? []}
                  size={130}
                />
              )}
              {completion && completion.completionPercentage < 100 && (
                <div className="w-full">
                  <p className="text-xs font-semibold text-gray-500 mb-2">{t('profile.missingItems')}:</p>
                  <ul className="space-y-1">
                    {completion.missingFields.slice(0, 3).map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                    {completion.missingFields.length > 3 && (
                      <li className="text-xs text-gray-400">
                        +{completion.missingFields.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate({ to: '/profile' })}
                className="w-full text-xs border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                {t('profile.viewProfile')}
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-teal-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-teal-800">
                {t('dashboard.quickActions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {quickActions.map(({ label, icon: Icon, path, color }) => (
                <button
                  key={path}
                  onClick={() => navigate({ to: path as any })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl text-xs font-medium transition-colors ${color}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-center leading-tight">{label}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Skill Gap + Recent Applications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill Gap Analysis */}
          <SkillGapAnalysis
            scholarshipId={topScholarship?.id ?? null}
            requiredSkills={topScholarship?.eligibility.requiredSkills ?? []}
          />

          {/* Recent Applications */}
          <Card className="border-teal-100 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-teal-800">
                {t('applications.title')}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/my-applications' })}
                className="text-xs text-teal-600 hover:text-teal-800 h-7"
              >
                View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {appsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              ) : applications && applications.length > 0 ? (
                <div className="space-y-2">
                  {applications.slice(0, 4).map((app, i) => {
                    const scholarship = scholarships?.find((s) => s.id === app.scholarshipId);
                    const statusColors: Record<string, string> = {
                      draft: 'bg-gray-100 text-gray-600',
                      submitted: 'bg-blue-100 text-blue-700',
                      underReview: 'bg-amber-100 text-amber-700',
                      approved: 'bg-emerald-100 text-emerald-700',
                      rejected: 'bg-red-100 text-red-700',
                    };
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {scholarship?.title ?? `Scholarship #${app.scholarshipId.toString()}`}
                          </p>
                          <p className="text-xs text-gray-500">{scholarship?.provider ?? ''}</p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ml-3 shrink-0 ${
                            statusColors[app.status] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {t(`applications.status.${app.status}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">{t('applications.noApplications')}</p>
                  <Button
                    size="sm"
                    onClick={() => navigate({ to: '/scholarships' })}
                    className="mt-3 bg-teal-700 hover:bg-teal-800 text-white text-xs"
                  >
                    {t('dashboard.browseScholarships')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-400 text-xs border-t border-gray-100 mt-4">
        © {new Date().getFullYear()} {t('nav.appName')} · {t('footer.builtWith')} ❤️ {t('footer.using')}{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            window.location.hostname || 'scholarpath'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
