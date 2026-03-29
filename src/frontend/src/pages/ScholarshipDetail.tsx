import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Loader2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import {
  useApplyToScholarship,
  useGetEligibilityInsights,
  useGetMyProfile,
} from "../hooks/useQueries";
import type { EligibilityInsightsResult } from "../hooks/useQueries";

function InsightsPanel({
  studentId,
  scholarshipId,
}: {
  studentId: bigint;
  scholarshipId: bigint;
}) {
  const { data: insights, isLoading } = useGetEligibilityInsights(
    studentId,
    scholarshipId,
  );

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

  const typedInsights = insights as EligibilityInsightsResult;

  const eligibilityClass =
    typedInsights.eligibilityStatus === "Eligible"
      ? "bg-green-100 text-green-700 border border-green-200"
      : "bg-red-100 text-red-700 border border-red-200";

  const riskClass =
    typedInsights.riskLevel === "Low"
      ? "bg-green-100 text-green-700 border border-green-200"
      : typedInsights.riskLevel === "Medium"
        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
        : "bg-red-100 text-red-700 border border-red-200";

  const readiness = Number(typedInsights.readinessScore);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        Intelligence Insights
      </h3>

      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-medium ${eligibilityClass}`}
        >
          <ShieldCheck className="w-4 h-4" />
          {typedInsights.eligibilityStatus}
        </span>
        <span
          className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-medium ${riskClass}`}
        >
          {typedInsights.riskLevel} Risk
        </span>
        {typedInsights.urgentAlert && (
          <span className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-medium bg-orange-100 text-orange-700 border border-orange-200">
            <AlertTriangle className="w-4 h-4" />
            Deadline Urgent
          </span>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground">
            Scholarship Readiness
          </span>
          <span
            className={`text-sm font-bold ${
              readiness >= 80
                ? "text-green-600"
                : readiness >= 50
                  ? "text-yellow-600"
                  : "text-red-500"
            }`}
          >
            {readiness}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              readiness >= 80
                ? "bg-green-500"
                : readiness >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
            style={{ width: `${readiness}%` }}
          />
        </div>
        {readiness === 100 && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> High Success Probability!
          </p>
        )}
        {typedInsights.riskLevel === "High" && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Missing mandatory documents —
            High Rejection Risk
          </p>
        )}
      </div>
    </div>
  );
}

export default function ScholarshipDetail() {
  const { scholarshipId } = useParams({ strict: false }) as {
    scholarshipId?: string;
  };
  const navigate = useNavigate();

  const { data: student } = useGetMyProfile();
  const applyMutation = useApplyToScholarship();

  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState("");

  const handleApply = async () => {
    if (!scholarshipId) return;
    setApplyError("");
    try {
      await applyMutation.mutateAsync({ scholarshipId });
      setApplySuccess(true);
    } catch (err: unknown) {
      setApplyError(err instanceof Error ? err.message : "Application failed");
    }
  };

  // Since scholarships are static data, we show a not-found state if no ID
  if (!scholarshipId) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="font-semibold text-foreground text-lg">
          Scholarship Not Found
        </h2>
        <button
          type="button"
          onClick={() => navigate({ to: "/scholarships" })}
          className="mt-4 text-primary text-sm hover:underline flex items-center gap-1 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scholarships
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 p-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate({ to: "/scholarships" })}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Scholarships
      </button>

      {/* Header card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Scholarship #{scholarshipId}
            </h1>
            <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
              <Building2 className="w-4 h-4 shrink-0" />
              <span className="text-sm">
                View details on the official website
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4 shrink-0" />
            Check official site for deadline
          </div>
        </div>
      </div>

      {/* Intelligence Insights — only when student profile exists */}
      {student && (
        <InsightsPanel
          studentId={student.profileId}
          scholarshipId={BigInt(scholarshipId)}
        />
      )}

      {/* Apply section */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        {applySuccess ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-medium">Application Submitted!</p>
              <p className="text-sm mt-0.5">
                Your application has been recorded successfully.
              </p>
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
              type="button"
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
                "Apply for this Scholarship"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
