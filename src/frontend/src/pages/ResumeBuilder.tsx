import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  GraduationCap,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useGetMyProfile, useUpdateStudent } from "../hooks/useQueries";

interface LocalAcademicRecord {
  institution: string;
  degree: string;
  year: number;
  percentage: number;
  marksheetRef: string;
}

interface LocalCareerAchievement {
  employer: string;
  role: string;
  duration: string;
  skills: string[];
}

export default function ResumeBuilder() {
  const { data: student, isLoading: studentLoading } = useGetMyProfile();
  const updateStudent = useUpdateStudent();

  const [academicRecords, setAcademicRecords] = useState<LocalAcademicRecord[]>(
    [],
  );
  const [careerAchievements, setCareerAchievements] = useState<
    LocalCareerAchievement[]
  >([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveMessageType, setSaveMessageType] = useState<"success" | "error">(
    "success",
  );
  const [activeTab, setActiveTab] = useState<"academic" | "career">("academic");

  // Pre-populate from student data
  useEffect(() => {
    if (student) {
      setAcademicRecords(
        (student.academicRecords ?? []).map((r) => ({
          institution: r.institution,
          degree: r.degree,
          year: Number(r.year),
          percentage: r.percentage,
          marksheetRef: r.marksheetRef ?? "",
        })),
      );
      setCareerAchievements(
        (student.careerAchievements ?? []).map((c) => ({
          employer: c.employer,
          role: c.role,
          duration: c.duration,
          skills: c.skills,
        })),
      );
    }
  }, [student]);

  const showMessage = (msg: string, type: "success" | "error") => {
    setSaveMessage(msg);
    setSaveMessageType(type);
    setTimeout(() => setSaveMessage(""), 4000);
  };

  const handleSave = async () => {
    try {
      await updateStudent.mutateAsync({ academicRecords, careerAchievements });
      showMessage("Resume saved successfully!", "success");
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : "Save failed", "error");
    }
  };

  // ── Academic Records ───────────────────────────────────────────────────────

  const addAcademicRecord = () => {
    const newRecord: LocalAcademicRecord = {
      institution: "",
      degree: "",
      year: new Date().getFullYear(),
      percentage: 0,
      marksheetRef: "",
    };
    setAcademicRecords((prev) => [...prev, newRecord]);
  };

  const updateAcademicRecord = (
    index: number,
    field: keyof LocalAcademicRecord,
    value: unknown,
  ) => {
    setAcademicRecords((prev) =>
      prev.map((rec, i) => (i === index ? { ...rec, [field]: value } : rec)),
    );
  };

  const removeAcademicRecord = (index: number) => {
    setAcademicRecords((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Career Achievements ────────────────────────────────────────────────────

  const addCareerAchievement = () => {
    const newAchievement: LocalCareerAchievement = {
      employer: "",
      role: "",
      duration: "",
      skills: [],
    };
    setCareerAchievements((prev) => [...prev, newAchievement]);
  };

  const updateCareerAchievement = (
    index: number,
    field: keyof LocalCareerAchievement,
    value: unknown,
  ) => {
    setCareerAchievements((prev) =>
      prev.map((ach, i) => (i === index ? { ...ach, [field]: value } : ach)),
    );
  };

  const removeCareerAchievement = (index: number) => {
    setCareerAchievements((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSkills = (index: number, skillsText: string) => {
    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    updateCareerAchievement(index, "skills", skills);
  };

  if (studentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          Loading resume data...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Resume Builder
            </h1>
            <p className="text-sm text-muted-foreground">
              Build your academic and career profile
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={updateStudent.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {updateStudent.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Resume
        </button>
      </div>

      {/* Save message */}
      {saveMessage && (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            saveMessageType === "error"
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {saveMessageType === "error" ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          {saveMessage}
        </div>
      )}

      {/* No profile warning */}
      {!student && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Profile Required</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              Please complete your profile first before building your resume.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("academic")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "academic"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Academic Records
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("career")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "career"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Career &amp; Skills
        </button>
      </div>

      {/* Academic Records Tab */}
      {activeTab === "academic" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Academic Records
            </h2>
            <button
              type="button"
              onClick={addAcademicRecord}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          </div>

          {academicRecords.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                No academic records yet. Add your first record.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {academicRecords.map((record, index) => (
                <div
                  key={`academic-${record.institution}-${index}`}
                  className="bg-card border border-border rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Record #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAcademicRecord(index)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Institution
                      </span>
                      <input
                        type="text"
                        value={record.institution}
                        onChange={(e) =>
                          updateAcademicRecord(
                            index,
                            "institution",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. Delhi University"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Degree / Course
                      </span>
                      <input
                        type="text"
                        value={record.degree}
                        onChange={(e) =>
                          updateAcademicRecord(index, "degree", e.target.value)
                        }
                        placeholder="e.g. B.Tech Computer Science"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Year of Passing
                      </span>
                      <input
                        type="number"
                        value={record.year}
                        onChange={(e) =>
                          updateAcademicRecord(
                            index,
                            "year",
                            Number.parseInt(e.target.value) || 0,
                          )
                        }
                        placeholder="e.g. 2023"
                        min={1990}
                        max={2030}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Percentage / CGPA
                      </span>
                      <input
                        type="number"
                        value={record.percentage}
                        onChange={(e) =>
                          updateAcademicRecord(
                            index,
                            "percentage",
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="e.g. 85.5"
                        min={0}
                        max={100}
                        step={0.1}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Career & Skills Tab */}
      {activeTab === "career" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Career &amp; Skills
            </h2>
            <button
              type="button"
              onClick={addCareerAchievement}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          </div>

          {careerAchievements.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                No career entries yet. Add internships, jobs, or projects.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {careerAchievements.map((achievement, index) => (
                <div
                  key={`career-${achievement.employer}-${index}`}
                  className="bg-card border border-border rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Entry #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCareerAchievement(index)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Employer / Organization
                      </span>
                      <input
                        type="text"
                        value={achievement.employer}
                        onChange={(e) =>
                          updateCareerAchievement(
                            index,
                            "employer",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. Google, NGO Name"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Role / Position
                      </span>
                      <input
                        type="text"
                        value={achievement.role}
                        onChange={(e) =>
                          updateCareerAchievement(index, "role", e.target.value)
                        }
                        placeholder="e.g. Software Intern"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Duration
                      </span>
                      <input
                        type="text"
                        value={achievement.duration}
                        onChange={(e) =>
                          updateCareerAchievement(
                            index,
                            "duration",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. 3 months, 2021–2022"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Skills (comma-separated)
                      </span>
                      <input
                        type="text"
                        value={achievement.skills.join(", ")}
                        onChange={(e) => updateSkills(index, e.target.value)}
                        placeholder="e.g. Python, teamwork, analysis"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
