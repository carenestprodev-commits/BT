import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchActiveRequestById,
  stopActivity,
  fetchActiveRequests,
} from "../../../Redux/CareProviderRequest";
import { BASE_URL } from "../../../Redux/config";
import { formatDisplayName } from "../../../utils/formatDisplayName";

/**
 * ActiveDetails — provider view of a single ACTIVE booking.
 * Shows seeker info, activity timing, and the End Activity button.
 * The review form only appears in RequestDetails (closed bookings).
 */
function ActiveDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentActive, stoppingActivity, stopActivityError } = useSelector(
    (s) =>
      s.careProviderRequests || {
        currentActive: null,
        stoppingActivity: false,
        stopActivityError: null,
      },
  );
  const [stopError, setStopError] = useState(null);
  const [stopSuccess, setStopSuccess] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchActiveRequestById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (stopActivityError) {
      const msg =
        typeof stopActivityError === "string"
          ? stopActivityError
          : stopActivityError?.detail ||
            stopActivityError?.message ||
            JSON.stringify(stopActivityError);
      setStopError(msg);
    }
  }, [stopActivityError]);

  const resolveImage = (url) => {
    if (!url)
      return `https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151&size=64`;
    if (url.startsWith("http") || url.startsWith("https")) return url;
    if (url.startsWith("/")) return `${BASE_URL}${url}`;
    return url;
  };

  const handleEndActivity = async () => {
    setStopError(null);
    const bookingId = currentActive?.id || Number(id);
    if (!bookingId) return setStopError("Missing booking ID.");
    const res = await dispatch(stopActivity(bookingId));
    if (res.error) return; // error handled via stopActivityError above
    setStopSuccess(true);
    // Refresh the active list and navigate back after a short delay
    dispatch(fetchActiveRequests());
    setTimeout(() => navigate("/careproviders/dashboard/requests"), 1800);
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

  const isInProgress = currentActive?.is_activity_in_progress ?? true;
  const hasEnded = currentActive?.has_ended_activity ?? false;

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

              {/* Success banner */}
              {stopSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm font-medium text-center">
                  ✅ Activity ended successfully. Redirecting…
                </div>
              )}

              {/* Error banner */}
              {stopError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
                  <p className="font-semibold mb-1">Could not end activity</p>
                  <p>{stopError}</p>
                  <button
                    className="mt-2 text-xs underline text-red-500"
                    onClick={() => setStopError(null)}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* End Activity button — only shown while session is running */}
              {isInProgress && !hasEnded && !stopSuccess && (
                <button
                  onClick={handleEndActivity}
                  disabled={stoppingActivity}
                  className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 shadow-sm ${
                    stoppingActivity
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 active:scale-[0.98]"
                  }`}
                >
                  {stoppingActivity ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                        />
                      </svg>
                      Ending activity…
                    </span>
                  ) : (
                    "End Activity"
                  )}
                </button>
              )}

              {/* Awaiting payment note — session already ended */}
              {hasEnded && !isInProgress && (
                <div className="w-full py-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium text-center">
                  ⏳ Activity ended — awaiting seeker payment
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
