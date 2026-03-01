import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useTranslation } from '../hooks/useTranslation';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Wand2, Save, Loader2, GraduationCap, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import type { AcademicRecord, CareerAchievement, MasterUserRecord } from '../backend';

interface AcademicForm {
  institution: string;
  degree: string;
  year: string;
  percentage: string;
  marksheetRef: string;
}

interface CareerForm {
  employer: string;
  role: string;
  duration: string;
  skills: string;
}

const emptyAcademic = (): AcademicForm => ({
  institution: '',
  degree: '',
  year: '',
  percentage: '',
  marksheetRef: '',
});

const emptyCareer = (): CareerForm => ({
  employer: '',
  role: '',
  duration: '',
  skills: '',
});

export default function ResumeBuilder() {
  const { t } = useTranslation();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { actor } = useActor();

  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { mutateAsync: saveProfile, isPending: saving } = useSaveCallerUserProfile();

  const [academics, setAcademics] = useState<AcademicForm[]>([emptyAcademic()]);
  const [careers, setCareers] = useState<CareerForm[]>([emptyCareer()]);
  const [autoFilling, setAutoFilling] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form from profile once loaded
  React.useEffect(() => {
    if (profile && !initialized) {
      setInitialized(true);
      if (profile.academics.length > 0) {
        setAcademics(
          profile.academics.map((a) => ({
            institution: a.institution,
            degree: a.degree,
            year: a.year.toString(),
            percentage: a.percentage.toString(),
            marksheetRef: a.marksheetRef ?? '',
          }))
        );
      }
      if (profile.career.length > 0) {
        setCareers(
          profile.career.map((c) => ({
            employer: c.employer,
            role: c.role,
            duration: c.duration,
            skills: c.skills.join(', '),
          }))
        );
      }
    }
  }, [profile, initialized]);

  if (!identity) {
    navigate({ to: '/login' });
    return null;
  }

  const handleAutoFill = async () => {
    if (!actor || !identity) return;
    setAutoFilling(true);
    try {
      const filled = await actor.getCallerUserProfile();
      if (filled) {
        if (filled.academics.length > 0) {
          setAcademics(
            filled.academics.map((a) => ({
              institution: a.institution,
              degree: a.degree,
              year: a.year.toString(),
              percentage: a.percentage.toString(),
              marksheetRef: a.marksheetRef ?? '',
            }))
          );
        }
        if (filled.career.length > 0) {
          setCareers(
            filled.career.map((c) => ({
              employer: c.employer,
              role: c.role,
              duration: c.duration,
              skills: c.skills.join(', '),
            }))
          );
        }
        toast.success('Form auto-filled from your profile!');
      } else {
        toast.error('No profile data found.');
      }
    } catch {
      toast.error('Auto-fill failed.');
    } finally {
      setAutoFilling(false);
    }
  };

  const handleSave = async () => {
    if (!profile) {
      toast.error('Please complete your basic profile first.');
      return;
    }

    // Validate required fields
    for (const a of academics) {
      if (!a.institution.trim() || !a.degree.trim()) {
        toast.error('Please fill in institution and degree for all academic records.');
        return;
      }
    }

    const academicRecords: AcademicRecord[] = academics
      .filter((a) => a.institution.trim())
      .map((a) => ({
        institution: a.institution.trim(),
        degree: a.degree.trim(),
        year: BigInt(parseInt(a.year) || 0),
        percentage: parseFloat(a.percentage) || 0,
        marksheetRef: a.marksheetRef.trim() || undefined,
      }));

    const careerRecords: CareerAchievement[] = careers
      .filter((c) => c.employer.trim())
      .map((c) => ({
        employer: c.employer.trim(),
        role: c.role.trim(),
        duration: c.duration.trim(),
        skills: c.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }));

    const updatedProfile: MasterUserRecord = {
      ...profile,
      academics: academicRecords,
      career: careerRecords,
    };

    try {
      await saveProfile(updatedProfile);
      toast.success(t('resume.saved'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const updateAcademic = (index: number, field: keyof AcademicForm, value: string) => {
    setAcademics((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  };

  const updateCareer = (index: number, field: keyof CareerForm, value: string) => {
    setCareers((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">{t('resume.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Build your academic and career profile
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoFill}
            disabled={autoFilling}
            className="border-teal-300 text-teal-700 hover:bg-teal-50 gap-1.5 text-xs"
          >
            {autoFilling ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5" />
            )}
            {t('resume.autoFill')}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-700 hover:bg-teal-800 text-white gap-1.5 text-xs"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving ? t('resume.saving') : t('resume.saveProfile')}
          </Button>
        </div>
      </div>

      {profileLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : (
        <Tabs defaultValue="academic">
          <TabsList className="bg-teal-50 border border-teal-100">
            <TabsTrigger
              value="academic"
              className="data-[state=active]:bg-teal-700 data-[state=active]:text-white gap-1.5"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              {t('resume.academic')}
            </TabsTrigger>
            <TabsTrigger
              value="career"
              className="data-[state=active]:bg-teal-700 data-[state=active]:text-white gap-1.5"
            >
              <Briefcase className="h-3.5 w-3.5" />
              {t('resume.career')}
            </TabsTrigger>
          </TabsList>

          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-4 mt-4">
            {academics.map((academic, index) => (
              <Card key={index} className="border-teal-100 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-teal-800">
                      Academic Record #{index + 1}
                    </CardTitle>
                    {academics.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAcademics((prev) => prev.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2 text-xs gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t('resume.remove')}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">
                      {t('resume.institution')} *
                    </Label>
                    <Input
                      value={academic.institution}
                      onChange={(e) => updateAcademic(index, 'institution', e.target.value)}
                      placeholder="e.g. Delhi University"
                      className="border-gray-200 focus:border-teal-400 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">
                      {t('resume.degree')} *
                    </Label>
                    <Input
                      value={academic.degree}
                      onChange={(e) => updateAcademic(index, 'degree', e.target.value)}
                      placeholder="e.g. B.Tech Computer Science"
                      className="border-gray-200 focus:border-teal-400 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">{t('resume.year')}</Label>
                    <Input
                      value={academic.year}
                      onChange={(e) => updateAcademic(index, 'year', e.target.value)}
                      placeholder="e.g. 2024"
                      type="number"
                      min="1990"
                      max="2030"
                      className="border-gray-200 focus:border-teal-400 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">
                      {t('resume.percentage')}
                    </Label>
                    <Input
                      value={academic.percentage}
                      onChange={(e) => updateAcademic(index, 'percentage', e.target.value)}
                      placeholder="e.g. 85.5"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="border-gray-200 focus:border-teal-400 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-medium text-gray-600">
                      {t('resume.marksheetRef')}
                    </Label>
                    <Input
                      value={academic.marksheetRef}
                      onChange={(e) => updateAcademic(index, 'marksheetRef', e.target.value)}
                      placeholder="e.g. marksheet_2024.pdf"
                      className="border-gray-200 focus:border-teal-400 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAcademics((prev) => [...prev, emptyAcademic()])}
              className="border-dashed border-teal-300 text-teal-700 hover:bg-teal-50 gap-1.5 text-xs w-full"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('resume.addAcademic')}
            </Button>
          </TabsContent>

          {/* Career Tab */}
          <TabsContent value="career" className="space-y-4 mt-4">
            {careers.map((career, index) => (
              <Card key={index} className="border-teal-100 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-teal-800">
                      Career Entry #{index + 1}
                    </CardTitle>
                    {careers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCareers((prev) => prev.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2 text-xs gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t('resume.remove')}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">{t('resume.employer')}</Label>
                    <Input
                      value={career.employer}
                      onChange={(e) => updateCareer(index, 'employer', e.target.value)}
                      placeholder="e.g. Infosys Ltd."
                      className="border-gray-200 focus:border-teal-400 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">{t('resume.role')}</Label>
                    <Input
                      value={career.role}
                      onChange={(e) => updateCareer(index, 'role', e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="border-gray-200 focus:border-teal-400 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">{t('resume.duration')}</Label>
                    <Input
                      value={career.duration}
                      onChange={(e) => updateCareer(index, 'duration', e.target.value)}
                      placeholder="e.g. Jan 2022 - Dec 2023"
                      className="border-gray-200 focus:border-teal-400 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">{t('resume.skills')}</Label>
                    <Input
                      value={career.skills}
                      onChange={(e) => updateCareer(index, 'skills', e.target.value)}
                      placeholder="e.g. React, Node.js, Python"
                      className="border-gray-200 focus:border-teal-400 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCareers((prev) => [...prev, emptyCareer()])}
              className="border-dashed border-teal-300 text-teal-700 hover:bg-teal-50 gap-1.5 text-xs w-full"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('resume.addCareer')}
            </Button>
          </TabsContent>
        </Tabs>
      )}

      {/* Save button (bottom) */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? t('resume.saving') : t('resume.saveProfile')}
        </Button>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-400 text-xs border-t border-gray-100">
        © {new Date().getFullYear()} ScholarPath · Built with ❤️ using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            window.location.hostname || 'scholarpath'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
