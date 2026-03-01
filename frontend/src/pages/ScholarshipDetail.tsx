import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import {
  Calendar,
  Building2,
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetScholarshipById,
  useGetMyStudent,
  useGetEligibilityInsights,
  useApplyToScholarship,
} from '../hooks/useQueries';

function InsightsPanel({
  studentId,
  scholarshipId,
}: {
  studentId: bigint;
  scholarshipId: bigint;
}) {
  const { data: insights, isLoading } = useGetEligibilityInsights(studentId, scholarshipId);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const eligibilityClass =
    insights.eligibilityStatus === 'Eligible'
      ? 'bg-green-100 text-green-700 border border-green-200'
      : 'bg-red-100 text-red-700 border border-red-200';

  const riskClass =
    insights.riskLevel === 'Low'
      ? 'bg-green-100 text-green-700 border border-green-200'
      : insights.riskLevel === 'Medium'
        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
        : 'bg-red-100 text-red-700 border border-red-200';

  const readiness = Number(insights.readinessScore);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        Intelligence Insights
      </h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {/* Eligibility */}
        <span className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-medium ${eligibilityClass}`}>
          <ShieldCheck className="w-4 h-4" />
          {insights.eligibilityStatus}
        </span>
        {/* Risk level */}
        <span className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-medium ${riskClass}`}>
          {insights.riskLevel} Risk
        </span>
        {/* Urgent alert */}
        {insights.urgentAlert && (
          <span className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-medium bg-orange-100 text-orange-700 border border-orange-200">
            <AlertTriangle className="w-4 h-4" />
            Deadline Urgent
          </span>
        )}
      </div>

      {/* Readiness score bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground">Scholarship Readiness</span>
          <span
            className={`text-sm font-bold ${
              readiness >= 80 ? 'text-green-600' : readiness >= 50 ? 'text-yellow-600' : 'text-red-500'
            }`}
          >
            {readiness}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              readiness >= 80 ? 'bg-green-500' : readiness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${readiness}%` }}
          />
        </div>
        {readiness === 100 && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> High Success Probability!
          </p>
        )}
        {insights.riskLevel === 'High' && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Missing mandatory documents — High Rejection Risk
          </p>
        )}
      </div>
    </div>
  );
}

export default function ScholarshipDetail() {
  const { scholarshipId } = useParams({ strict: false }) as { scholarshipId?: string };
  const navigate = useNavigate();

  const schId = scholarshipId ? BigInt(scholarshipId) : null;
  const { data: scholarship, isLoading: schLoading } = useGetScholarshipById(schId);
  const { data: student } = useGetMyStudent();
  const applyMutation = useApplyToScholarship();

  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  const handleApply = async () => {
    if (!scholarshipId) return;
    setApplyError('');
    try {
      await applyMutation.mutateAsync({ scholarshipId });
      setApplySuccess(true);
    } catch (err: unknown) {
      setApplyError(err instanceof Error ? err.message : 'Application failed');
    }
  };

  if (schLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 p-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="font-semibold text-foreground text-lg">Scholarship Not Found</h2>
        <button
          onClick={() => navigate({ to: '/scholarships' })}
          className="mt-4 text-primary text-sm hover:underline flex items-center gap-1 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scholarships
        </button>
      </div>
    );
  }

  const deadlineMs = Number(scholarship.deadline) / 1_000_000;
  const deadlineDate = new Date(deadlineMs);
  const isValidDate = !isNaN(deadlineDate.getTime()) && deadlineMs > 0;
  const formattedDeadline = isValidDate
    ? deadlineDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Open';

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate({ to: '/scholarships' })}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Scholarships
      </button>

      {/* Header card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{scholarship.title}</h1>
            <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
              <Building2 className="w-4 h-4 shrink-0" />
              <span className="text-sm">{scholarship.provider}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4 shrink-0" />
            Deadline: {formattedDeadline}
          </div>
        </div>

        {scholarship.description && (
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{scholarship.description}</p>
        )}

        {/* Eligible categories & course levels */}
        <div className="mt-4 flex flex-wrap gap-2">
          {scholarship.eligibleCategories.map((cat) => (
            <span key={cat} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {cat.toUpperCase()}
            </span>
          ))}
          {scholarship.eligibleCourseLevels.map((lvl) => (
            <span key={lvl} className="text-xs bg-secondary/60 text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
              {lvl}
            </span>
          ))}
        </div>
      </div>

      {/* Intelligence Insights — only when student profile exists */}
      {student && (
        <InsightsPanel studentId={student.studentId} scholarshipId={scholarship.id} />
      )}

      {/* Required Documents */}
      {scholarship.requiredDocuments.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Required Documents
          </h3>
          <ul className="space-y-2">
            {scholarship.requiredDocuments.map((doc) => (
              <li key={doc} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Apply section */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        {applySuccess ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-medium">Application Submitted!</p>
              <p className="text-sm mt-0.5">Your application has been recorded successfully.</p>
            </div>
          </div>
        ) : (
          <>
            {applyError && (
              <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {applyError}
              </div>
            )}
            {!student && (
              <div className="mb-3 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-700">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                Please complete your profile before applying.
              </div>
            )}
            <button
              onClick={handleApply}
              disabled={applyMutation.isPending || !student}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Apply for this Scholarship'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
