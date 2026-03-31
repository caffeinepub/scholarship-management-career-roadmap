import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, FileText, Loader2, Star } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface StoredDoc {
  type: string;
  label: string;
  source: string;
  status: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  category: string;
  state: string;
  district: string;
  courseName: string;
  courseLevel: string;
  currentYear: string;
  instituteName: string;
  annualFamilyIncome: string;
  sop: string;
}

const DOC_SLOTS = [
  { key: "aadhaarKyc", label: "Aadhaar Card" },
  { key: "marksheet", label: "10th / 12th Marksheet" },
  { key: "incomeCertificate", label: "Income Certificate" },
];

export default function ScholarshipApplyPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    category: "",
    state: "",
    district: "",
    courseName: "",
    courseLevel: "",
    currentYear: "",
    instituteName: "",
    annualFamilyIncome: "",
    sop: "",
  });
  const [docs, setDocs] = useState<StoredDoc[]>([]);
  const [autoFilled, setAutoFilled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Load profile
    try {
      const raw =
        localStorage.getItem("scholarSync_profile") ||
        localStorage.getItem("studentProfile");
      if (raw) {
        const p = JSON.parse(raw);
        setForm((prev) => ({
          ...prev,
          fullName: p.fullName || p.name || "",
          email: p.email || "",
          phone: p.mobileNumber || p.phone || "",
          gender: p.gender || "",
          category: p.category || "",
          state: p.state || "",
          district: p.district || "",
          courseName: p.courseName || "",
          courseLevel: p.courseLevel || "",
          currentYear: p.currentYear ? String(p.currentYear) : "",
          instituteName: p.instituteName || p.college || "",
          annualFamilyIncome: p.annualFamilyIncome || p.income || "",
        }));
        setAutoFilled(true);
      }
    } catch {}

    // Load docs
    try {
      const rawDocs = localStorage.getItem("scholarSync_documents");
      if (rawDocs) {
        setDocs(JSON.parse(rawDocs));
        setAutoFilled(true);
      }
    } catch {}
  }, []);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("Please fill in Full Name and Email before submitting.");
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const existing = JSON.parse(
        localStorage.getItem("scholarSync_applications") || "[]",
      );
      existing.push({
        id: Date.now(),
        scholarship: "Future Leaders Scholarship",
        appliedAt: new Date().toISOString(),
        status: "Submitted",
        ...form,
      });
      localStorage.setItem(
        "scholarSync_applications",
        JSON.stringify(existing),
      );
    } catch {}
    setIsSubmitting(false);
    toast.success("Application submitted successfully! 🎉");
    setSubmitted(true);
  };

  const docAttached = (key: string) =>
    docs.some((d) => d.type === key && d.status === "Verified");

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        data-ocid="apply.success_state"
      >
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-xl space-y-5">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-11 h-11 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Application Submitted!
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Your application for <strong>Future Leaders Scholarship</strong>{" "}
              has been submitted. You will be notified about the status.
            </p>
          </div>
          <Button
            className="w-full"
            onClick={() => navigate({ to: "/applications" })}
            data-ocid="apply.primary_button"
          >
            View My Applications
          </Button>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground underline"
            onClick={() => navigate({ to: "/scholarships" })}
          >
            Back to Scholarships
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6" data-ocid="apply.page">
      {/* Header */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => navigate({ to: "/scholarships" })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          data-ocid="apply.link"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scholarships
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Star className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Future Leaders Scholarship — Application Form
            </h1>
            <p className="text-sm text-muted-foreground">
              Demo scholarship for testing auto-apply feature
            </p>
          </div>
        </div>
      </div>

      {/* Auto-fill banner */}
      {autoFilled && (
        <div
          className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
          data-ocid="apply.success_state"
        >
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 font-medium">
            ✅ Your details and documents have been auto-filled from your
            profile and document section.
          </p>
        </div>
      )}

      {/* Personal Details */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
          Personal Details
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Enter your full name"
              data-ocid="apply.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Enter your email"
              data-ocid="apply.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Enter phone number"
              data-ocid="apply.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={form.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              data-ocid="apply.select"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              data-ocid="apply.select"
            >
              <option value="">Select category</option>
              <option value="general">General</option>
              <option value="obc">OBC</option>
              <option value="sc">SC</option>
              <option value="st">ST</option>
              <option value="ews">EWS</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
              placeholder="Enter your state"
              data-ocid="apply.input"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              value={form.district}
              onChange={(e) => handleChange("district", e.target.value)}
              placeholder="Enter your district"
              data-ocid="apply.input"
            />
          </div>
        </div>
      </div>

      {/* Education Details */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
          Education Details
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="courseName">Course Name</Label>
            <Input
              id="courseName"
              value={form.courseName}
              onChange={(e) => handleChange("courseName", e.target.value)}
              placeholder="e.g. B.Tech, MBBS"
              data-ocid="apply.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="courseLevel">Course Level</Label>
            <Input
              id="courseLevel"
              value={form.courseLevel}
              onChange={(e) => handleChange("courseLevel", e.target.value)}
              placeholder="e.g. Undergraduate"
              data-ocid="apply.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currentYear">Current Year</Label>
            <Input
              id="currentYear"
              type="number"
              value={form.currentYear}
              onChange={(e) => handleChange("currentYear", e.target.value)}
              placeholder="e.g. 2"
              data-ocid="apply.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="instituteName">Institute Name</Label>
            <Input
              id="instituteName"
              value={form.instituteName}
              onChange={(e) => handleChange("instituteName", e.target.value)}
              placeholder="Enter institute name"
              data-ocid="apply.input"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="income">Annual Family Income</Label>
            <Input
              id="income"
              value={form.annualFamilyIncome}
              onChange={(e) =>
                handleChange("annualFamilyIncome", e.target.value)
              }
              placeholder="e.g. 2,50,000"
              data-ocid="apply.input"
            />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
          Documents
        </h2>
        <div className="space-y-2.5">
          {DOC_SLOTS.map((slot) => (
            <div
              key={slot.key}
              className="flex items-center gap-3 rounded-xl px-4 py-3 border"
              style={{
                background: docAttached(slot.key) ? "#f0fdf4" : "#fefce8",
                borderColor: docAttached(slot.key) ? "#bbf7d0" : "#fde047",
              }}
            >
              <FileText
                className="w-4 h-4 shrink-0"
                style={{
                  color: docAttached(slot.key) ? "#16a34a" : "#ca8a04",
                }}
              />
              <span className="flex-1 text-sm font-medium text-foreground">
                {slot.label}
              </span>
              {docAttached(slot.key) ? (
                <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full font-medium shrink-0">
                  ✅ Attached (DigiLocker Verified)
                </span>
              ) : (
                <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2.5 py-0.5 rounded-full font-medium shrink-0">
                  ⚠️ Not uploaded — please upload from Documents page
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Statement of Purpose */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
          Statement of Purpose
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="sop">Why do you deserve this scholarship?</Label>
          <Textarea
            id="sop"
            value={form.sop}
            onChange={(e) => handleChange("sop", e.target.value)}
            placeholder="Briefly describe your academic goals and why you need this scholarship..."
            rows={5}
            data-ocid="apply.textarea"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="pb-8">
        <Button
          className="w-full h-12 text-base font-semibold rounded-xl"
          onClick={handleSubmit}
          disabled={isSubmitting}
          data-ocid="apply.submit_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.38 0.18 265), oklch(0.55 0.2 250))",
            color: "white",
            border: "none",
          }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting Application...
            </span>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </div>
  );
}
