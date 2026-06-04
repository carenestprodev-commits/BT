import React from "react";
import { BASE_URL } from "../Redux/config";

export const asList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

export const humanize = (value) =>
  String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const resolveImage = (url, name = "User", size = 64) => {
  if (!url) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E5E7EB&color=374151&size=${size}`;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return url;
};

export function GeneratedSummaryReview({
  summary,
  onSummaryChange,
  children,
}) {
  return (
    <>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">
        <p className="text-sm text-green-800">
          This was generated from your request details. Review it before
          publishing so care providers understand your preferences.
        </p>
      </div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Request summary
      </label>
      <textarea
        rows={5}
        className="w-full p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-800 mb-5"
        value={summary}
        onChange={(event) => onSummaryChange(event.target.value)}
      />
      {children}
    </>
  );
}

export function ChipPanel({ label, values, emptyText = "Not specified" }) {
  const items = asList(values);
  if (!items.length) return null;
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 border border-gray-200"
          >
            {item || emptyText}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DetailRows({ title, rows }) {
  const safeRows = (rows || []).filter(Boolean);
  if (!safeRows.length) return null;
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="rounded-lg border border-gray-100 bg-white p-4 text-sm text-gray-600 space-y-2">
        {safeRows.map((row) => (
          <div key={row}>{row}</div>
        ))}
      </div>
    </div>
  );
}

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join(", ");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, val]) => {
        const formatted = formatValue(val);
        return formatted ? `${humanize(key)}: ${formatted}` : "";
      })
      .filter(Boolean)
      .join("; ");
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

export function requestDetailSections(request) {
  const details = request?.job_data?.details || request?.details || {};
  const requirements = details.provider_experience_requirements || {};
  const schedule = request?.job_data?.schedule || request?.schedule || {};
  const budget = request?.job_data?.budget || request?.budget || {};
  const location = details.location_information || {};
  const categoryDetails = Object.entries(details).filter(
    ([key]) => key !== "provider_experience_requirements" && key !== "location_information",
  );

  return {
    requirements,
    careRows: categoryDetails.flatMap(([key, value]) =>
      Object.entries(value || {})
        .map(([field, val]) => {
          const formatted = formatValue(val);
          return formatted ? `${humanize(field)}: ${formatted}` : "";
        })
        .filter(Boolean)
        .map((row) => `${humanize(key)} - ${row}`),
    ),
    scheduleRows: [
      schedule.job_type ? `Job type: ${humanize(schedule.job_type)}` : "",
      schedule.start_date ? `Start date: ${schedule.start_date}` : "",
      schedule.end_date ? `End date: ${schedule.end_date}` : "",
      schedule.start_time ? `Start time: ${schedule.start_time}` : "",
      schedule.end_time ? `End time: ${schedule.end_time}` : "",
      budget.price_min || budget.price_max
        ? `Budget: ${[budget.price_min, budget.price_max].filter(Boolean).join(" - ")}`
        : "",
    ],
    locationRows: [
      [location.city, location.state, location.country].filter(Boolean).join(", "),
      location.preferred_language ? `Preferred language: ${location.preferred_language}` : "",
    ],
  };
}

export function ApplicantsAvatarStack({ applications = [] }) {
  const shown = applications.slice(0, 5);
  const extra = Math.max(applications.length - shown.length, 0);
  if (!shown.length) return null;
  return (
    <div className="flex -space-x-2">
      {shown.map((application) => (
        <img
          key={application.id || application.provider_name}
          src={resolveImage(
            application.provider_image_url || application.providerImageUrl,
            application.provider_name || application.providerName || "Provider",
            48,
          )}
          alt={application.provider_name || application.providerName || "Provider"}
          className="h-8 w-8 rounded-full border-2 border-white object-cover"
        />
      ))}
      {extra > 0 && (
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-semibold text-gray-700">
          +{extra}
        </span>
      )}
    </div>
  );
}
