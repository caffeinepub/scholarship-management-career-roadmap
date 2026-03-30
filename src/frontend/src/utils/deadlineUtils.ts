export type DeadlineStatus = "Open" | "Closing Soon" | "Closed";

export function getDaysLeft(isoDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadline = new Date(isoDate);
  deadline.setHours(0, 0, 0, 0);
  return Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function getDeadlineStatus(isoDate: string): DeadlineStatus {
  const days = getDaysLeft(isoDate);
  if (days < 0) return "Closed";
  if (days <= 7) return "Closing Soon";
  return "Open";
}

export function getStatusColors(status: DeadlineStatus) {
  if (status === "Closed")
    return {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
      bar: "bg-red-500",
    };
  if (status === "Closing Soon")
    return {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      border: "border-yellow-200",
      bar: "bg-yellow-500",
    };
  return {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    bar: "bg-green-500",
  };
}
