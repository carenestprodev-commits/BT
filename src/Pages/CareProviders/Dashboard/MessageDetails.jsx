/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaStar } from "react-icons/fa";
import { fetchConversations } from "../../../Redux/Messenger";
import { BASE_URL, getAuthHeaders } from "../../../Redux/config";

const resolveImage = (url) => {
  if (!url)
    return "https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151&size=64";
  if (url.startsWith("http") || url.startsWith("https")) return url;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return url;
};

function MessageDetails() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();

  // Try to get a conversation/booking ID from the URL (e.g. /message/details/:id)
  const conversationParamId = params?.id;

  const { conversations } = useSelector((state) => state.messenger);

  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Load conversations so we can pull real data
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Find the relevant conversation — by URL param, or fall back to most recent
  const currentConversation = useMemo(
    () =>
      conversationParamId
        ? conversations.find(
            (c) =>
              String(c.id) === String(conversationParamId) ||
              String(c.booking) === String(conversationParamId) ||
              String(c.booking_id) === String(conversationParamId),
          ) || conversations[0]
        : conversations[0],
    // ✅ Only recompute when the conversation list length changes or param ID changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversations.length, conversationParamId],
  );

  // Pull real data from conversation where available, fall back to placeholders
  const seekerName =
    currentConversation?.other_participant?.full_name ||
    currentConversation?.other_participant?.email ||
    "Care Seeker";

  const seekerAvatar = resolveImage(
    currentConversation?.other_participant?.profile_image_url,
  );

  const bookingId =
    currentConversation?.booking ||
    currentConversation?.booking_id ||
    currentConversation?.id;

  // Format date range from booking if available
  const startDate = currentConversation?.start_date
    ? new Date(currentConversation.start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const endDate = currentConversation?.end_date
    ? new Date(currentConversation.end_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const dateRange =
    startDate && endDate
      ? `${startDate} – ${endDate}`
      : startDate || "Date not available";

  const hourlyRate = currentConversation?.hourly_rate
    ? `$${currentConversation.hourly_rate}/hr`
    : "Rate not set";

  // Submit feedback + rating to the backend
  const handleSubmit = async () => {
    if (!rating) {
      setSubmitError("Please select a star rating before submitting.");
      return;
    }
    if (!feedback.trim()) {
      setSubmitError("Please write a message before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // POST feedback to the review/rating endpoint
      // Adjust the endpoint path to match your actual API
      const endpoint = bookingId
        ? `${BASE_URL}/api/bookings/${bookingId}/review/`
        : `${BASE_URL}/api/reviews/`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: feedback.trim(),
          booking: bookingId || undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        // Try to extract a clean error message
        try {
          const json = JSON.parse(text);
          throw new Error(
            json.detail || json.message || json.error || "Submission failed.",
          );
        } catch {
          if (text.includes("<html") || text.includes("<!doctype")) {
            throw new Error("Server error. Please try again later.");
          }
          throw new Error(text || "Submission failed.");
        }
      }

      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitSuccess) {
    return (
      <div className="flex min-h-screen bg-white font-sfpro">
        <Sidebar active="Message" />
        <div className="flex-1 font-sfpro px-4 md:px-8 py-8 md:ml-64 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg width="32" height="32" fill="#10b981" viewBox="0 0 24 24">
                  <path d="M20.285 6.709l-11.285 11.285-5.285-5.285 1.415-1.415 3.87 3.87 9.87-9.87z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Feedback Submitted!
            </h2>
            <p className="text-gray-500 mb-6">
              Thank you for sharing your experience with {seekerName}.
            </p>
            <button
              className="w-full bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition"
              onClick={() => navigate("/careproviders/dashboard/message")}
            >
              Back to Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main screen ───────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-white font-sfpro">
      <Sidebar active="Message" />
      <div className="flex-1 font-sfpro px-4 md:px-8 py-8 md:ml-64">
        <button
          className="mb-8 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={() => navigate("/careproviders/dashboard/message")}
          aria-label="Back to messages"
        >
          ←
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-8">Details</h2>

        {/* Care Seeker info */}
        <div className="flex items-center mb-6">
          <img
            src={seekerAvatar}
            alt={seekerName}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mr-4 sm:mr-6"
          />
          <div>
            <div className="text-xl font-semibold text-gray-800">
              {seekerName}
            </div>
            {dateRange && (
              <div className="text-gray-500 text-sm mt-1">{dateRange}</div>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {currentConversation?.experience_years && (
            <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start shadow-sm">
              <span className="text-gray-500 text-xs mb-1">Experience</span>
              <span className="text-gray-800 font-semibold text-lg">
                {currentConversation.experience_years} years
              </span>
            </div>
          )}
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start shadow-sm">
            <span className="text-gray-500 text-xs mb-1">Rate</span>
            <span className="text-gray-800 font-semibold text-lg">
              {hourlyRate}
            </span>
          </div>
          {currentConversation?.seeker_rating && (
            <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start shadow-sm">
              <span className="text-gray-500 text-xs mb-1">Seeker Rating</span>
              <span className="text-gray-800 font-semibold text-lg flex items-center gap-2">
                {currentConversation.seeker_rating}
                <FaStar className="text-[#cb9e49] text-base" />
              </span>
            </div>
          )}
        </div>

        {/* Feedback form */}
        <div className="mb-8">
          <div className="text-gray-700 font-medium mb-2">
            Leave Feedback for {seekerName}
          </div>

          {/* Star rating */}
          <div className="flex gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="focus:outline-none focus:ring-2 focus:ring-[#0d99c9] rounded"
                aria-label={`Rate ${i + 1} star${i + 1 !== 1 ? "s" : ""}`}
              >
                <FaStar
                  className={
                    i < rating
                      ? "text-[#cb9e49] text-2xl transition-colors"
                      : "text-gray-300 text-2xl transition-colors hover:text-[#cb9e49]"
                  }
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-500 self-center">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
              </span>
            )}
          </div>

          <textarea
            className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white text-gray-800 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-[#0d99c9] focus:border-[#0d99c9] transition"
            placeholder={`Share your experience working with ${seekerName}...`}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            aria-label="Feedback message"
          />
        </div>

        {/* Previous testimonial if available */}
        {currentConversation?.testimonial && (
          <div className="mb-8">
            <div className="text-gray-700 font-medium mb-2">
              Previous Testimonial
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg px-6 py-4 text-gray-700 text-base">
              {currentConversation.testimonial}
            </div>
          </div>
        )}

        {/* Error banner */}
        {submitError && (
          <div
            className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded text-red-700 text-sm"
            role="alert"
          >
            {submitError}
          </div>
        )}

        {/* Submit */}
        <button
          className="w-full bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={handleSubmit}
          disabled={submitting}
          aria-label="Submit feedback"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Feedback"
          )}
        </button>
      </div>
    </div>
  );
}

export default MessageDetails;
