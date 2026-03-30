import { getDaysLeft, getDeadlineStatus } from "../utils/deadlineUtils";

interface Props {
  deadlineDate: string;
  className?: string;
}

export default function DeadlineProgressBar({
  deadlineDate,
  className = "",
}: Props) {
  const daysLeft = getDaysLeft(deadlineDate);
  const status = getDeadlineStatus(deadlineDate);

  // 100% fill = 0 days left, 0% fill = 90+ days
  const pct = Math.max(0, Math.min(100, ((90 - daysLeft) / 90) * 100));

  const barColor = status === "Open" ? "bg-green-500" : "bg-red-500";

  const textLabel =
    daysLeft < 0
      ? "Deadline passed"
      : daysLeft === 0
        ? "Today is the last day!"
        : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{textLabel}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
