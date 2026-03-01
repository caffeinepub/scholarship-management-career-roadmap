import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, CheckCircle, BookOpen, Briefcase } from 'lucide-react';
import { useGetMyStudent, useUpdateStudent } from '../hooks/useQueries';
import { AcademicRecord, CareerAchievement } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const emptyAcademic = (): AcademicRecord => ({
  institution: '',
  degree: '',
  year: BigInt(new Date().getFullYear()),
  percentage: 0,
  marksheetRef: undefined,
});

const emptyCareer = (): CareerAchievement => ({
  employer: '',
  role: '',
  duration: '',
  skills: [],
});

export default function ResumeBuilder() {
  const { data: student, isLoading } = useGetMyStudent();
  const updateStudent = useUpdateStudent();

  const [academics, setAcademics] = useState<AcademicRecord[]>([emptyAcademic()]);
  const [careers, setCareers] = useState<CareerAchievement[]>([emptyCareer()]);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (student) {
      if (student.academicRecords.length > 0) setAcademics(student.academicRecords);
      if (student.careerAchievements.length > 0) setCareers(student.careerAchievements);
    }
  }, [student]);

  const handleSave = async () => {
    if (!student) return;
    setSaveError('');
    try {
      await updateStudent.mutateAsync({
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        mobileNumber: student.mobileNumber,
        gender: student.gender,
        category: student.category,
        disabilityStatus: student.disabilityStatus,
        annualFamilyIncome: student.annualFamilyIncome,
        state: student.state,
        district: student.district,
        courseName: student.courseName,
        courseLevel: student.courseLevel,
        instituteName: student.instituteName,
        currentYear: student.currentYear,
        profileCompletionPercentage: student.profileCompletionPercentage,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const updateAcademic = (idx: number, field: keyof AcademicRecord, value: string | number | bigint) => {
    setAcademics((prev) => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };

  const updateCareer = (idx: number, field: keyof CareerAchievement, value: string | string[]) => {
    setCareers((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-lg w-40" />
          <div className="h-10 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto text-center py-16">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Profile Required</h2>
        <p className="text-sm text-muted-foreground">
          Please complete your profile first before building your resume.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Resume Builder</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Add your academic and career details to auto-fill scholarship applications.
        </p>
      </div>

      <Tabs defaultValue="academic">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="academic" className="cursor-pointer gap-2 flex-1 sm:flex-none">
            <BookOpen className="w-4 h-4" />
            Academic Records
          </TabsTrigger>
          <TabsTrigger value="career" className="cursor-pointer gap-2 flex-1 sm:flex-none">
            <Briefcase className="w-4 h-4" />
            Career &amp; Skills
          </TabsTrigger>
        </TabsList>

        {/* Academic Tab */}
        <TabsContent value="academic" className="mt-4 space-y-4">
          {academics.map((record, idx) => (
            <div key={idx} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">
                  Academic Record {idx + 1}
                </h3>
                {academics.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAcademics((prev) => prev.filter((_, i) => i !== idx))}
                    className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium cursor-pointer">Institution</Label>
                  <Input
                    value={record.institution}
                    onChange={(e) => updateAcademic(idx, 'institution', e.target.value)}
                    placeholder="e.g. Delhi University"
                    className="cursor-text transition-colors duration-150"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium cursor-pointer">Degree / Class</Label>
                  <Input
                    value={record.degree}
                    onChange={(e) => updateAcademic(idx, 'degree', e.target.value)}
                    placeholder="e.g. B.Tech, 12th Grade"
                    className="cursor-text transition-colors duration-150"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium cursor-pointer">Year of Passing</Label>
                  <Input
                    type="number"
                    value={Number(record.year)}
                    onChange={(e) => updateAcademic(idx, 'year', BigInt(e.target.value || 0))}
                    placeholder="e.g. 2023"
                    min={1990}
                    max={2030}
                    className="cursor-text transition-colors duration-150"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium cursor-pointer">Percentage / CGPA</Label>
                  <Input
                    type="number"
                    value={record.percentage}
                    onChange={(e) => updateAcademic(idx, 'percentage', parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 85.5"
                    min={0}
                    max={100}
                    step={0.1}
                    className="cursor-text transition-colors duration-150"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={() => setAcademics((prev) => [...prev, emptyAcademic()])}
            className="cursor-pointer gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            Add Academic Record
          </Button>
        </TabsContent>

        {/* Career Tab */}
        <TabsContent value="career" className="mt-4 space-y-4">
          {careers.map((career, idx) => (
            <div key={idx} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">
                  Career Entry {idx + 1}
                </h3>
                {careers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCareers((prev) => prev.filter((_, i) => i !== idx))}
                    className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium cursor-pointer">Employer</Label>
                  <Input
                    value={career.employer}
                    onChange={(e) => updateCareer(idx, 'employer', e.target.value)}
                    placeholder="e.g. TCS, Infosys"
                    className="cursor-text transition-colors duration-150"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium cursor-pointer">Role</Label>
                  <Input
                    value={career.role}
                    onChange={(e) => updateCareer(idx, 'role', e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="cursor-text transition-colors duration-150"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium cursor-pointer">Duration</Label>
                  <Input
                    value={career.duration}
                    onChange={(e) => updateCareer(idx, 'duration', e.target.value)}
                    placeholder="e.g. Jan 2022 – Dec 2023"
                    className="cursor-text transition-colors duration-150"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium cursor-pointer">Skills (comma-separated)</Label>
                  <Input
                    value={career.skills.join(', ')}
                    onChange={(e) =>
                      updateCareer(
                        idx,
                        'skills',
                        e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      )
                    }
                    placeholder="e.g. React, TypeScript, Node.js"
                    className="cursor-text transition-colors duration-150"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={() => setCareers((prev) => [...prev, emptyCareer()])}
            className="cursor-pointer gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            Add Career Entry
          </Button>
        </TabsContent>
      </Tabs>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <Button
          onClick={handleSave}
          disabled={updateStudent.isPending}
          className="cursor-pointer gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-md transition-all duration-150 disabled:cursor-not-allowed"
        >
          {updateStudent.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Resume
            </>
          )}
        </Button>
        {saved && (
          <p className="text-sm text-green-600 font-medium">Resume saved successfully.</p>
        )}
        {saveError && (
          <p className="text-sm text-red-500 font-medium">{saveError}</p>
        )}
      </div>
    </div>
  );
}
