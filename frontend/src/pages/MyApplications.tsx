import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useTranslation } from '../hooks/useTranslation';
import { useGetUserApplications, useListScholarships } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, ArrowRight, FileText } from 'lucide-react';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'applications.status.draft' },
  submitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'applications.status.submitted' },
  underReview: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'applications.status.underReview' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'applications.status.approved' },
  rejected: { bg: 'bg-red-100', text: 'text-red-600', label: 'applications.status.rejected' },
};

export default function MyApplications() {
  const { t } = useTranslation();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const { data: applications, isLoading: appsLoading } = useGetUserApplications();
  const { data: scholarships } = useListScholarships();

  if (!identity) {
    navigate({ to: '/login' });
    return null;
  }

  const getScholarship = (id: bigint) => scholarships?.find((s) => s.id === id);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">{t('applications.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {applications?.length ?? 0} total applications
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate({ to: '/scholarships' })}
          className="bg-teal-700 hover:bg-teal-800 text-white text-xs gap-1.5"
        >
          <GraduationCap className="h-3.5 w-3.5" />
          Browse More
        </Button>
      </div>

      {/* Applications list */}
      {appsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : applications && applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((app, i) => {
            const scholarship = getScholarship(app.scholarshipId);
            const statusStyle = STATUS_STYLES[app.status] ?? STATUS_STYLES.draft;

            return (
              <Card key={i} className="border-teal-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                        <GraduationCap className="h-5 w-5 text-teal-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {scholarship?.title ?? `Scholarship #${app.scholarshipId.toString()}`}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {scholarship?.provider ?? 'Unknown Provider'}
                        </p>
                        {scholarship?.deadline && (
                          <p className="text-xs text-amber-600 mt-1">
                            Deadline: {scholarship.deadline}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {t(statusStyle.label)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate({
                            to: '/scholarships/$id',
                            params: { id: app.scholarshipId.toString() },
                          })
                        }
                        className="text-xs text-teal-600 hover:text-teal-800 h-6 px-2 gap-1"
                      >
                        View <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-teal-100 shadow-sm">
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">{t('applications.noApplications')}</p>
            <Button
              onClick={() => navigate({ to: '/scholarships' })}
              className="bg-teal-700 hover:bg-teal-800 text-white"
            >
              {t('dashboard.browseScholarships')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <footer className="text-center py-4 text-gray-400 text-xs border-t border-gray-100">
        © {new Date().getFullYear()} ScholarPath · Built with ❤️ using{' '}
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
