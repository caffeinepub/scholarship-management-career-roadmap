import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Globe,
  GraduationCap,
  MapPin,
  Search,
  Tag,
  X,
} from "lucide-react";

import type React from "react";
import { useMemo, useState } from "react";
import type { Student } from "../backend";
import DeadlineBadge from "../components/DeadlineBadge";
import NoScholarshipsFound from "../components/NoScholarshipsFound";
import ScholarshipDetailModal from "../components/ScholarshipDetailModal";
import {
  FIELDS_OF_STUDY,
  type FieldOfStudy,
  LOCATION_OPTIONS,
  type LocationType,
  SCHOLARSHIP_CATEGORIES,
  SCHOLARSHIP_TYPES,
  STUDY_LEVELS,
  type ScholarshipCategory,
  type ScholarshipTypeFilter,
  type StaticScholarship,
  type StudyLevel,
  scholarshipsData,
} from "../data/scholarshipsData";
import { useGetMyApplications, useGetMyProfile } from "../hooks/useQueries";
import { getDaysLeft, getDeadlineStatus } from "../utils/deadlineUtils";
import { calculateMatchScore } from "../utils/matchScore";

// ── Eligibility Hint ──────────────────────────────────────────────────────────
function getEligibilityHint(
  student: Student | null,
  scholarship: StaticScholarship,
): { label: string; color: string; icon: React.ElementType } | null {
  if (!student) return null;
  const catMap: Record<string, ScholarshipTypeFilter[]> = {
    sc: ["Need-based", "Minority/Quota-based", "Merit-cum-Means"],
    st: ["Need-based", "Minority/Quota-based", "Merit-cum-Means"],
    obc: [
      "Need-based",
      "Minority/Quota-based",
      "Merit-cum-Means",
      "Merit-based",
    ],
    general: ["Merit-based", "Merit-cum-Means"],
  };
  const catKey =
    typeof student.category === "string"
      ? student.category
      : (Object.keys(student.category as object)[0] ?? "");
  const eligible = catMap[catKey]?.some((t) =>
    scholarship.scholarshipType.includes(t),
  );
  if (eligible)
    return {
      label: "Likely Eligible",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle,
    };
  return {
    label: "Check Eligibility",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: AlertCircle,
  };
}

// ── Match Score Badge ─────────────────────────────────────────────────────────
function MatchScoreBadge({
  student,
  scholarship,
}: {
  student: Student;
  scholarship: StaticScholarship;
}) {
  const result = calculateMatchScore(student, scholarship);
  const colorMap = {
    "High Chance": "bg-green-100 text-green-700 border-green-300",
    "Medium Chance": "bg-amber-100 text-amber-700 border-amber-300",
    "Low Chance": "bg-red-100 text-red-600 border-red-300",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold ${colorMap[result.status]}`}
    >
      🎯 {result.score}% Match — {result.status}
    </span>
  );
}

// ── Category color map ────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<
  ScholarshipCategory,
  { header: string; badge: string; border: string }
> = {
  "Government Scholarships (International)": {
    header: "from-blue-600 to-blue-700",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    border: "border-blue-200",
  },
  "Indian Scholarships (Government & Private)": {
    header: "from-orange-500 to-orange-600",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    border: "border-orange-200",
  },
  "Additional Global & Indian Scholarships": {
    header: "from-purple-600 to-purple-700",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    border: "border-purple-200",
  },
  "Open/Loan Schemes": {
    header: "from-teal-600 to-teal-700",
    badge: "bg-teal-100 text-teal-700 border-teal-200",
    border: "border-teal-200",
  },
};

const TYPE_COLORS: Record<ScholarshipTypeFilter, string> = {
  "Merit-based": "bg-green-100 text-green-700 border-green-200",
  "Need-based": "bg-amber-100 text-amber-700 border-amber-200",
  "Merit-cum-Means": "bg-sky-100 text-sky-700 border-sky-200",
  "Minority/Quota-based": "bg-rose-100 text-rose-700 border-rose-200",
  "Education Loan": "bg-indigo-100 text-indigo-700 border-indigo-200",
};

// ── Scholarship Card ──────────────────────────────────────────────────────────
interface StaticScholarshipCardProps {
  scholarship: StaticScholarship;
  onApply: (scholarship: StaticScholarship) => void;
  categoryColor: { header: string; badge: string; border: string };
  student?: Student | null;
  isApplied?: boolean;
}

function StaticScholarshipCard({
  scholarship,
  onApply,
  categoryColor,
  student,
  isApplied = false,
}: StaticScholarshipCardProps) {
  const eligibility = getEligibilityHint(student ?? null, scholarship);
  return (
    <div
      className={`bg-card border ${categoryColor.border} rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden`}
    >
      {/* Top accent bar */}
      <div className={`h-1 bg-gradient-to-r ${categoryColor.header}`} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Scholarship type badges */}
        <div className="flex flex-wrap gap-1.5">
          {scholarship.scholarshipType.slice(0, 2).map((type) => (
            <span
              key={type}
              className={`text-xs px-2 py-0.5 rounded-full font-medium border ${TYPE_COLORS[type] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
            >
              {type}
            </span>
          ))}
          {scholarship.scholarshipType.length > 2 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-gray-100 text-gray-600 border-gray-200">
              +{scholarship.scholarshipType.length - 2}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-bold text-base text-foreground leading-snug">
          {scholarship.name}
        </h3>

        {/* Last date */}
        <div className="flex items-center gap-1.5 text-sm">
          <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-muted-foreground">Last Date:</span>
          <span className="font-semibold text-foreground">
            {scholarship.lastDateToApply}
          </span>
        </div>

        {/* Reward */}
        <div className="flex items-start gap-1.5 text-sm">
          <Award className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-muted-foreground">Reward: </span>
            <span className="text-foreground font-medium">
              {scholarship.reward}
            </span>
          </div>
        </div>

        {/* Eligibility short */}
        <div className="flex items-start gap-1.5 text-sm">
          <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-muted-foreground leading-snug">
            {scholarship.eligibilityShort}
          </p>
        </div>

        {/* Location badges */}
        <div className="flex flex-wrap gap-1.5">
          {scholarship.location.map((loc) => (
            <span
              key={loc}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-secondary text-secondary-foreground border border-border"
            >
              {loc === "Study Abroad" ? (
                <Globe className="w-3 h-3" />
              ) : (
                <MapPin className="w-3 h-3" />
              )}
              {loc}
              {scholarship.locationDetail
                ? ` — ${scholarship.locationDetail}`
                : ""}
            </span>
          ))}
        </div>

        {/* Study level badges */}
        <div className="flex flex-wrap gap-1.5">
          {scholarship.studyLevel.map((level) => (
            <Badge key={level} variant="outline" className="text-xs">
              {level}
            </Badge>
          ))}
        </div>

        {/* Eligibility hint */}
        {eligibility && (
          <div
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${eligibility.color}`}
          >
            <eligibility.icon className="w-3 h-3" />
            {eligibility.label}
          </div>
        )}

        {/* Match Score Badge */}
        {student && (
          <MatchScoreBadge student={student} scholarship={scholarship} />
        )}
        {scholarship.deadlineDate && (
          <DeadlineBadge deadlineDate={scholarship.deadlineDate} />
        )}
        {isApplied && (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium bg-green-100 text-green-700 border-green-200">
            ✓ Applied
          </span>
        )}
      </div>

      {/* Apply button */}
      <div className="px-5 pb-5">
        <Button
          onClick={() => onApply(scholarship)}
          className="w-full gap-2 font-semibold"
          size="sm"
        >
          <BookOpen className="w-3.5 h-3.5" />
          View Details &amp; Apply
        </Button>
      </div>
    </div>
  );
}

// ── Filter Panel ──────────────────────────────────────────────────────────────
interface FilterPanelProps {
  searchText: string;
  onSearchChange: (v: string) => void;
  selectedStudyLevels: StudyLevel[];
  onStudyLevelChange: (level: StudyLevel) => void;
  selectedFields: FieldOfStudy[];
  onFieldChange: (field: FieldOfStudy) => void;
  selectedLocations: LocationType[];
  onLocationChange: (loc: LocationType) => void;
  selectedTypes: ScholarshipTypeFilter[];
  onTypeChange: (type: ScholarshipTypeFilter) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

function FilterPanel({
  searchText,
  onSearchChange,
  selectedStudyLevels,
  onStudyLevelChange,
  selectedFields,
  onFieldChange,
  selectedLocations,
  onLocationChange,
  selectedTypes,
  onTypeChange,
  onClearFilters,
  activeFilterCount,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Search bar + toggle */}
      <div className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="scholarships.search.input"
            type="text"
            placeholder="Search scholarships by name..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            data-ocid="scholarships.filters.button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded((p) => !p)}
            className="gap-2 shrink-0"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Expanded filter grid */}
      {isExpanded && (
        <>
          <Separator />
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Study Level */}
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                <GraduationCap className="w-3.5 h-3.5" />
                Study Level
              </h4>
              <div className="space-y-2">
                {STUDY_LEVELS.map((level) => (
                  <div key={level} className="flex items-center gap-2">
                    <Checkbox
                      id={`level-${level}`}
                      checked={selectedStudyLevels.includes(level)}
                      onCheckedChange={() => onStudyLevelChange(level)}
                    />
                    <Label
                      htmlFor={`level-${level}`}
                      className="text-sm cursor-pointer"
                    >
                      {level}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Field of Study */}
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                Field of Study
              </h4>
              <div className="space-y-2">
                {FIELDS_OF_STUDY.map((field) => (
                  <div key={field} className="flex items-center gap-2">
                    <Checkbox
                      id={`field-${field}`}
                      checked={selectedFields.includes(field)}
                      onCheckedChange={() => onFieldChange(field)}
                    />
                    <Label
                      htmlFor={`field-${field}`}
                      className="text-sm cursor-pointer"
                    >
                      {field}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                <MapPin className="w-3.5 h-3.5" />
                Location
              </h4>
              <div className="space-y-2">
                {LOCATION_OPTIONS.map((loc) => (
                  <div key={loc} className="flex items-center gap-2">
                    <Checkbox
                      id={`loc-${loc}`}
                      checked={selectedLocations.includes(loc)}
                      onCheckedChange={() => onLocationChange(loc)}
                    />
                    <Label
                      htmlFor={`loc-${loc}`}
                      className="text-sm cursor-pointer"
                    >
                      {loc}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Scholarship Type */}
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                <Tag className="w-3.5 h-3.5" />
                Type
              </h4>
              <div className="space-y-2">
                {SCHOLARSHIP_TYPES.map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => onTypeChange(type)}
                    />
                    <Label
                      htmlFor={`type-${type}`}
                      className="text-sm cursor-pointer"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Region Toggle ─────────────────────────────────────────────────────────────
type RegionFilter = "all" | "national" | "international";

const NATIONAL_CATEGORIES: ScholarshipCategory[] = [
  "Indian Scholarships (Government & Private)",
];
const INTERNATIONAL_CATEGORIES: ScholarshipCategory[] = [
  "Government Scholarships (International)",
  "Additional Global & Indian Scholarships",
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Scholarships() {
  const { profile } = useGetMyProfile();

  const [searchText, setSearchText] = useState("");
  const [selectedStudyLevels, setSelectedStudyLevels] = useState<StudyLevel[]>(
    [],
  );
  const [selectedFields, setSelectedFields] = useState<FieldOfStudy[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<LocationType[]>(
    [],
  );
  const [selectedTypes, setSelectedTypes] = useState<ScholarshipTypeFilter[]>(
    [],
  );
  const [selectedScholarship, setSelectedScholarship] =
    useState<StaticScholarship | null>(null);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");
  const [deadlineFilter, setDeadlineFilter] = useState<
    "All" | "Open" | "Closing Soon" | "Closed"
  >("All");
  const [sortByDeadline, setSortByDeadline] = useState(false);
  const { data: myApplications = [] } = useGetMyApplications();
  const appliedIds = myApplications.map((a) => a.scholarshipId.toString());

  const toggleStudyLevel = (level: StudyLevel) =>
    setSelectedStudyLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  const toggleField = (field: FieldOfStudy) =>
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  const toggleLocation = (loc: LocationType) =>
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc],
    );
  const toggleType = (type: ScholarshipTypeFilter) =>
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );

  const clearFilters = () => {
    setSearchText("");
    setSelectedStudyLevels([]);
    setSelectedFields([]);
    setSelectedLocations([]);
    setSelectedTypes([]);
  };

  const activeFilterCount =
    selectedStudyLevels.length +
    selectedFields.length +
    selectedLocations.length +
    selectedTypes.length;

  const filteredScholarships = useMemo(() => {
    let results = scholarshipsData.filter((s) => {
      const q = searchText.toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.eligibilityShort.toLowerCase().includes(q) ||
        s.reward.toLowerCase().includes(q);

      const matchesLevel =
        selectedStudyLevels.length === 0 ||
        selectedStudyLevels.some((l) => s.studyLevel.includes(l));

      const matchesField =
        selectedFields.length === 0 ||
        selectedFields.some((f) => s.fieldOfStudy.includes(f));

      const matchesLocation =
        selectedLocations.length === 0 ||
        selectedLocations.some((l) => s.location.includes(l));

      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.some((t) => s.scholarshipType.includes(t));

      const matchesRegion =
        regionFilter === "all" ||
        (regionFilter === "national" &&
          NATIONAL_CATEGORIES.includes(s.category)) ||
        (regionFilter === "international" &&
          INTERNATIONAL_CATEGORIES.includes(s.category));

      return (
        matchesSearch &&
        matchesLevel &&
        matchesField &&
        matchesLocation &&
        matchesType &&
        matchesRegion
      );
    });

    // Deadline filter
    if (deadlineFilter !== "All") {
      results = results.filter(
        (s) =>
          s.deadlineDate &&
          getDeadlineStatus(s.deadlineDate) === deadlineFilter,
      );
    }

    // Sort by deadline
    if (sortByDeadline) {
      results = [...results].sort(
        (a, b) =>
          getDaysLeft(a.deadlineDate ?? "9999-01-01") -
          getDaysLeft(b.deadlineDate ?? "9999-01-01"),
      );
    }

    return results;
  }, [
    searchText,
    selectedStudyLevels,
    selectedFields,
    selectedLocations,
    selectedTypes,
    regionFilter,
    deadlineFilter,
    sortByDeadline,
  ]);

  // Group by category
  const groupedByCategory = useMemo(() => {
    const groups: Partial<Record<ScholarshipCategory, StaticScholarship[]>> =
      {};
    for (const s of filteredScholarships) {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category]!.push(s);
    }
    return groups;
  }, [filteredScholarships]);

  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Demo Scholarship */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            🌟 Featured Demo
          </span>
        </div>
        <div className="rounded-2xl overflow-hidden border-2 border-indigo-300 shadow-lg shadow-indigo-100">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">
                  Future Leaders Scholarship
                </h3>
                <p className="text-indigo-100 text-xs">ScholarSync Demo</p>
              </div>
            </div>
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
              Demo · Auto-Fill Enabled
            </span>
          </div>
          <div className="bg-card px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">
                Demo scholarship for testing the auto-apply feature. All your
                profile data and documents will be automatically filled when you
                click Apply.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  💰{" "}
                  <strong className="text-foreground">
                    ₹1,00,000 per year
                  </strong>
                </span>
                <span className="flex items-center gap-1">
                  👥 All students with valid profile
                </span>
                <span className="flex items-center gap-1">
                  🟢 Open · No deadline
                </span>
              </div>
            </div>
            <button
              type="button"
              data-ocid="scholarships.primary_button"
              onClick={() => navigate({ to: "/apply/future-leaders" })}
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-md"
            >
              Apply Now →
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Scholarships
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profile
              ? `Showing scholarships for ${(typeof profile.category === "string" ? profile.category : (Object.keys(profile.category as object)[0] ?? "")).toUpperCase()} · ${profile.courseLevel}`
              : "Browse all available scholarships"}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {filteredScholarships.length} of {scholarshipsData.length}{" "}
          scholarships
        </Badge>
      </div>

      {/* Region Toggle */}
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          data-ocid="scholarships.national.toggle"
          onClick={() =>
            setRegionFilter(regionFilter === "national" ? "all" : "national")
          }
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm border-2 transition-all duration-200 ${
            regionFilter === "national"
              ? "border-orange-400 bg-orange-50 text-orange-700 shadow-md shadow-orange-100"
              : "border-border bg-card text-foreground hover:border-orange-300 hover:bg-orange-50/50"
          }`}
        >
          <span className="text-xl">🇮🇳</span>
          <div className="text-left">
            <p className="font-bold leading-tight">National</p>
            <p className="text-xs font-normal opacity-70">
              Indian Scholarships
            </p>
          </div>
          {regionFilter === "national" && (
            <span className="ml-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          data-ocid="scholarships.international.toggle"
          onClick={() =>
            setRegionFilter(
              regionFilter === "international" ? "all" : "international",
            )
          }
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm border-2 transition-all duration-200 ${
            regionFilter === "international"
              ? "border-blue-400 bg-blue-50 text-blue-700 shadow-md shadow-blue-100"
              : "border-border bg-card text-foreground hover:border-blue-300 hover:bg-blue-50/50"
          }`}
        >
          <span className="text-xl">🌍</span>
          <div className="text-left">
            <p className="font-bold leading-tight">International</p>
            <p className="text-xs font-normal opacity-70">
              Global Scholarships
            </p>
          </div>
          {regionFilter === "international" && (
            <span className="ml-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          )}
        </button>

        {regionFilter !== "all" && (
          <button
            type="button"
            onClick={() => setRegionFilter("all")}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm text-muted-foreground hover:text-foreground border border-border bg-card transition-all"
          >
            <X className="w-4 h-4" />
            Show All
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <FilterPanel
        searchText={searchText}
        onSearchChange={setSearchText}
        selectedStudyLevels={selectedStudyLevels}
        onStudyLevelChange={toggleStudyLevel}
        selectedFields={selectedFields}
        onFieldChange={toggleField}
        selectedLocations={selectedLocations}
        onLocationChange={toggleLocation}
        selectedTypes={selectedTypes}
        onTypeChange={toggleType}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* Deadline Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(["All", "Open", "Closing Soon", "Closed"] as const).map((filter) => {
          const colorMap: Record<string, string> = {
            All: "border-border bg-card text-foreground",
            Open: "border-green-200 bg-green-50 text-green-700",
            "Closing Soon": "border-yellow-200 bg-yellow-50 text-yellow-700",
            Closed: "border-red-200 bg-red-50 text-red-700",
          };
          const activeMap: Record<string, string> = {
            All: "border-primary bg-primary text-primary-foreground",
            Open: "border-green-500 bg-green-500 text-white",
            "Closing Soon": "border-yellow-500 bg-yellow-500 text-white",
            Closed: "border-red-500 bg-red-500 text-white",
          };
          const emojiMap: Record<string, string> = {
            All: "📅",
            Open: "🟢",
            "Closing Soon": "🟡",
            Closed: "🔴",
          };
          const isActive = deadlineFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              data-ocid={`scholarships.deadline_${filter.toLowerCase().replace(" ", "_")}.toggle`}
              onClick={() => setDeadlineFilter(filter)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${isActive ? activeMap[filter] : colorMap[filter]} hover:opacity-90`}
            >
              <span>{emojiMap[filter]}</span>
              {filter === "All" ? "All Deadlines" : filter}
            </button>
          );
        })}
        <button
          type="button"
          data-ocid="scholarships.sort_deadline.toggle"
          onClick={() => setSortByDeadline((p) => !p)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${sortByDeadline ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"}`}
        >
          📊 Sort by Deadline
        </button>
      </div>

      {/* Results */}
      {filteredScholarships.length === 0 ? (
        <NoScholarshipsFound
          onClearFilters={
            activeFilterCount > 0 || searchText ? clearFilters : undefined
          }
        />
      ) : (
        <div className="space-y-10">
          {SCHOLARSHIP_CATEGORIES.filter(
            (cat) => groupedByCategory[cat]?.length,
          ).map((category) => {
            const items = groupedByCategory[category]!;
            const colors = CATEGORY_COLORS[category];
            return (
              <section key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`h-1 w-8 rounded-full bg-gradient-to-r ${colors.header}`}
                  />
                  <h2 className="text-lg font-semibold text-foreground">
                    {category}
                  </h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium border ${colors.badge}`}
                  >
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {items.map((scholarship) => (
                    <StaticScholarshipCard
                      key={scholarship.id}
                      scholarship={scholarship}
                      onApply={setSelectedScholarship}
                      categoryColor={colors}
                      student={profile ?? null}
                      isApplied={appliedIds.includes(scholarship.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedScholarship && (
        <ScholarshipDetailModal
          scholarship={selectedScholarship}
          onClose={() => setSelectedScholarship(null)}
        />
      )}
    </div>
  );
}
