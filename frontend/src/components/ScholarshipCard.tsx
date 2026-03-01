import React from 'react';
import { Calendar, Tag, Building2, ArrowRight, AlertTriangle, Loader2 } from 'lucide-react';
import { Scholarship } from '../backend';
import { useGetMyStudent, useGetEligibilityInsights } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onApply?: (scholarshipId: string) => void;
}

function InsightBadges({ studentId, scholarshipId }: { studentId: bigint; scholarshipId: bigint }) {
  const { data: insights, isLoading } = useGetEligibilityInsights(studentId, scholarshipId);

  if (isLoading) {
    return (
      <div className="flex gap-2 flex-wrap mt-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
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

  return (
    <div className="flex gap-1.5 flex-wrap mt-2">
      {/* Eligibility */}
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${eligibilityClass}`}>
        {insights.eligibilityStatus}
      </span>
      {/* Risk level */}
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskClass}`}>
        {insights.riskLevel} Risk
      </span>
      {/* Urgent alert */}
      {insights.urgentAlert && (
        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700 border border-orange-200">
          <AlertTriangle className="w-3 h-3" />
          Urgent
        </span>
      )}
      {/* Readiness score */}
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
        {Number(insights.readinessScore)}% Ready
      </span>
    </div>
  );
}

export default function ScholarshipCard({ scholarship, onApply }: ScholarshipCardProps) {
  const { data: student } = useGetMyStudent();

  const deadlineMs = Number(scholarship.deadline) / 1_000_000;
  const deadlineDate = new Date(deadlineMs);
  const isValidDate = !isNaN(deadlineDate.getTime()) && deadlineMs > 0;
  const formattedDeadline = isValidDate
    ? deadlineDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Open';

  const now = Date.now();
  const daysLeft = isValidDate ? Math.ceil((deadlineMs - now) / (1000 * 60 * 60 * 24)) : null;
  const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3">
      {/* Title & Provider */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground text-base leading-snug">{scholarship.title}</h3>
          {isUrgent && (
            <span className="shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700 border border-orange-200">
              <AlertTriangle className="w-3 h-3" />
              {daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span>{scholarship.provider}</span>
        </div>
      </div>

      {/* Description */}
      {scholarship.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{scholarship.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          Deadline: {formattedDeadline}
        </span>
        {scholarship.eligibleCategories.length > 0 && (
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 shrink-0" />
            {scholarship.eligibleCategories.map((c) => c.toUpperCase()).join(', ')}
          </span>
        )}
      </div>

      {/* Intelligence badges — only shown when student profile exists */}
      {student && (
        <InsightBadges studentId={student.studentId} scholarshipId={scholarship.id} />
      )}

      {/* Apply button */}
      {onApply && (
        <button
          onClick={() => onApply(scholarship.id.toString())}
          className="mt-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Apply Now
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
