import React from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useCheckEligibility } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SkillGapAnalysisProps {
  scholarshipId: bigint | null;
  requiredSkills?: string[];
}

export default function SkillGapAnalysis({ scholarshipId, requiredSkills = [] }: SkillGapAnalysisProps) {
  const { t } = useTranslation();
  const { data: profile } = useGetCallerUserProfile();
  const { data: eligibility, isLoading } = useCheckEligibility(scholarshipId);

  const userSkills: string[] = profile?.career.flatMap((c) => c.skills) ?? [];
  const required = requiredSkills.length > 0 ? requiredSkills : [];

  if (!scholarshipId) {
    return (
      <Card className="border-teal-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-teal-800">{t('skillGap.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">{t('skillGap.selectScholarship')}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-teal-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-teal-800">{t('skillGap.title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </CardContent>
      </Card>
    );
  }

  const missingSkills =
    eligibility?.unmetRequirements
      .filter((r) => r.startsWith('Missing required skill:'))
      .map((r) => r.replace('Missing required skill: ', '')) ?? [];

  const matchedSkills = required.filter((s) => !missingSkills.includes(s));

  return (
    <Card className="border-teal-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-teal-800">{t('skillGap.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Your Skills */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('skillGap.yourSkills')}
            </h4>
            {userSkills.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No skills added</p>
            ) : (
              <ul className="space-y-1.5">
                {userSkills.map((skill, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-gray-700">{skill}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Required Skills */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('skillGap.requiredSkills')}
            </h4>
            {required.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No specific skills required</p>
            ) : (
              <ul className="space-y-1.5">
                {required.map((skill, i) => {
                  const isMissing = missingSkills.includes(skill);
                  return (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {isMissing ? (
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                      <span className={isMissing ? 'text-red-600 font-medium' : 'text-gray-700'}>
                        {skill}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Summary badges */}
        {required.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex gap-3">
            <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">
              <CheckCircle className="h-3 w-3" />
              {matchedSkills.length} {t('skillGap.matched')}
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full font-medium">
              <AlertCircle className="h-3 w-3" />
              {missingSkills.length} {t('skillGap.missing')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
