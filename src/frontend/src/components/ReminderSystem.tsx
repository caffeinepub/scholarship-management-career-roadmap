import { useEffect } from "react";
import { toast } from "sonner";
import { scholarshipsData } from "../data/scholarshipsData";
import { getDaysLeft } from "../utils/deadlineUtils";

export default function ReminderSystem() {
  useEffect(() => {
    const REMINDER_DAYS = [7, 2, 0];

    for (const scholarship of scholarshipsData) {
      if (!scholarship.deadlineDate) continue;
      const daysLeft = getDaysLeft(scholarship.deadlineDate);

      for (const targetDays of REMINDER_DAYS) {
        if (daysLeft !== targetDays) continue;

        const key = `reminder_shown_${scholarship.id}_${targetDays}`;
        if (localStorage.getItem(key)) continue;

        localStorage.setItem(key, "1");

        if (targetDays === 7) {
          toast.warning(`⏰ ${scholarship.name} deadline in 7 days!`, {
            duration: 6000,
          });
        } else if (targetDays === 2) {
          toast.error(`🚨 ${scholarship.name} deadline in 2 days!`, {
            duration: 8000,
          });
        } else if (targetDays === 0) {
          toast.error(
            `🔴 FINAL DAY: ${scholarship.name} application deadline is TODAY!`,
            {
              duration: 10000,
            },
          );
        }
      }
    }
  }, []);

  return null;
}
