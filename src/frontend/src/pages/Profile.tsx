import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Save, Sparkles, User } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Category, DisabilityStatus, Gender } from "../backend";
import { useGetMyProfile, useRegisterStudent } from "../hooks/useQueries";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
];

const EDUCATION_LEVELS = [
  "5th Standard",
  "8th Standard",
  "10th Standard (Matriculation)",
  "12th Standard (Intermediate)",
  "B.Tech (Engineering)",
  "MBBS (Medical)",
  "B.Sc",
  "B.A.",
  "M.Tech",
  "MD",
  "M.Sc",
] as const;

function mapEducationToCourseLevel(edu: string): string {
  if (edu === "5th Standard" || edu === "8th Standard") return "secondary";
  if (
    edu === "10th Standard (Matriculation)" ||
    edu === "12th Standard (Intermediate)"
  )
    return "higher_secondary";
  if (
    edu === "B.Tech (Engineering)" ||
    edu === "MBBS (Medical)" ||
    edu === "B.Sc" ||
    edu === "B.A."
  )
    return "undergraduate";
  if (edu === "M.Tech" || edu === "MD" || edu === "M.Sc") return "postgraduate";
  return "undergraduate";
}

interface FormState {
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: string;
  category: string;
  disabilityStatus: string;
  annualFamilyIncome: string;
  state: string;
  district: string;
  courseName: string;
  courseLevel: string;
  instituteName: string;
  currentYear: string;
  boardName?: string;
  universityName?: string;
}

const emptyForm: FormState = {
  fullName: "",
  email: "",
  mobileNumber: "",
  gender: "",
  category: "",
  disabilityStatus: "",
  annualFamilyIncome: "",
  state: "",
  district: "",
  courseName: "",
  courseLevel: "",
  instituteName: "",
  currentYear: "1",
  boardName: "",
  universityName: "",
};

export default function Profile() {
  const { profile, isLoading, isFetched } = useGetMyProfile();
  const registerStudent = useRegisterStudent();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [formPopulated, setFormPopulated] = useState(false);
  const [educationLevel, setEducationLevel] = useState<string>("");

  const showBoardName =
    educationLevel === "10th Standard (Matriculation)" ||
    educationLevel === "12th Standard (Intermediate)";

  const showUniversityName =
    educationLevel === "B.Tech (Engineering)" ||
    educationLevel === "MBBS (Medical)";

  // Auto-populate form when profile data is available
  useEffect(() => {
    if (profile && !formPopulated) {
      setForm({
        fullName: profile.fullName ?? "",
        email: profile.email ?? "",
        mobileNumber: profile.mobileNumber ?? "",
        gender: profile.gender ?? "",
        category: profile.category ?? "",
        disabilityStatus: profile.disabilityStatus ?? "",
        annualFamilyIncome: profile.annualFamilyIncome ?? "",
        state: profile.state ?? "",
        district: profile.district ?? "",
        courseName: profile.courseName ?? "",
        courseLevel: profile.courseLevel ?? "",
        instituteName: profile.instituteName ?? "",
        currentYear: profile.currentYear?.toString() ?? "1",
        boardName: "",
        universityName: "",
      });
      setFormPopulated(true);
    }
  }, [profile, formPopulated]);

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEducationLevelChange = (value: string) => {
    setEducationLevel(value);
    setForm((prev) => ({
      ...prev,
      courseLevel: mapEducationToCourseLevel(value),
      boardName: "",
      universityName: "",
    }));
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!form.mobileNumber.trim()) {
      toast.error("Mobile number is required");
      return;
    }
    if (!form.gender) {
      toast.error("Gender is required");
      return;
    }
    if (!form.category) {
      toast.error("Category is required");
      return;
    }
    if (!form.disabilityStatus) {
      toast.error("Disability status is required");
      return;
    }
    if (!form.annualFamilyIncome.trim()) {
      toast.error("Annual family income is required");
      return;
    }
    if (!form.state) {
      toast.error("State is required");
      return;
    }
    if (!form.district.trim()) {
      toast.error("District is required");
      return;
    }
    if (!form.courseName.trim()) {
      toast.error("Course name is required");
      return;
    }
    if (!form.courseLevel) {
      toast.error("Education level is required");
      return;
    }
    if (!form.instituteName.trim()) {
      toast.error("Institute name is required");
      return;
    }

    try {
      await registerStudent.mutateAsync({
        fullName: form.fullName,
        email: form.email,
        mobileNumber: form.mobileNumber,
        gender: form.gender as Gender,
        category: form.category as Category,
        disabilityStatus: form.disabilityStatus as DisabilityStatus,
        annualFamilyIncome: form.annualFamilyIncome,
        state: form.state,
        district: form.district,
        courseName: form.courseName,
        courseLevel: form.courseLevel,
        instituteName: form.instituteName,
        currentYear: BigInt(Number.parseInt(form.currentYear) || 1),
      });
      toast.success("Profile registered successfully!");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save profile",
      );
    }
  };

  if (isLoading && !isFetched) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 12 }, (_, i) => i).map((i) => (
            <div key={`profile-skeleton-${i}`} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Student Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile
              ? "Update your profile information"
              : "Complete your profile to get started"}
          </p>
        </div>
        {profile && (
          <div className="ml-auto flex items-center gap-1.5 text-sm text-success">
            <CheckCircle className="w-4 h-4" />
            <span>Registered</span>
          </div>
        )}
      </div>

      {/* Profile data loaded banner with Auto-Fill button */}
      {profile && (
        <div className="mb-6 space-y-3">
          {/* Green "data loaded" banner */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <span className="text-sm text-green-800 font-medium flex-1">
              Profile data loaded — your information is pre-filled below.
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-green-300 text-green-700 hover:bg-green-100 shrink-0"
              onClick={() => {
                toast.success(
                  "Form is already filled from your saved profile!",
                  {
                    description:
                      "All your profile data has been pre-loaded into the form.",
                  },
                );
              }}
            >
              <Sparkles className="w-3 h-3" />✨ Auto-Fill from Profile
            </Button>
          </div>
          {/* Profile ID */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Profile ID:</span>
            <span className="text-xs font-mono font-semibold text-primary">
              {profile.profileId.toString()}
            </span>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Personal Info */}
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                value={form.mobileNumber}
                onChange={(e) => setField("mobileNumber", e.target.value)}
                placeholder="10-digit mobile number"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Gender *</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setField("gender", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Gender.male}>Male</SelectItem>
                  <SelectItem value={Gender.female}>Female</SelectItem>
                  <SelectItem value={Gender.other}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setField("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Category.general}>General</SelectItem>
                  <SelectItem value={Category.obc}>OBC</SelectItem>
                  <SelectItem value={Category.sc}>SC</SelectItem>
                  <SelectItem value={Category.st}>ST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Disability Status *</Label>
              <Select
                value={form.disabilityStatus}
                onValueChange={(v) => setField("disabilityStatus", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select disability status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DisabilityStatus.none}>None</SelectItem>
                  <SelectItem value={DisabilityStatus.hearingImpaired}>
                    Hearing Impaired
                  </SelectItem>
                  <SelectItem value={DisabilityStatus.sightImpaired}>
                    Sight Impaired
                  </SelectItem>
                  <SelectItem value={DisabilityStatus.physicalImpaired}>
                    Physical Impaired
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="annualFamilyIncome">Annual Family Income *</Label>
              <Input
                id="annualFamilyIncome"
                value={form.annualFamilyIncome}
                onChange={(e) => setField("annualFamilyIncome", e.target.value)}
                placeholder="e.g. 3,00,000"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>State *</Label>
              <Select
                value={form.state}
                onValueChange={(v) => setField("state", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                value={form.district}
                onChange={(e) => setField("district", e.target.value)}
                placeholder="Enter your district"
              />
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Academic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="courseName">Course Name *</Label>
              <Input
                id="courseName"
                value={form.courseName}
                onChange={(e) => setField("courseName", e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
              />
            </div>

            {/* Education Level Dropdown */}
            <div className="space-y-1.5">
              <Label>Education Level *</Label>
              <Select
                value={educationLevel}
                onValueChange={handleEducationLevelChange}
              >
                <SelectTrigger data-ocid="profile.select">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional: Board Name */}
            {showBoardName && (
              <div className="space-y-1.5">
                <Label htmlFor="boardName">Board Name</Label>
                <Input
                  id="boardName"
                  value={form.boardName ?? ""}
                  onChange={(e) => setField("boardName", e.target.value)}
                  placeholder="e.g. CBSE, ICSE, State Board"
                  data-ocid="profile.input"
                />
              </div>
            )}

            {/* Conditional: University / College */}
            {showUniversityName && (
              <div className="space-y-1.5">
                <Label htmlFor="universityName">
                  University / College Name
                </Label>
                <Input
                  id="universityName"
                  value={form.universityName ?? ""}
                  onChange={(e) => setField("universityName", e.target.value)}
                  placeholder="e.g. IIT Delhi, AIIMS"
                  data-ocid="profile.input"
                />
              </div>
            )}

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="instituteName">Institute Name *</Label>
              <Input
                id="instituteName"
                value={form.instituteName}
                onChange={(e) => setField("instituteName", e.target.value)}
                placeholder="Enter your institute name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currentYear">Current Year *</Label>
              <Input
                id="currentYear"
                type="number"
                min="1"
                max="6"
                value={form.currentYear}
                onChange={(e) => setField("currentYear", e.target.value)}
                placeholder="e.g. 2"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={registerStudent.isPending}
            className="gap-2"
            data-ocid="profile.submit_button"
          >
            {registerStudent.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {profile ? "Update Profile" : "Register Profile"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
