import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useTranslation } from '../hooks/useTranslation';
import {
  useGetScholarship,
  useCheckEligibility,
  useGetCallerUserProfile,
  useApplyToScholarship,
} from '../hooks/useQueries';
import DocumentChecklist from '../components/DocumentChecklist';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Wand2,
  Send,
  Calendar,
  Building2,
  Percent,
  Tag,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ApplicationStatus } from '../backend';
import type { MasterUserRecord, ScholarshipApplication } from '../backend';
import { useActor } from '../hooks/useActor';

export default function ScholarshipDetail() {
  const { id } = useParams({ from: '/protected/scholarships/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { t } = useTranslation();
  const { actor } = useActor();

  const scholarshipId = BigInt(id);

  const { data: scholarship, isLoading: scholarshipLoading } = useGetScholarship(scholarshipId);
  const { data: eligibility, isLoading: eligibilityLoading } = useCheckEligibility(scholarshipId);
  const { data: profile } = useGetCallerUserProfile();
  const { mutateAsync: applyToScholarship, isPending: applying } = useApplyToScholarship();

  const [formData, setFormData] = useState<Partial<MasterUserRecord>>({});
  const [autoFilling, setAutoFilling] = useState(false);

  if (!identity) {
    navigate({ to: '/login' });
    return null;
  }

  const handleAutoFill = async () => {
    if (!actor || !identity) return;
    setAutoFilling(true);
    try {
      const filled = await actor.autoFillApplication(scholarshipId, identity.getPrincipal());
      if (filled) {
        setFormData(filled);
        toast.success('Form auto-filled from your profile!');
      } else {
        toast.error('No profile data found. Please complete your profile first.');
      }
    } catch {
      toast.error('Auto-fill failed. Please try again.');
    } finally {
      setAutoFilling(false);
    }
  };

  const missingRequiredDocs =
    scholarship?.requiredDocuments.filter((doc) => {
      return !profile?.documents.some(
        (d) =>
          d.uploadStatus &&
          (d.documentType === doc ||
            d.fileName.toLowerCase().includes(doc.toLowerCase()) ||
            d.documentType.toLowerCase().includes(doc.toLowerCase()))
      );
    }) ?? [];

  const canSubmit = missingRequiredDocs.length === 0 && !!profile;

  const handleSubmit = async () => {
    if (!identity || !profile || !scholarship) return;

    const application: ScholarshipApplication = {
      userId: identity.getPrincipal(),
      scholarshipId,
      status: ApplicationStatus.submitted,
      filledFields: {
        ...profile,
        ...(formData as MasterUserRecord),
      },
    };

    try {
      await applyToScholarship({ scholarshipId, application });
      toast.success(t('detail.successMessage'));
      navigate({ to: '/my-applications' });
    } catch {
      toast.error(t('common.error'));
    }
  };

  if (scholarshipLoading) {
    return (
      <div className="p-6 space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Scholarship not found.</p>
        <Button onClick={() => navigate({ to: '/scholarships' })} className="mt-4">
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/scholarships' })}
          className="text-teal-700 hover:text-teal-900 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('common.back')}
        </Button>

        {/* Scholarship Info */}
        <Card className="border-teal-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-teal-900 mb-2">{scholarship.title}</h1>
                <p className="text-gray-600 text-sm mb-4">{scholarship.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Building2 className="h-3.5 w-3.5 text-teal-500" />
                    <span>{scholarship.provider}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    <span>{scholarship.deadline}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Percent className="h-3.5 w-3.5 text-blue-500" />
                    <span>Min {scholarship.eligibility.minPercentage}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Tag className="h-3.5 w-3.5 text-purple-500" />
                    <span className="capitalize">{scholarship.eligibility.category}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility Summary */}
        <Card className="border-teal-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-teal-800 flex items-center gap-2">
              {eligibilityLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : eligibility?.isEligible ? (
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              {t('detail.eligibility')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eligibilityLoading ? (
              <Skeleton className="h-16 rounded-lg" />
            ) : (
              <div className="space-y-3">
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    eligibility?.isEligible
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {eligibility?.isEligible ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                  <p className="text-sm font-medium">
                    {eligibility?.isEligible ? t('detail.eligible') : t('detail.notEligible')}
                  </p>
                </div>

                {eligibility && eligibility.unmetRequirements.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      {t('detail.unmetRequirements')}:
                    </p>
                    <ul className="space-y-1">
                      {eligibility.unmetRequirements.map((req, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-red-600">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {eligibility && eligibility.missingDocuments.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      {t('detail.missingDocuments')}:
                    </p>
                    <ul className="space-y-1">
                      {eligibility.missingDocuments.map((doc, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-amber-600">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Checklist */}
        <Card className="border-teal-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-teal-800">
              {t('detail.requiredDocuments')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scholarship.requiredDocuments.length === 0 ? (
              <p className="text-sm text-gray-500">No specific documents required.</p>
            ) : (
              <DocumentChecklist
                requiredDocuments={scholarship.requiredDocuments}
                userDocuments={profile?.documents ?? []}
                userProfile={profile ?? null}
              />
            )}
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card className="border-teal-100 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-teal-800">
                {t('detail.applicationForm')}
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAutoFill}
                disabled={autoFilling}
                className="text-xs border-teal-300 text-teal-700 hover:bg-teal-50 gap-1.5"
              >
                {autoFilling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5" />
                )}
                {t('detail.autoFill')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">Full Name</Label>
                <Input
                  value={(formData as MasterUserRecord)?.name ?? profile?.name ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                  className="border-gray-200 focus:border-teal-400 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">Email</Label>
                <Input
                  value={(formData as MasterUserRecord)?.email ?? profile?.email ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="border-gray-200 focus:border-teal-400 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">Date of Birth</Label>
                <Input
                  value={(formData as MasterUserRecord)?.dob ?? profile?.dob ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dob: e.target.value }))}
                  type="date"
                  className="border-gray-200 focus:border-teal-400 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">Institution</Label>
                <Input
                  value={
                    (formData as MasterUserRecord)?.academics?.[0]?.institution ??
                    profile?.academics?.[0]?.institution ??
                    ''
                  }
                  readOnly
                  placeholder="Your institution"
                  className="border-gray-200 bg-gray-50 text-sm"
                />
              </div>
            </div>

            {/* Required Skills */}
            {scholarship.eligibility.requiredSkills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  {t('detail.requiredSkills')}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {scholarship.eligibility.requiredSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block w-full">
                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit || applying}
                      className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2"
                    >
                      {applying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {t('detail.submit')}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canSubmit && (
                  <TooltipContent>
                    <p>{t('detail.submitDisabled')}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </CardContent>
        </Card>

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
    </TooltipProvider>
  );
}
