import React, { useState } from "react";
import { useTranslation } from "../hooks/useTranslation";

interface ProfileCompletionMeterProps {
  completionPercentage: number;
  missingItems: string[];
  size?: number;
}

export default function ProfileCompletionMeter({
  completionPercentage,
  missingItems,
  size = 120,
}: ProfileCompletionMeterProps) {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  const pct = Math.min(100, Math.max(0, Math.round(completionPercentage)));
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const getColor = () => {
    if (pct <= 40) return "#ef4444"; // red
    if (pct <= 79) return "#f59e0b"; // amber
    return "#10b981"; // green
  };

  const color = getColor();

  return (
    <div className="relative inline-flex flex-col items-center">
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => pct < 100 && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => pct < 100 && setShowTooltip((v) => !v)}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          className="rotate-[-90deg]"
          aria-hidden="true"
        >
          <title>Profile completion: {pct}%</title>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease",
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {pct}%
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {t("profile.complete")}
          </span>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && missingItems.length > 0 && (
        <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl min-w-[180px] max-w-[240px]">
          <p className="font-semibold mb-1.5 text-amber-300">
            {t("profile.missingItems")}:
          </p>
          <ul className="space-y-1">
            {missingItems.map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <span className="text-red-400 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
