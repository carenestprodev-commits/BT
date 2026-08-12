import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchActiveRequestById,
} from "../../../Redux/CareProviderRequest";
import { BASE_URL } from "../../../Redux/config";
import { formatDisplayName } from "../../../utils/formatDisplayName";

/**
 * ActiveDetails — provider view of a single ACTIVE booking.
 * Shows seeker info, activity timing, and the provider's end code.
 * The review form only appears in RequestDetails (closed bookings).
 */
function ActiveDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentActive } = useSelector(
    (s) =>
      s.careProviderRequests || {
        currentActive: null,
      },
  );

  useEffect(() => {
    if (id) dispatch(fetchActiveRequestById(id));
  }, [id, dispatch]);

  const resolveImage = (url) => {
    if (!url)
      return `https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151&size=64`;
    if (url.startsWith("http") || url.startsWith("https")) return url;
    if (url.startsWith("/")) return `${BASE_URL}${url}`;
    return url;
  };

  const seeker = currentActive?.seeker;
  const seekerName = seeker?.full_name
    ? formatDisplayName(seeker.full_name)
    : "Care Seeker";
  const seekerImage = resolveImage(seeker?.profile_image_url);

  const formatTime = (t) => {
    if (!t) return "—";
    try {
      if (t.includes(":")) {
        const [hh, mm] = t.split(":");
        const h = Number(hh);
        const suffix = h >= 12 ? "PM" : "AM";
        return `${h % 12 || 12}:${mm} ${suffix}`;
      }
      return new Date(t).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return t;
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  const formatActivityMoment = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  };

  const isInProgress = currentActive?.is_activity_in_progress ?? true;
  const hasEnded = currentActive?.has_ended_activity ?? false;
  const activeScheduledActivity = currentActive?.scheduled_activities?.find(
    (activity) => activity.status === "in_progress",
  );
  const activityCode =
    currentActive?.provider_end_code || activeScheduledActivity?.end_code;

  return (
    <div className="flex min-h-screen bg-white font-sfpro">
      <Sidebar active="Requests" />
      <div className="flex-1 md:ml-64">
        {/* Sticky header */}
        <div className="sticky top-[57px] md:top-0 z-30 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <button
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ←
          </button>
          <h2 className="text-lg font-normal text-gray-500">Active Booking</h2>
          {/* Activity status pill */}
          {isInProgress && !hasEnded && (
            <span className="ml-auto flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Session Running
            </span>
          )}
          {hasEnded && !isInProgress && (
            <span className="ml-auto flex items-center gap-1.5 bg-amber-50 text-amber-600 text-xs font-semibold px-3 py-1 rounded-full">
              ⏳ Awaiting Payment
            </span>
          )}
        </div>

        <div className="px-6 py-6 md:px-8 max-w-2xl">
          {!currentActive && (
            <p className="text-sm text-gray-400 animate-pulse">Loading…</p>
          )}

          {currentActive && (
            <>
              {/* Seeker card */}
              <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <img
                  src={seekerImage}
                  alt={seekerName}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Care Seeker</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {seekerName}
                  </p>
                  {currentActive.job_details?.title && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {currentActive.job_details.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Session info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <InfoCard label="Date" value={formatDate(currentActive.date)} />
                <InfoCard
                  label="Start time"
                  value={formatTime(currentActive.start_time)}
                />
                <InfoCard
                  label="End time"
                  value={
                    currentActive.end_time
                      ? formatTime(currentActive.end_time)
                      : isInProgress
                        ? "In progress"
                        : "—"
                  }
                  highlight={!currentActive.end_time && isInProgress}
                />
              </div>

              {currentActive.scheduled_activities?.length > 0 && (
                <section className="mb-8">
                  <p className="text-sm font-medium text-gray-700 mb-2">Activity schedule</p>
                  <div className="space-y-2">
                    {currentActive.scheduled_activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {activity.source === "extra" ? "Extra activity" : "Scheduled activity"}
                          </p>
                          <p className="mt-1 text-gray-500">
                            Scheduled: {formatActivityMoment(activity.scheduled_start_at)} — {formatActivityMoment(activity.scheduled_end_at)}
                          </p>
                          <p className="text-gray-500">
                            Actual: {formatActivityMoment(activity.actual_start_time)} — {formatActivityMoment(activity.actual_end_time)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium capitalize text-gray-700">{activity.status || "scheduled"}</p>
                          <p className="text-xs text-gray-500">Overtime: {activity.overtime_hours || "0.00"}h</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Job summary */}
              {currentActive.job_details?.summary && (
                <div className="mb-8">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Job summary
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                    {currentActive.job_details.summary}
                  </p>
                </div>
              )}

              {isInProgress && !hasEnded && activityCode && (
                <div className="mb-6 rounded-xl bg-blue-50 p-5 text-center">
                  <p className="text-sm font-medium text-blue-700">Activity end code</p>
                  <p className="mt-2 text-4xl font-bold tracking-[0.35em] text-blue-900">{activityCode}</p>
                  <p className="mt-2 text-xs text-blue-700">Give this code to the care seeker when you agree to end the activity.</p>
                </div>
              )}

              {/* Awaiting payment note — session already ended */}
              {hasEnded && !isInProgress && (
                <div className="w-full py-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium text-center">
                  ⏳ Activity ended — the seeker can use the code to review and pay
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, highlight = false }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p
        className={`text-sm font-semibold ${highlight ? "text-blue-600" : "text-gray-800"}`}
      >
        {value}
      </p>
    </div>
  );
}

export default ActiveDetails;
