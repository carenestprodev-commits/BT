const fullNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const shortSymbols = ["S", "M", "T", "W", "T", "F", "S"];

export const normalizeRepeatDays = (days = []) =>
  days.map((day) => {
    if (!day) return day;
    if (fullNames.includes(day)) return day;
    const index = shortSymbols.indexOf(day);
    return index === -1 ? day : fullNames[index];
  });

export const buildSchedulePayload = ({
  scheduleType,
  startDate,
  endDate,
  repeatEvery,
  repeatFrequency,
  repeatDays,
  startTime,
  endTime,
}) => {
  const isOneOff = String(scheduleType || "")
    .trim()
    .toLowerCase() === "one-off";

  return {
    job_type: isOneOff ? "one_off" : "recurring",
    start_date: startDate || "",
    end_date: isOneOff ? null : endDate || null,
    start_time: startTime || "",
    end_time: endTime || "",
    recurrence_pattern: isOneOff
      ? {}
      : {
          interval: parseInt(repeatEvery || "1", 10),
          frequency: String(repeatFrequency || "Weekly").toLowerCase(),
          days: normalizeRepeatDays(repeatDays),
        },
  };
};
