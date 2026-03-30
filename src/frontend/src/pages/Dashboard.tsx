import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  Map as MapIcon,
  School,
  Star,
  User,
} from "lucide-react";
import React from "react";
import type { Student } from "../backend";
import DeadlineDashboardSection from "../components/DeadlineDashboardSection";
import ProfileCompletionMeter from "../components/ProfileCompletionMeter";
import ReminderSystem from "../components/ReminderSystem";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetMyApplications, useGetMyProfile } from "../hooks/useQueries";

// ── Risk Assessment ────────────────────────────────────────────────────────────
function RiskBadge({ profile }: { profile: Student | null }) {
  if (!profile) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border bg-amber-50 border-amber-200 text-amber-700">
        <AlertCircle className="w-4 h-4 shrink-0" />
        Profile Required — Register to unlock scholarship matching
      </div>
    );
  }
  const pct = Number(profile.profileCompletionPercentage);
  if (pct < 80) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border bg-amber-50 border-amber-200 text-amber-700">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        Low Success Probability — Profile is {pct}% complete
      </div>
    );
  }
  const hasAllDocs =
    profile.documents.filter((d) => d.uploadStatus).length >= 4;
  if (!hasAllDocs) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border bg-red-50 border-red-200 text-red-700">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        High Rejection Risk — Mandatory documents missing
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border bg-green-50 border-green-200 text-green-700">
      <CheckCircle className="w-4 h-4 shrink-0" />
      High Success Probability — Profile &amp; documents complete
    </div>
  );
}

// ── Skill Gap Bars ─────────────────────────────────────────────────────────────
interface SkillScore {
  label: string;
  student: number;
  required: number;
}

function deriveSkillScores(profile: Student | null): SkillScore[] {
  const incomeMap: Record<string, number> = {
    below_1_lakh: 95,
    "1_3_lakh": 85,
    "3_6_lakh": 70,
    "6_10_lakh": 50,
    above_10_lakh: 30,
  };
  const financialNeed = incomeMap[profile?.annualFamilyIncome ?? ""] ?? 55;
  const hasAcademics = (profile?.academicRecords?.length ?? 0) > 0;
  const academicExcellence = hasAcademics ? 72 : 45;
  const hasCareer = (profile?.careerAchievements?.length ?? 0) > 0;
  const leadership = hasCareer ? 68 : 40;
  const pct = Number(profile?.profileCompletionPercentage ?? 0);
  const communication = Math.min(90, 40 + Math.round(pct * 0.5));
  const research = hasAcademics ? 60 : 35;
  const community = hasCareer ? 65 : 38;

  return [
    { label: "Academic Excellence", student: academicExcellence, required: 80 },
    { label: "Financial Need", student: financialNeed, required: 70 },
    { label: "Leadership", student: leadership, required: 75 },
    { label: "Communication", student: communication, required: 70 },
    { label: "Research Skills", student: research, required: 80 },
    { label: "Community Service", student: community, required: 65 },
  ];
}

function SkillBar({ label, student, required }: SkillScore) {
  const color =
    student >= required
      ? "bg-green-500"
      : student >= 60
        ? "bg-amber-500"
        : "bg-red-500";
  const textColor =
    student >= required
      ? "text-green-700"
      : student >= 60
        ? "text-amber-700"
        : "text-red-600";
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className={`text-xs font-semibold ${textColor}`}>
          {student}
          <span className="text-muted-foreground font-normal">/{required}</span>
        </span>
      </div>
      <div className="relative h-2 bg-border rounded-full overflow-hidden">
        {/* Required marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/20 z-10"
          style={{ left: `${required}%` }}
        />
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${student}%` }}
        />
      </div>
    </div>
  );
}

// ── Career Roadmap Teaser ──────────────────────────────────────────────────────
function RoadmapTeaser({ profile }: { profile: Student | null }) {
  const steps = [
    { icon: School, label: "School", done: true },
    { icon: GraduationCap, label: "College", done: !!profile },
    { icon: Award, label: "Scholarship", current: true },
    { icon: Briefcase, label: "Career", done: false },
  ];

  return (
    <div
      data-ocid="dashboard.roadmap_teaser.section"
      className="bg-card border border-border rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Career Roadmap
          </span>
        </div>
        <Link
          to="/roadmap"
          className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
        >
          View Full <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute left-5 right-5 top-5 h-0.5 bg-border -z-0" />
        {steps.map(({ icon: Icon, label, done, current }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                done
                  ? "bg-green-500 border-green-500 text-white"
                  : current
                    ? "bg-primary border-primary text-white ring-4 ring-primary/20"
                    : "bg-background border-border text-muted-foreground"
              }`}
            >
              {done ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
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

      {profile ? (
        <p className="text-xs text-muted-foreground">
          Currently at:{" "}
          <span className="font-semibold text-primary">Scholarship Stage</span>{" "}
          · {profile.instituteName}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Register your profile to personalize your roadmap
        </p>
      )}
    </div>
  );
}

// ── Missing Items for Profile Meter ──────────────────────────────────────────
function getMissingItems(profile: Student | null): string[] {
  if (!profile)
    return [
      "Register your student profile",
      "Upload Aadhaar card",
      "Upload Income Certificate",
      "Upload Marksheet",
    ];
  const missing: string[] = [];
  if (!profile.fullName) missing.push("Full name");
  if (!profile.email) missing.push("Email address");
  if (!profile.mobileNumber) missing.push("Mobile number");
  if (!profile.instituteName) missing.push("Institute name");
  if ((profile.academicRecords?.length ?? 0) === 0)
    missing.push("Academic records");
  if ((profile.documents?.length ?? 0) === 0) missing.push("Upload documents");
  return missing;
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { profile, isLoading, isFetched } = useGetMyProfile();
  const { data: myApplications = [] } = useGetMyApplications();
  const appliedIds = myApplications.map((a) => a.scholarshipId.toString());

  const principalShort = identity?.getPrincipal().toString().slice(0, 12) ?? "";
  const completionPct = profile
    ? Number(profile.profileCompletionPercentage)
    : 0;
  const missingItems = getMissingItems(profile);
  const skillScores = deriveSkillScores(profile);

  const summaryCards = [
    {
      icon: Award,
      label: "Available Scholarships",
      value: "35",
      description: "Matching your profile",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: FileText,
      label: "My Applications",
      value: "0",
      description: "Total submitted",
      color: "text-foreground",
      bg: "bg-secondary",
    },
    {
      icon: CheckCircle,
      label: "Approved",
      value: "0",
      description: "Applications approved",
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      icon: Clock,
      label: "Pending Review",
      value: "0",
      description: "Under review",
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src="/assets/generated/dashboard-hero-banner.dim_1200x300.png"
          alt="Dashboard Banner"
          className="w-full h-40 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent flex items-center px-8">
          <div>
            {isLoading && !isFetched ? (
              <Skeleton className="h-8 w-48 mb-2" />
            ) : (
              <h1 className="text-2xl font-display font-bold text-white">
                Welcome
                {profile ? `, ${profile.fullName.split(" ")[0]}` : " back"}!
              </h1>
            )}
            <p className="text-white/80 text-sm mt-1">
              {profile
                ? `${profile.instituteName} · ${profile.courseLevel}`
                : `Principal: ${principalShort}...`}
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(
          ({ icon: Icon, label, value, description, color, bg }) => (
            <div
              key={label}
              data-ocid="dashboard.stats.card"
              className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div
                className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            </div>
          ),
        )}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column: Profile Meter + Risk Badges + Skill Gap */}
        <div className="lg:col-span-3 space-y-4">
          {/* Profile Completion Meter */}
          <div
            data-ocid="dashboard.profile_meter.card"
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-warning" />
              Profile Completion
            </h3>
            {isLoading && !isFetched ? (
              <div className="flex items-center gap-6">
                <Skeleton className="w-40 h-40 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6 flex-wrap">
                <div className="shrink-0">
                  <ProfileCompletionMeter
                    completionPercentage={completionPct}
                    missingItems={missingItems}
                    size={160}
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  {missingItems.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Missing items
                      </p>
                      <ul className="space-y-1">
                        {missingItems.slice(0, 4).map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-1.5 text-xs text-foreground"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/profile"
                        className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline mt-1"
                      >
                        Complete Profile <ArrowRight className="w-3 h-3" />
                      </Link>
                    </>
                  )}
                  {missingItems.length === 0 && (
                    <p className="text-sm font-medium text-green-600">
                      ✓ Profile is 100% complete!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Risk Assessment Badge */}
          {isFetched && <RiskBadge profile={profile ?? null} />}

          {/* Profile registered info */}
          {isFetched && profile && (
            <div className="bg-success/10 border border-success/30 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Profile registered
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ID:{" "}
                  <span className="font-mono text-primary">
                    {profile.profileId.toString()}
                  </span>{" "}
                  · {profile.category.toUpperCase()} · {profile.state}
                </p>
              </div>
            </div>
          )}
          {isFetched && !profile && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
              <User className="w-5 h-5 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Profile not registered
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Register your profile to get personalized scholarship
                  recommendations.
                </p>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2 hover:underline"
                >
                  Complete Profile <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Skill Gap Progress Bars */}
          <div
            data-ocid="dashboard.skill_gap.section"
            className="bg-card border border-border rounded-2xl p-5 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Skill Gap Analysis{" "}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                vs scholarship requirements
              </span>
            </h3>
            <div className="space-y-4">
              {skillScores.map((skill) => (
                <SkillBar key={skill.label} {...skill} />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Met
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Partial
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Needs work
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Roadmap Teaser + Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Career Roadmap teaser */}
          <RoadmapTeaser profile={profile ?? null} />

          {/* Deadline Dashboard */}
          <DeadlineDashboardSection appliedScholarshipIds={appliedIds} />

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Quick Actions
            </h3>
            <div className="space-y-1.5">
              {[
                { to: "/profile", icon: User, label: "Edit Profile" },
                { to: "/documents", icon: FileText, label: "Upload Documents" },
                {
                  to: "/scholarships",
                  icon: Award,
                  label: "Browse Scholarships",
                },
                {
                  to: "/applications",
                  icon: BookOpen,
                  label: "My Applications",
                },
                { to: "/roadmap", icon: MapIcon, label: "Career Roadmap" },
              ].map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors group"
                >
                  <Icon className="w-4 h-4 shrink-0 text-primary" />
                  {label}
                  <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Readiness Score */}
          {isFetched && profile && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Scholarship Readiness
              </h3>
              {(() => {
                const pct = Number(profile.profileCompletionPercentage);
                const docCount = profile.documents.filter(
                  (d) => d.uploadStatus,
                ).length;
                const score = Math.min(
                  100,
                  Math.round(pct * 0.6 + docCount * 5),
                );
                const label =
                  score >= 80 ? "High" : score >= 50 ? "Medium" : "Low";
                const color =
                  score >= 80
                    ? "text-green-600"
                    : score >= 50
                      ? "text-amber-600"
                      : "text-red-600";
                return (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        Score
                      </span>
                      <span className={`text-sm font-bold ${color}`}>
                        {score}/100 · {label}
                      </span>
                    </div>
                    <Progress value={score} className="h-2.5" />
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
<ReminderSystem />;
