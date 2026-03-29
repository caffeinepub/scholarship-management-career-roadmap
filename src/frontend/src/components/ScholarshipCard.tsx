import {
  BookOpen,
  Calendar,
  DollarSign,
  Globe,
  MapPin,
  RefreshCw,
  Tag,
} from "lucide-react";
import React from "react";
import type {
  ExtendedScholarship,
  Scholarship,
  ScholarshipRegion,
  ScholarshipStatus,
} from "../types";

// ── Legacy ScholarshipCard ─────────────────────────────────────────────────

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onApply?: (id: bigint) => void;
  onViewDetails?: (id: bigint) => void;
}

export default function ScholarshipCard({
  scholarship,
  onApply,
  onViewDetails,
}: ScholarshipCardProps) {
  const deadline = new Date(Number(scholarship.deadline) / 1_000_000);
  const isExpired = deadline < new Date();

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-2">
            {scholarship.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {scholarship.provider}
          </p>
        </div>
        {scholarship.isActive && !isExpired ? (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            Active
          </span>
        ) : (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
            Closed
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {scholarship.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {scholarship.eligibleCourseLevels.slice(0, 2).map((level) => (
          <span
            key={level}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
          >
            <BookOpen className="w-3 h-3" />
            {level}
          </span>
        ))}
        {scholarship.eligibleCategories.slice(0, 2).map((cat) => (
          <span
            key={cat}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary/10 text-secondary-foreground border border-border"
          >
            <Tag className="w-3 h-3" />
            {cat}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span className={isExpired ? "text-red-500" : ""}>
            {isExpired ? "Expired " : "Deadline: "}
            {deadline.toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5" />
          <span>
            Income ≤ ₹{Number(scholarship.incomeLimit).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(scholarship.id)}
            className="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
          >
            View Details
          </button>
        )}
        {onApply && scholarship.isActive && !isExpired && (
          <button
            type="button"
            onClick={() => onApply(scholarship.id)}
            className="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
}

// ── Extended Scholarship Card ──────────────────────────────────────────────

interface ExtendedScholarshipCardProps {
  scholarship: ExtendedScholarship;
  onViewDetails?: (id: bigint) => void;
}

function getRegionLabel(region: ScholarshipRegion): string {
  if ("India" in region) return "India";
  if ("Global" in region) return "Global";
  if ("USA" in region) return "USA";
  if ("Europe" in region) return "Europe";
  if ("Commonwealth" in region) return "Commonwealth";
  return "Unknown";
}

function getStatusLabel(status: ScholarshipStatus): string {
  if ("Upcoming" in status) return "Upcoming";
  if ("Available" in status) return "Available";
  if ("Closed" in status) return "Closed";
  return "Unknown";
}

function getStatusColors(status: ScholarshipStatus): string {
  if ("Available" in status)
    return "bg-green-100 text-green-700 border-green-200";
  if ("Upcoming" in status)
    return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-muted text-muted-foreground border-border";
}

export function ExtendedScholarshipCard({
  scholarship,
  onViewDetails,
}: ExtendedScholarshipCardProps) {
  const openingDate = new Date(
    Number(scholarship.dates.openingDate) / 1_000_000,
  );
  const closingDate = new Date(
    Number(scholarship.dates.closingDate) / 1_000_000,
  );
  const resultDate =
    scholarship.dates.resultDate.length > 0
      ? new Date(Number(scholarship.dates.resultDate[0]) / 1_000_000)
      : null;

  const isMuted =
    scholarship.is_archived ||
    getStatusLabel(scholarship.status_calculated) === "Closed";

  return (
    <div
      className={`bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow ${isMuted ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-2">
            {scholarship.scholarship_name}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColors(scholarship.status_calculated)}`}
          >
            {getStatusLabel(scholarship.status_calculated)}
          </span>
          {scholarship.is_archived && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
              Archived
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
          <Globe className="w-3 h-3" />
          {getRegionLabel(scholarship.region)}
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary/10 text-secondary-foreground border border-border">
          <RefreshCw className="w-3 h-3" />
          {scholarship.duration_tracking.tenure}
          {scholarship.duration_tracking.renewal_policy ? " · Renewable" : ""}
        </span>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>Opens: {openingDate.toLocaleDateString()}</span>
          <span className="mx-1">·</span>
          <span>Closes: {closingDate.toLocaleDateString()}</span>
        </div>
        {resultDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Results: {resultDate.toLocaleDateString()}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5" />
          <span>
            {scholarship.financials.currency}{" "}
            {scholarship.financials.amount.toLocaleString()}
          </span>
        </div>
      </div>

      {onViewDetails && (
        <button
          type="button"
          onClick={() => onViewDetails(scholarship.id)}
          className="w-full px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
        >
          View Details
        </button>
      )}
    </div>
  );
}
