import { formatDisplayName } from "../utils/formatDisplayName";

export const formatDateShort = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const formatTimeRange = (start, end) => {
  const format = (value) => {
    if (!value) return "";
    if (typeof value === "string" && value.includes(":")) {
      const [hours, minutes] = value.split(":");
      return `${hours}:${minutes}`;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const startLabel = format(start);
  const endLabel = format(end);
  return startLabel && endLabel
    ? `${startLabel} - ${endLabel}`
    : startLabel || endLabel;
};

export const avatarFromName = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=E5E7EB&color=374151&size=64`;

export const providerImage = (provider) =>
  provider?.image_url ||
  provider?.imageUrl ||
  provider?.provider_image_url ||
  provider?.user?.profile_image_url ||
  provider?.user?.image_url ||
  "";

export const normalizeApplications = (applications) =>
  (Array.isArray(applications) ? applications : []).map((item) => ({
    ...item,
    id: item.id || item.booking_id,
    providerUserId:
      item.provider_user_id ||
      item.providerUserId ||
      item.provider?.user?.id ||
      item.provider?.id,
    providerName:
      item.provider_name ||
      item.providerName ||
      item.provider?.user?.full_name ||
      item.provider?.full_name ||
      "Care Provider",
    providerImageUrl:
      item.provider_image_url ||
      item.providerImageUrl ||
      providerImage(item.provider),
    isVerified: Boolean(item.is_verified ?? item.provider?.is_verified),
    isEngaged: Boolean(item.is_engaged ?? item.provider?.user?.is_engaged),
    createdAt: item.created_at || item.createdAt || "",
  }));

export function projectSeekerActiveRequest(item) {
  const providerName = item.provider?.user?.full_name || "Provider";
  return {
    ...item,
    day: formatDateShort(item.date || item.created_at),
    date: item.date
      ? new Date(item.date).getDate()
      : item.created_at
        ? new Date(item.created_at).getDate()
        : "",
    title: item.title || item.job_title || item.job?.title || "",
    time: formatTimeRange(
      item.start_time || item.hired_at,
      item.end_time || item.completed_at,
    ),
    providerName,
    providerImageUrl:
      providerImage(item.provider) || avatarFromName(providerName),
    isInProgress: Boolean(item.is_activity_in_progress),
    hasEnded: Boolean(item.has_ended_activity),
  };
}

export function projectSeekerClosedRequest(item) {
  const providerName =
    item.provider?.user?.full_name || item.title || "Provider";
  return {
    ...item,
    name: providerName,
    dateRange:
      item.hired_at || item.completed_at
        ? `${formatDateShort(item.hired_at)} - ${formatDateShort(item.completed_at)}`
        : item.posted_ago || item.posted || "",
    rating: Math.round(
      item.provider?.average_rating ?? item.review?.rating ?? 0,
    ),
    review: item.review?.text || item.provider?.about_me || item.summary || "",
    avatar: providerImage(item.provider) || avatarFromName(providerName),
    reviewFromProvider: item.review_from_provider || item.provider_review,
    completedAt: item.completed_at,
  };
}

export function projectSeekerPendingRequest(item) {
  return {
    ...item,
    posted: item.posted_ago || item.posted || "Posted just now",
    title: item.title || item.summary || "",
    desc: item.summary || item.message_to_provider || "",
    applications: normalizeApplications(item.applications),
    applicationCount:
      item.application_count ||
      item.applications_count ||
      item.total_applications ||
      (Array.isArray(item.applications) ? item.applications.length : 0),
  };
}

export function projectProviderRequest(item) {
  const seekerName = formatDisplayName(item.seeker?.full_name) || "Care seeker";
  return {
    ...item,
    seekerName,
    seekerImageUrl: item.seeker?.profile_image_url || "",
    requestTitle: item.job_details?.title || item.title || "Untitled request",
    requestSummary:
      item.job_details?.summary || item.summary || item.review || "",
    dateLabel: item.date
      ? new Date(item.date).toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      : "Date not specified",
    timeLabel: formatTimeRange(item.start_time, item.end_time),
    postedLabel:
      item.job_details?.posted_ago ||
      (item.created_at
        ? `Posted ${new Date(item.created_at).toLocaleString()}`
        : ""),
  };
}

export const projectProviderRequests = (payload) =>
  Array.isArray(payload) ? payload.map(projectProviderRequest) : [];
