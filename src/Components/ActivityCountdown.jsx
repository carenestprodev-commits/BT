import { useEffect, useState } from "react";

const formatRemaining = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export default function ActivityCountdown({ endAt }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!endAt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [endAt]);

  if (!endAt) return null;
  const remaining = new Date(endAt).getTime() - now;
  const ended = remaining <= 0;

  return (
    <div className="mx-3 mt-3 rounded-lg bg-[#eaf7fc] px-4 py-2 text-sm font-semibold text-[#0d7fa8] sm:mx-4 md:mx-8">
      {ended
        ? "Scheduled time ended. Additional time is billable."
        : `Activity time remaining: ${formatRemaining(remaining)}`}
    </div>
  );
}
