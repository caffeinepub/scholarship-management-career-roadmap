import { Link } from "@tanstack/react-router";
import { Bell, Calendar, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { scholarshipsData } from "../data/scholarshipsData";
import {
  getDaysLeft,
  getDeadlineStatus,
  getStatusColors,
} from "../utils/deadlineUtils";

interface Props {
  appliedScholarshipIds?: string[];
}

export default function DeadlineDashboardSection({
  appliedScholarshipIds = [],
}: Props) {
  const upcoming = useMemo(() => {
    return scholarshipsData
      .filter((s) => s.deadlineDate)
      .map((s) => ({
        ...s,
        daysLeft: getDaysLeft(s.deadlineDate!),
        status: getDeadlineStatus(s.deadlineDate!),
      }))
      .filter((s) => s.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, []);

  if (upcoming.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Upcoming Deadlines
          </h3>
        </div>
        <Link
          to="/scholarships"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {upcoming.map((s) => {
          const colors = getStatusColors(s.status);
          const isApplied = appliedScholarshipIds.includes(s.id);
          const isUrgent = s.daysLeft <= 7;
          return (
            <div
              key={s.id}
              className={`rounded-xl p-3 border ${
                isUrgent
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-border bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {s.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${
                        colors.bg
                      } ${colors.text} ${colors.border}`}
                    >
                      <Calendar className="w-2.5 h-2.5" />
                      {s.daysLeft === 0 ? "Last Day!" : `${s.daysLeft}d left`}
                    </span>
                    <span
                      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${
                        isApplied
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {isApplied ? "✓ Applied" : "Not Applied"}
                    </span>
                  </div>
                </div>
                {isUrgent && (
                  <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-200 shrink-0">
                    Urgent
                  </span>
                )}
              </div>
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    s.daysLeft <= 7
                      ? "bg-red-500"
                      : s.daysLeft <= 30
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.max(2, Math.min(100, (1 - s.daysLeft / 90) * 100))}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
