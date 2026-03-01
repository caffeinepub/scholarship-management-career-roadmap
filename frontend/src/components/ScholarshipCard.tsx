import React from 'react';
import { Calendar, Building2, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../hooks/useTranslation';
import type { Scholarship } from '../backend';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  isEligible?: boolean | null;
  onApplyClick: (id: bigint) => void;
}

export default function ScholarshipCard({ scholarship, isEligible, onApplyClick }: ScholarshipCardProps) {
  const { t } = useTranslation();

  const categoryLabel: Record<string, string> = {
    general: t('scholarships.filter.general'),
    obc: t('scholarships.filter.obc'),
    sc: t('scholarships.filter.sc'),
    st: t('scholarships.filter.st'),
  };

  return (
    <Card className="border border-teal-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">
            {scholarship.title}
          </h3>
          {isEligible === true ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs shrink-0 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {t('scholarships.eligible')}
            </Badge>
          ) : isEligible === false ? (
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-300 bg-amber-50 text-xs shrink-0 flex items-center gap-1"
            >
              <HelpCircle className="h-3 w-3" />
              {t('scholarships.checkEligibility')}
            </Badge>
          ) : null}
        </div>

        {/* Meta */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Building2 className="h-3.5 w-3.5 text-teal-500" />
            <span className="truncate">{scholarship.provider}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 text-amber-500" />
            <span>
              {t('scholarships.deadline')}: {scholarship.deadline}
            </span>
          </div>
        </div>

        {/* Category badge */}
        <div className="mb-3">
          <Badge variant="secondary" className="text-xs bg-teal-50 text-teal-700 border-teal-100">
            {categoryLabel[scholarship.eligibility.category] ?? scholarship.eligibility.category}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2 flex-1 mb-4">{scholarship.description}</p>

        {/* Action */}
        <Button
          size="sm"
          onClick={() => onApplyClick(scholarship.id)}
          className="w-full bg-saffron hover:bg-saffron-dark text-white font-semibold text-xs flex items-center gap-1.5 mt-auto"
        >
          {t('scholarships.applyNow')}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
