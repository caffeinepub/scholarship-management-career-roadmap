import { Clock } from "lucide-react";
import {
  getDaysLeft,
  getDeadlineStatus,
  getStatusColors,
} from "../utils/deadlineUtils";

interface Props {
  deadlineDate?: string;
}

export default function DeadlineBadge({ deadlineDate }: Props) {
  if (!deadlineDate) return null;

  const status = getDeadlineStatus(deadlineDate);
  const daysLeft = getDaysLeft(deadlineDate);
  const colors = getStatusColors(status);

  let label: string;
  if (status === "Closed") {
    label = "Closed";
  } else if (daysLeft === 0) {
    label = "Last Day!";
  } else if (daysLeft === 1) {
    label = "1 day left!";
  } else {
    label = `${daysLeft} days left`;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${
        colors.bg
      } ${colors.text} ${colors.border}`}
    >
      <Clock className="w-3 h-3" />
      <span className="font-semibold">{status}</span>
      <span className="opacity-75">·</span>
      <span>{label}</span>
    </span>
  );
}
