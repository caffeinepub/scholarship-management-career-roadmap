import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  Map as MapIcon,
  School,
  TrendingUp,
  XCircle,
} from "lucide-react";
import React from "react";
import { useGetMyApplications } from "../hooks/useQueries";
import type { ScholarshipApplicationRecord } from "../hooks/useQueries";

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    case "underreview":
    case "under review":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
          <TrendingUp className="w-3 h-3" />
          Under Review
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
  }
}

function EmptyStateRoadmap() {
  const steps = [
    { icon: School, label: "School", done: true },
    { icon: GraduationCap, label: "College", done: true },
    { icon: Award, label: "Scholarship", current: true },
    { icon: Briefcase, label: "Career", done: false },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
        style={{ background: "oklch(0.42 0.18 265 / 0.1)" }}
      >
        <FileText className="w-8 h-8 text-primary" />
      </div>

      <div>
        <h3 className="font-bold text-xl text-foreground mb-2">
          No Applications Yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Start your scholarship journey! Browse available scholarships and
          submit your first application.
        </p>
      </div>

      {/* Mini roadmap */}
      <div className="relative flex items-center justify-center gap-0 max-w-xs mx-auto">
        <div className="absolute left-5 right-5 top-5 h-0.5 bg-border" />
        {steps.map(({ icon: Icon, label, done, current }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 z-10 flex-1"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                done
                  ? "bg-green-500 border-green-500"
                  : current
                    ? "bg-primary border-primary ring-2 ring-primary/20"
                    : "bg-background border-border"
              }`}
            >
              {done ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : (
                <Icon
                  className={`w-4 h-4 ${current ? "text-white" : "text-muted-foreground"}`}
                />
              )}
            </div>
            <span
              className={`text-xs font-medium ${
                done
                  ? "text-green-600"
                  : current
                    ? "text-primary"
                    : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/scholarships">
          <Button className="gap-2">
            <Award className="w-4 h-4" />
            Browse Scholarships
          </Button>
        </Link>
        <Link to="/roadmap">
          <Button variant="outline" className="gap-2">
            <MapIcon className="w-4 h-4" />
            View Career Roadmap
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function MyApplications() {
  const { data: applications = [], isLoading } = useGetMyApplications();

  const stats = {
    total: applications.length,
    approved: applications.filter(
      (a: ScholarshipApplicationRecord) =>
        a.applicationStatus.toLowerCase() === "approved",
    ).length,
    pending: applications.filter(
      (a: ScholarshipApplicationRecord) =>
        a.applicationStatus.toLowerCase() === "pending" ||
        a.applicationStatus.toLowerCase() === "submitted",
    ).length,
    rejected: applications.filter(
      (a: ScholarshipApplicationRecord) =>
        a.applicationStatus.toLowerCase() === "rejected",
    ).length,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              My Applications
            </h1>
            <p className="text-sm text-muted-foreground">
              Track the status of your scholarship applications
            </p>
          </div>
        </div>
        <Link to="/scholarships">
          <Button className="gap-2" size="sm">
            <Award className="w-4 h-4" />
            Apply to a Scholarship
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {!isLoading && applications.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            {
              label: "Approved",
              value: stats.approved,
              color: "text-green-600",
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "text-yellow-600",
            },
            { label: "Rejected", value: stats.rejected, color: "text-red-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Applications List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">
            Loading applications...
          </span>
        </div>
      ) : applications.length === 0 ? (
        <EmptyStateRoadmap />
      ) : (
        <div className="space-y-3">
          {applications.map((app: ScholarshipApplicationRecord) => {
            const appliedDate = new Date(Number(app.appliedDate) / 1_000_000);
            const lastUpdated = new Date(Number(app.lastUpdated) / 1_000_000);

            return (
              <div
                key={app.applicationId.toString()}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">
                      Scholarship #{app.scholarshipId.toString()}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span>Applied: {appliedDate.toLocaleDateString()}</span>
                      <span>Updated: {lastUpdated.toLocaleDateString()}</span>
                    </div>
                    {app.rejectionReason && (
                      <div className="flex items-start gap-1.5 mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{app.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    {getStatusBadge(app.applicationStatus)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
