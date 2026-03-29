import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle,
  Clock,
  GraduationCap,
  Lock,
  School,
  Star,
  TrendingUp,
} from "lucide-react";
import type React from "react";
import { useGetMyProfile } from "../hooks/useQueries";

type MilestoneStatus = "completed" | "current" | "upcoming";

interface Milestone {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  status: MilestoneStatus;
  detail: string;
  skills: string[];
  year?: string;
}

function getStatusFromProfile(
  profile: ReturnType<typeof useGetMyProfile>["profile"],
): {
  schoolDone: boolean;
  hsDone: boolean;
  ugDone: boolean;
} {
  if (!profile) return { schoolDone: false, hsDone: false, ugDone: false };
  const records = profile.academicRecords ?? [];
  const schoolDone = records.some(
    (r) =>
      r.degree.toLowerCase().includes("10") ||
      r.degree.toLowerCase().includes("ssc") ||
      r.degree.toLowerCase().includes("matric"),
  );
  const hsDone = records.some(
    (r) =>
      r.degree.toLowerCase().includes("12") ||
      r.degree.toLowerCase().includes("hsc") ||
      r.degree.toLowerCase().includes("intermediate") ||
      r.degree.toLowerCase().includes("senior"),
  );
  const ugDone =
    profile.courseLevel.toLowerCase().includes("post") ||
    profile.courseLevel.toLowerCase().includes("pg") ||
    profile.courseLevel.toLowerCase().includes("phd");
  return { schoolDone, hsDone, ugDone };
}

function buildMilestones(
  profile: ReturnType<typeof useGetMyProfile>["profile"],
): Milestone[] {
  const { schoolDone, hsDone, ugDone } = getStatusFromProfile(profile);
  const instituteName = profile?.instituteName ?? "Your Institute";
  const courseName = profile?.courseName ?? "Your Course";

  return [
    {
      id: 1,
      icon: School,
      title: "Secondary School",
      description:
        "Foundation of academic excellence. Build your GPA and extracurriculars.",
      status: schoolDone ? "completed" : profile ? "current" : "upcoming",
      detail: schoolDone
        ? "Successfully completed 10th standard with academic record established."
        : "Complete 10th standard to unlock higher education pathways.",
      skills: ["Mathematics", "Science", "Language Skills", "Discipline"],
      year: schoolDone
        ? (profile?.academicRecords
            ?.find(
              (r) =>
                r.degree.toLowerCase().includes("10") ||
                r.degree.toLowerCase().includes("ssc"),
            )
            ?.year?.toString() ?? "—")
        : undefined,
    },
    {
      id: 2,
      icon: BookOpen,
      title: "Higher Secondary",
      description:
        "Specialization begins. Choose your stream and prepare for entrance exams.",
      status: hsDone ? "completed" : schoolDone ? "current" : "upcoming",
      detail: hsDone
        ? "Completed 12th standard with subject specialization."
        : "Complete 12th standard to become eligible for most scholarships.",
      skills: [
        "Critical Thinking",
        "Subject Specialization",
        "Problem Solving",
        "Time Management",
      ],
      year: hsDone
        ? (profile?.academicRecords
            ?.find(
              (r) =>
                r.degree.toLowerCase().includes("12") ||
                r.degree.toLowerCase().includes("hsc") ||
                r.degree.toLowerCase().includes("intermediate"),
            )
            ?.year?.toString() ?? "—")
        : undefined,
    },
    {
      id: 3,
      icon: GraduationCap,
      title: "Undergraduate Studies",
      description: `${courseName} at ${instituteName}. Your core professional journey begins.`,
      status: ugDone ? "completed" : profile ? "current" : "upcoming",
      detail: profile
        ? `Enrolled in ${courseName} (${profile.courseLevel}) at ${instituteName}. Year ${profile.currentYear?.toString() ?? "?"}.`
        : "Enroll in a degree program to become eligible for undergraduate scholarships.",
      skills: ["Domain Expertise", "Research", "Networking", "Projects"],
      year: profile?.currentYear?.toString() ?? undefined,
    },
    {
      id: 4,
      icon: Award,
      title: "Scholarship Journey",
      description:
        "Apply for scholarships to fund your education and unlock global opportunities.",
      status: "current",
      detail: profile
        ? `You're actively on ScholarPath — exploring ${profile.category.toUpperCase()} scholarships with ${Number(profile.profileCompletionPercentage)}% profile completion.`
        : "Register your profile to begin your scholarship journey.",
      skills: [
        "Application Writing",
        "Document Management",
        "Financial Planning",
        "Persistence",
      ],
      year: new Date().getFullYear().toString(),
    },
    {
      id: 5,
      icon: Briefcase,
      title: "Career Launch",
      description:
        "Step into your professional life with the skills, credentials, and networks you've built.",
      status: "upcoming",
      detail:
        "Complete your degree, secure scholarships, build experience, and launch your career in your chosen field.",
      skills: [
        "Professional Skills",
        "Leadership",
        "Innovation",
        "Industry Knowledge",
      ],
    },
    {
      id: 6,
      icon: Briefcase,
      title: "Internship",
      description: "Gain real-world experience with an industry internship.",
      status: "upcoming",
      detail:
        "Complete your scholarship application to unlock internship tracking.",
      skills: ["Industry Knowledge", "Practical Skills", "Networking"],
    },
    {
      id: 7,
      icon: Star,
      title: "First Job",
      description:
        "Launch your professional career with your first full-time role.",
      status: "upcoming",
      detail:
        "Your career destination — powered by the foundation you're building today.",
      skills: ["Professional Skills", "Leadership", "Innovation"],
    },
  ];
}

const STATUS_STYLES: Record<
  MilestoneStatus,
  {
    border: string;
    dot: string;
    badge: string;
    badgeText: string;
    icon: string;
  }
> = {
  completed: {
    border: "border-l-4 border-green-500",
    dot: "bg-green-500 border-green-500",
    badge: "bg-green-100 text-green-700 border-green-200",
    badgeText: "Completed",
    icon: "text-green-500",
  },
  current: {
    border: "border-l-4 border-primary",
    dot: "bg-primary border-primary ring-4 ring-primary/20",
    badge: "bg-primary/10 text-primary border-primary/20",
    badgeText: "In Progress",
    icon: "text-primary",
  },
  upcoming: {
    border: "border-l-4 border-border",
    dot: "bg-gray-100 border-gray-300",
    badge: "bg-muted text-muted-foreground border-border",
    badgeText: "Locked",
    icon: "text-muted-foreground",
  },
};

// Sub-stages for the Scholarship Journey milestone
function ScholarshipSubStages() {
  const subStages = [
    { label: "Application Submitted", status: "done" },
    { label: "Documents Verified", status: "current" },
    { label: "Funds Received", status: "locked" },
  ];

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Scholarship Progress
      </p>
      <div className="flex items-center gap-1 flex-wrap">
        {subStages.map((stage, i) => (
          <div key={stage.label} className="flex items-center gap-1">
            <div className="flex items-center gap-1.5">
              {stage.status === "done" && (
                <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-white" />
                </span>
              )}
              {stage.status === "current" && (
                <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                </span>
              )}
              {stage.status === "locked" && (
                <span className="w-5 h-5 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center shrink-0">
                  <Lock className="w-2.5 h-2.5 text-gray-400" />
                </span>
              )}
              <span
                className={`text-xs ${stage.status === "done" ? "text-green-700 font-medium" : stage.status === "current" ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                {stage.label}
              </span>
            </div>
            {i < subStages.length - 1 && (
              <span className="text-muted-foreground/40 mx-1">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MilestoneCard({
  milestone,
  index,
}: {
  milestone: Milestone;
  index: number;
}) {
  const s = STATUS_STYLES[milestone.status];
  const Icon =
    milestone.status === "completed"
      ? CheckCircle
      : milestone.status === "current"
        ? Star
        : Lock;

  const isUpcoming = milestone.status === "upcoming";
  const isCurrent = milestone.status === "current";

  return (
    <div
      data-ocid={`roadmap.milestone.${milestone.id}`}
      className={`relative flex gap-6 ${index % 2 === 0 ? "" : "flex-row-reverse md:flex-row"}`}
    >
      {/* Timeline dot (desktop) */}
      <div
        className="hidden md:flex flex-col items-center shrink-0"
        style={{ width: 48 }}
      >
        <div
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 ${s.dot} ${isCurrent ? "ring-4 ring-primary/20 animate-pulse" : ""}`}
        >
          {milestone.status === "completed" ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : isUpcoming ? (
            <Lock className="w-5 h-5 text-muted-foreground" />
          ) : (
            <milestone.icon
              className={`w-5 h-5 ${isCurrent ? "text-white" : "text-muted-foreground"}`}
            />
          )}
        </div>
      </div>

      {/* Card */}
      <div
        className={`flex-1 bg-card rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-border ${s.border} mb-6 ${isUpcoming ? "opacity-75" : ""}`}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div className="flex items-center gap-2">
            {/* Mobile dot */}
            <div
              className={`md:hidden w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${s.dot} ${isCurrent ? "ring-4 ring-primary/20 animate-pulse" : ""}`}
            >
              {milestone.status === "completed" ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : isUpcoming ? (
                <Lock className="w-4 h-4 text-muted-foreground" />
              ) : (
                <milestone.icon
                  className={`w-4 h-4 ${isCurrent ? "text-white" : "text-muted-foreground"}`}
                />
              )}
            </div>
            <div>
              <h3
                className={`font-bold text-base ${isUpcoming ? "text-muted-foreground" : "text-foreground"}`}
              >
                {isUpcoming && (
                  <Lock className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground/60" />
                )}
                {milestone.title}
              </h3>
              {milestone.year && (
                <span className="text-xs text-muted-foreground">
                  Year: {milestone.year}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${s.badge}`}
            >
              <Icon className="w-3 h-3" />
              {s.badgeText}
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {milestone.description}
        </p>
        <p className="text-xs text-foreground bg-muted/60 rounded-lg px-3 py-2 mb-3">
          {milestone.detail}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {milestone.skills.map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className="text-xs font-medium"
              style={
                isCurrent
                  ? {
                      borderColor: "oklch(0.42 0.18 265 / 0.3)",
                      color: "oklch(0.42 0.18 265)",
                    }
                  : {}
              }
            >
              {skill}
            </Badge>
          ))}
        </div>

        {/* Sub-stages for Scholarship Journey */}
        {milestone.id === 4 && <ScholarshipSubStages />}
      </div>
    </div>
  );
}

export default function Roadmap() {
  const { profile, isLoading, isFetched } = useGetMyProfile();
  const milestones = buildMilestones(profile ?? null);
  const completedCount = milestones.filter(
    (m) => m.status === "completed",
  ).length;

  return (
    <div data-ocid="roadmap.page" className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-2">
          <TrendingUp className="w-3 h-3" />
          Career Journey
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Career Roadmap
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Track your journey from school to career, powered by your scholarship
          progress.
        </p>
      </div>

      {/* Progress summary */}
      <div
        data-ocid="roadmap.progress.section"
        className="bg-card border border-border rounded-2xl p-5 shadow-sm"
      >
        {isLoading && !isFetched ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {completedCount} of {milestones.length} milestones completed
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {profile
                  ? `${profile.fullName} · ${profile.courseLevel} · ${profile.state}`
                  : "Register your profile to personalize this roadmap"}
              </p>
            </div>
            <div className="flex gap-1.5">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className={`w-3 h-3 rounded-full ${
                    m.status === "completed"
                      ? "bg-green-500"
                      : m.status === "current"
                        ? "bg-primary ring-2 ring-primary/30"
                        : "bg-border"
                  }`}
                  title={m.title}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical center line (desktop only) */}
        <div className="hidden md:block absolute left-6 top-5 bottom-5 w-0.5 bg-border" />

        <div className="space-y-0">
          {isLoading && !isFetched
            ? (["s1", "s2", "s3"] as const).map((k) => (
                <Skeleton key={k} className="h-40 w-full rounded-2xl mb-6" />
              ))
            : milestones.map((milestone, index) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  index={index}
                />
              ))}
        </div>
      </div>

      {/* CTA */}
      {isFetched && !profile && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-3">
          <GraduationCap className="w-10 h-10 text-primary mx-auto" />
          <h3 className="font-bold text-foreground">
            Personalize Your Roadmap
          </h3>
          <p className="text-sm text-muted-foreground">
            Register your student profile to see your real academic milestones
            and scholarship status.
          </p>
          <a
            href="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "oklch(0.42 0.18 265)" }}
          >
            Register Profile
          </a>
        </div>
      )}
    </div>
  );
}
