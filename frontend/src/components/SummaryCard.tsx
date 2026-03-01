import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  accentColor?: 'teal' | 'saffron' | 'emerald' | 'blue' | 'purple';
}

const accentMap = {
  teal: {
    bg: 'bg-teal-50',
    icon: 'text-teal-600',
    border: 'border-teal-100',
    value: 'text-teal-700',
  },
  saffron: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    border: 'border-amber-100',
    value: 'text-amber-700',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    border: 'border-emerald-100',
    value: 'text-emerald-700',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-100',
    value: 'text-blue-700',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-100',
    value: 'text-purple-700',
  },
};

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
  accentColor = 'teal',
}: SummaryCardProps) {
  const accent = accentMap[accentColor];

  return (
    <Card className={`border ${accent.border} shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
            <p className={`text-2xl font-bold ${accent.value} truncate`}>{value}</p>
            {description && <p className="text-xs text-gray-400 mt-1 truncate">{description}</p>}
          </div>
          <div className={`${accent.bg} p-2.5 rounded-xl ml-3 shrink-0`}>
            <Icon className={`h-5 w-5 ${accent.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
