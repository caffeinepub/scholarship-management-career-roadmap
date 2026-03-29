import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import type { StaticScholarship } from "../data/scholarshipsData";
import { useGetMyProfile } from "../hooks/useQueries";
import { calculateMatchScore } from "../utils/matchScore";
import RedirectWarningModal from "./RedirectWarningModal";

interface ScholarshipDetailModalProps {
  scholarship: StaticScholarship | null;
  onClose: () => void;
}

const categoryColors: Record<string, string> = {
  "Government Scholarships (International)":
    "bg-blue-100 text-blue-700 border-blue-200",
  "Indian Scholarships (Government & Private)":
    "bg-orange-100 text-orange-700 border-orange-200",
  "Additional Global & Indian Scholarships":
    "bg-purple-100 text-purple-700 border-purple-200",
  "Open/Loan Schemes": "bg-teal-100 text-teal-700 border-teal-200",
};

const typeColors: Record<string, string> = {
  "Merit-based": "bg-green-100 text-green-700 border-green-200",
  "Need-based": "bg-amber-100 text-amber-700 border-amber-200",
  "Merit-cum-Means": "bg-sky-100 text-sky-700 border-sky-200",
  "Minority/Quota-based": "bg-rose-100 text-rose-700 border-rose-200",
  "Education Loan": "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const matchStatusStyles = {
  "High Chance": "bg-green-100 text-green-700 border-green-300",
  "Medium Chance": "bg-amber-100 text-amber-700 border-amber-300",
  "Low Chance": "bg-red-100 text-red-700 border-red-300",
} as const;

export default function ScholarshipDetailModal({
  scholarship,
  onClose,
}: ScholarshipDetailModalProps) {
  const { profile } = useGetMyProfile();
  const [redirectTarget, setRedirectTarget] = useState<{
    name: string;
    provider: string;
    url: string;
  } | null>(null);

  if (!scholarship) return null;

  const catColor =
    categoryColors[scholarship.category] ??
    "bg-gray-100 text-gray-700 border-gray-200";

  const matchResult = profile
    ? calculateMatchScore(profile, scholarship)
    : null;

  const breakdownItems = matchResult
    ? [
        {
          label: "Income within limit",
          points: 30,
          earned: matchResult.breakdown.income,
        },
        {
          label: "Marks above minimum",
          points: 30,
          earned: matchResult.breakdown.marks,
        },
        {
          label: "Category match",
          points: 20,
          earned: matchResult.breakdown.category,
        },
        {
          label: "Mandatory docs verified",
          points: 20,
          earned: matchResult.breakdown.documents,
        },
      ]
    : [];

  return (
    <>
      <Dialog
        open={!!scholarship}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="max-w-2xl w-full p-0 gap-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium border ${catColor}`}
                  >
                    {scholarship.category}
                  </span>
                  {scholarship.scholarshipType.map((type) => (
                    <span
                      key={type}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium border ${typeColors[type] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <DialogTitle className="text-xl font-bold text-foreground leading-tight">
                  {scholarship.name}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  {scholarship.eligibilityShort}
                </DialogDescription>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium text-foreground">Deadline:</span>
                <span>{scholarship.lastDateToApply}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Award className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium text-foreground">Reward:</span>
                <span>{scholarship.reward}</span>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable content */}
          <ScrollArea className="max-h-[60vh]">
            <div className="px-6 py-5 space-y-6">
              {/* Match Score Section */}
              {matchResult && (
                <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      🎯 Your Match Score
                    </h3>
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded-full border ${matchStatusStyles[matchResult.status]}`}
                    >
                      {matchResult.score}% — {matchResult.status}
                    </span>
                  </div>
                  {/* Score bar */}
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        matchResult.score >= 70
                          ? "bg-green-500"
                          : matchResult.score >= 40
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${matchResult.score}%` }}
                    />
                  </div>
                  {/* Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {breakdownItems.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 text-xs"
                      >
                        {item.earned > 0 ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        )}
                        <span
                          className={
                            item.earned > 0
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {item.label}
                        </span>
                        <span className="ml-auto font-semibold text-muted-foreground">
                          {item.earned}/{item.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Study Level
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {scholarship.studyLevel.map((level) => (
                      <Badge
                        key={level}
                        variant="secondary"
                        className="text-xs"
                      >
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Field of Study
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {scholarship.fieldOfStudy.map((field) => (
                      <Badge
                        key={field}
                        variant="secondary"
                        className="text-xs"
                      >
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Location
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {scholarship.location.map((loc) => (
                      <Badge key={loc} variant="outline" className="text-xs">
                        {loc}
                        {scholarship.locationDetail
                          ? ` — ${scholarship.locationDetail}`
                          : ""}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Full Eligibility */}
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-3">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  Full Eligibility Criteria
                </h3>
                <div className="bg-muted/40 rounded-lg p-4 text-sm text-foreground leading-relaxed">
                  {scholarship.fullEligibility.split("\n").map((line, idx) => {
                    const trimmed = line.trim();
                    const lineKey = `elig-${trimmed.slice(0, 20) || idx}`;
                    if (!trimmed)
                      return <div key={`${lineKey}-gap`} className="h-2" />;
                    return (
                      <p key={lineKey} className="mb-1">
                        {trimmed}
                      </p>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Application Timeline */}
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-3">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  Application Timeline
                </h3>
                <div className="bg-muted/40 rounded-lg p-4 text-sm text-foreground leading-relaxed">
                  {scholarship.applicationCycleDuration
                    .split("\n")
                    .map((line, idx) => {
                      const trimmed = line.trim();
                      const lineKey = `cyc-${trimmed.slice(0, 20) || idx}`;
                      if (!trimmed)
                        return <div key={`${lineKey}-gap`} className="h-2" />;
                      return (
                        <p key={lineKey} className="mb-1">
                          {trimmed}
                        </p>
                      );
                    })}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer with CTA */}
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              Always verify details on the official website before applying.
            </p>
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2 font-semibold"
              onClick={() =>
                setRedirectTarget({
                  name: scholarship.name,
                  provider: scholarship.name,
                  url: scholarship.officialApplyUrl,
                })
              }
            >
              <ExternalLink className="w-4 h-4" />
              Apply on Official Site
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Redirect Warning Modal */}
      {redirectTarget && (
        <RedirectWarningModal
          isOpen={!!redirectTarget}
          onClose={() => setRedirectTarget(null)}
          scholarshipName={redirectTarget.name}
          provider={redirectTarget.provider}
          url={redirectTarget.url}
        />
      )}
    </>
  );
}
