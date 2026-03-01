import React from 'react';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useGetMyApplications, useGetScholarships } from '../hooks/useQueries';
import { ScholarshipApplication, Scholarship } from '../backend';

const statusConfig: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  Pending: {
    label: 'Pending',
    icon: <Clock className="w-3.5 h-3.5" />,
    className: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  },
  'Under Review': {
    label: 'Under Review',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  Approved: {
    label: 'Approved',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    className: 'bg-green-100 text-green-700 border border-green-200',
  },
  Rejected: {
    label: 'Rejected',
    icon: <XCircle className="w-3.5 h-3.5" />,
    className: 'bg-red-100 text-red-700 border border-red-200',
  },
};

function formatDate(timestamp: bigint): string {
  // Backend timestamps are in nanoseconds
  const ms = Number(timestamp) / 1_000_000;
  if (ms === 0) return 'N/A';
  const date = new Date(ms);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface ApplicationCardProps {
  application: ScholarshipApplication;
  scholarship: Scholarship | undefined;
}

function ApplicationCard({ application, scholarship }: ApplicationCardProps) {
  const status = application.applicationStatus;
  const cfg = statusConfig[status] ?? statusConfig['Pending'];

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base truncate">
            {scholarship?.title ?? `Scholarship #${application.scholarshipId}`}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {scholarship?.provider ?? 'Unknown Provider'}
          </p>
        </div>
        {/* Status badge */}
        <span
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${cfg.className}`}
        >
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      {/* Rejection reason */}
      {status === 'Rejected' && application.rejectionReason && (
        <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-red-700">Rejection Reason</p>
            <p className="text-xs text-red-600 mt-0.5">{application.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Applied: {formatDate(application.appliedDate)}
        </span>
        <span className="flex items-center gap-1">
          <ExternalLink className="w-3.5 h-3.5" />
          Last Updated: {formatDate(application.lastUpdated)}
        </span>
      </div>
    </div>
  );
}

export default function MyApplications() {
  const { data: applications = [], isLoading: appsLoading } = useGetMyApplications();
  const { data: scholarships = [], isLoading: scholarsLoading } = useGetScholarships();

  const isLoading = appsLoading || scholarsLoading;

  const getScholarship = (scholarshipId: bigint): Scholarship | undefined =>
    scholarships.find((s) => s.id === scholarshipId);

  const statusCounts = {
    total: applications.length,
    approved: applications.filter((a) => a.applicationStatus === 'Approved').length,
    pending: applications.filter(
      (a) => a.applicationStatus === 'Pending' || a.applicationStatus === 'Under Review',
    ).length,
    rejected: applications.filter((a) => a.applicationStatus === 'Rejected').length,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
          <p className="text-sm text-muted-foreground">Track all your scholarship applications</p>
        </div>
      </div>

      {/* Summary stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: statusCounts.total, color: 'text-foreground' },
            { label: 'Approved', value: statusCounts.approved, color: 'text-green-600' },
            { label: 'In Progress', value: statusCounts.pending, color: 'text-blue-600' },
            { label: 'Rejected', value: statusCounts.rejected, color: 'text-red-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-3 text-center shadow-sm">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading applications...</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && applications.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">No Applications Yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Browse scholarships and apply to get started.
          </p>
        </div>
      )}

      {/* Application cards */}
      {!isLoading && applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard
              key={app.applicationId.toString()}
              application={app}
              scholarship={getScholarship(app.scholarshipId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
