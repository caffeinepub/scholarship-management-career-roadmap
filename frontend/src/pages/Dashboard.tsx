import React from 'react';
import { BookOpen, FileText, CheckCircle, TrendingUp, Loader2 } from 'lucide-react';
import { useGetMyStudent, useGetMyApplications, useGetScholarships } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';

function SummaryCard({
  icon,
  value,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  value: string | number;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="font-medium text-foreground text-sm mt-0.5">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  );
}

export default function Dashboard() {
  const { data: student, isLoading: studentLoading } = useGetMyStudent();
  const { data: applications = [], isLoading: appsLoading } = useGetMyApplications();
  const { data: scholarships = [], isLoading: scholarsLoading } = useGetScholarships();
  const navigate = useNavigate();

  const isLoading = studentLoading || appsLoading || scholarsLoading;

  const profileCompletion = student ? Number(student.profileCompletionPercentage) : 0;
  const approvedCount = applications.filter((a) => a.applicationStatus === 'Approved').length;
  const pendingCount = applications.filter(
    (a) => a.applicationStatus === 'Pending' || a.applicationStatus === 'Under Review',
  ).length;
  const activeScholarships = scholarships.filter((s) => s.isActive).length;

  const completionColor =
    profileCompletion >= 80
      ? 'text-green-600'
      : profileCompletion >= 50
        ? 'text-yellow-600'
        : 'text-red-500';

  const completionBg =
    profileCompletion >= 80
      ? 'bg-green-500'
      : profileCompletion >= 50
        ? 'bg-yellow-500'
        : 'bg-red-500';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src="/assets/generated/dashboard-hero-banner.dim_1200x300.png"
          alt="ScholarPath Dashboard"
          className="w-full object-cover h-40 md:h-48"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-center px-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome{student ? `, ${student.fullName.split(' ')[0]}` : ' back'}!
            </h1>
            <p className="text-white/80 text-sm mt-1">
              {student
                ? `${student.courseName} · ${student.instituteName}`
                : 'Complete your profile to get started'}
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
        </div>
      )}

      {/* Summary Cards */}
      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={<BookOpen className="w-5 h-5 text-primary" />}
            value={activeScholarships}
            title="Available"
            description="Active scholarships"
            color="bg-primary/10"
          />
          <SummaryCard
            icon={<FileText className="w-5 h-5 text-blue-600" />}
            value={applications.length}
            title="Applied"
            description="Total applications"
            color="bg-blue-50"
          />
          <SummaryCard
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            value={approvedCount}
            title="Approved"
            description="Successful applications"
            color="bg-green-50"
          />
          <SummaryCard
            icon={<TrendingUp className="w-5 h-5 text-yellow-600" />}
            value={pendingCount}
            title="In Progress"
            description="Pending review"
            color="bg-yellow-50"
          />
        </div>
      )}

      {/* Profile Completion */}
      {!isLoading && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-foreground">Profile Completion</span>
            <span className={`font-bold ${completionColor}`}>{profileCompletion}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${completionBg}`}
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          {profileCompletion < 100 && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Complete your profile to improve scholarship readiness.
              </p>
              <button
                onClick={() => navigate({ to: '/profile' })}
                className="text-xs text-primary hover:underline font-medium"
              >
                Complete Profile →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recent Applications */}
      {!isLoading && applications.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Applications</h2>
            <button
              onClick={() => navigate({ to: '/applications' })}
              className="text-xs text-primary hover:underline font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => {
              const statusClass =
                app.applicationStatus === 'Approved'
                  ? 'bg-green-100 text-green-700'
                  : app.applicationStatus === 'Rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700';
              return (
                <div
                  key={app.applicationId.toString()}
                  className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0"
                >
                  <span className="text-sm text-foreground">
                    Scholarship #{app.scholarshipId.toString()}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClass}`}>
                    {app.applicationStatus}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
