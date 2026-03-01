import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  icon: LucideIcon;
  value: string | number;
  title: string;
  description?: string;
  iconColor?: string;
  iconBg?: string;
  onClick?: () => void;
}

export default function SummaryCard({
  icon: Icon,
  value,
  title,
  description,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  onClick,
}: SummaryCardProps) {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`
        bg-card border border-border rounded-xl p-5
        flex items-start gap-4
        shadow-sm hover:shadow-md
        transition-all duration-200 ease-out
        ${isClickable
          ? 'cursor-pointer hover:-translate-y-0.5 hover:border-primary/30'
          : 'cursor-default'
        }
      `}
    >
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-foreground leading-none mb-1">{value}</p>
        <p className="text-sm font-medium text-foreground/80">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
