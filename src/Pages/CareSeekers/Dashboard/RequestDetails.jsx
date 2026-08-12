/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSeekerRequestDetails,
  submitReview,
  clearCurrentRequest,
} from "../../../Redux/SeekerRequest";
import { BASE_URL } from "../../../Redux/config";
import { DetailRows } from "../../../Components/CareRequestSections";
import {
  formatCurrencyAmount,
  getUserCurrencyInfo,
} from "../../../utils/countryHelper";

function RequestDetails() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const dispatch = useDispatch();
  const { currentRequest, submit } = useSelector(
    (s) => s.seekerRequests || { currentRequest: null, submit: {} },
  );
  const params = useParams();
  const routeId = params?.id || params?.requestId || params?.bookingId;
  const scheduledActivities = currentRequest?.scheduled_activities || [];

  const formatActivityMoment = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  };

  const userCurrency = getUserCurrencyInfo();

  useEffect(() => {
    if (routeId) dispatch(fetchSeekerRequestDetails(routeId));
    return () => dispatch(clearCurrentRequest());
  }, [dispatch, routeId]);

  useEffect(() => {
    if (submit && submit.response) {
      alert(`Review submitted: ${JSON.stringify(submit.response)}`);
      navigate("/careseekers/dashboard/requests");
    } else if (submit && submit.error) {
      alert(
        `Failed to submit review: ${
          typeof submit.error === "string"
            ? submit.error
            : submit.error?.error ||
              submit.error?.message ||
              JSON.stringify(submit.error)
        }`,
      );
    }
  }, [submit, navigate]);

  return (
    <div className="flex min-h-screen bg-white font-sfpro">
      <Sidebar active="Requests" />

      <div className="flex-1 font-sfpro px-6 pt-24 pb-8 md:pt-8 md:px-8 md:ml-64">
        {!routeId && (
          <div className="mb-4 text-sm text-red-600">Missing request id.</div>
        )}
        {/* Back arrow + page title in one row so both are always visible */}
        <div className="flex items-center gap-3 mb-8">
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ←
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Details</h2>
        </div>

        {/* Provider avatar + name */}
        <div className="flex items-center mb-6">
          <img
            src={
              currentRequest?.provider?.user?.profile_image_url
                ? currentRequest.provider.user.profile_image_url.startsWith("/")
                  ? `${BASE_URL}${currentRequest.provider.user.profile_image_url}`
                  : currentRequest.provider.user.profile_image_url
                : "https://ui-avatars.com/api/?name=Provider&background=E5E7EB&color=374151&size=64"
            }
            alt={currentRequest?.provider?.user?.full_name || "Provider"}
            className="w-16 h-16 rounded-full object-cover mr-6"
          />
          <div>
            <div className="text-xl font-semibold text-gray-800">
              {currentRequest?.provider?.user?.full_name ||
                currentRequest?.job_title ||
                "Provider"}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {currentRequest?.hired_at
                ? `${new Date(currentRequest.hired_at).toLocaleDateString()} - ${
                    currentRequest?.completed_at
                      ? new Date(
                          currentRequest.completed_at,
                        ).toLocaleDateString()
                      : "Ongoing"
                  }`
                : ""}
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start min-w-[100px]">
            <span className="text-gray-500 text-xs mb-1">Experience</span>
            <span className="text-gray-800 font-semibold text-lg">
              {currentRequest?.provider?.years_of_experience ?? "N/A"}
            </span>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start min-w-[100px]">
            <span className="text-gray-500 text-xs mb-1">Rate</span>
            <span className="text-gray-800 font-semibold text-lg">
              {currentRequest?.provider?.hourly_rate
                ? formatCurrencyAmount(
                    currentRequest.provider.localized_hourly_rate ??
                      currentRequest.provider.hourly_rate,
                    currentRequest.provider.display_currency_code ??
                      userCurrency.currencyCode,
                    currentRequest.provider.display_currency_symbol ??
                      userCurrency.currencySymbol,
                  )
                : "N/A"}
            </span>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start min-w-[100px]">
            <span className="text-gray-500 text-xs mb-1">Rating</span>
            <span className="text-gray-800 font-semibold text-lg flex items-center gap-1">
              {currentRequest?.provider?.average_rating ?? "N/A"}{" "}
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar
                  key={i}
                  className={
                    i <
                    Math.round(currentRequest?.provider?.average_rating ?? 0)
                      ? "text-[#cb9e49] text-base"
                      : "text-gray-300 text-base"
                  }
                />
              ))}
            </span>
          </div>
        </div>

        {/* Provider Details */}
        <div className="mb-6">
          <div className="text-gray-700 font-medium mb-2">Provider Details</div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 text-gray-700 text-base space-y-1">
            <div>
              <strong>Profile Title:</strong>{" "}
              {currentRequest?.provider?.profile_title}
            </div>
            <div>
              <strong>City:</strong> {currentRequest?.provider?.city}
            </div>
            <div>
              <strong>Country:</strong> {currentRequest?.provider?.country}
            </div>
            <div>
              <strong>Service Category:</strong>{" "}
              {currentRequest?.provider?.service_category_name}
            </div>
          </div>
        </div>

        {scheduledActivities.length > 0 && (
          <section className="mb-8">
            <div className="text-gray-700 font-medium mb-2">Activity schedule</div>
            <div className="space-y-2">
              {scheduledActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {activity.source === "extra" ? "Extra activity" : "Scheduled activity"}
                    </div>
                    <div className="mt-1 text-gray-500">
                      Scheduled: {formatActivityMoment(activity.scheduled_start_at)} — {formatActivityMoment(activity.scheduled_end_at)}
                    </div>
                    <div className="text-gray-500">
                      Actual: {formatActivityMoment(activity.actual_start_time)} — {formatActivityMoment(activity.actual_end_time)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium capitalize text-gray-700">{activity.status || "scheduled"}</div>
                    <div className="text-xs text-gray-500">
                      Overtime: {activity.overtime_hours || "0.00"}h
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <DetailRows
          title="Job Summary"
          rows={[currentRequest?.summary || currentRequest?.job?.summary || ""]}
        />
        <DetailRows
          title="Feedback from Provider"
          rows={[
            currentRequest?.review_from_provider?.comment ||
              currentRequest?.provider_review?.comment ||
              currentRequest?.review?.comment ||
              "No feedback submitted yet",
          ]}
        />

        {/* Feedback textarea + star rating */}
        <div className="mb-8">
          <div className="text-gray-700 font-medium mb-2">
            Message to Care Provider
          </div>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white text-gray-800 min-h-[100px] resize-none mb-3 dark:bg-white dark:text-black"
            placeholder="Input feedback of your time with care provider"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          {/* Stars sit naturally below the textarea — no negative margin */}
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="focus:outline-none"
              >
                <FaStar
                  className={
                    i < rating
                      ? "text-[#cb9e49] text-xl"
                      : "text-gray-300 text-xl"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons — side by side on BOTH mobile and desktop */}
        <div className="flex gap-3">
          <button
            className="flex-1 border border-[#0d99c9] text-[#0d99c9] py-3 rounded-md font-semibold hover:bg-[#f0faff] transition"
            onClick={() => navigate(-1)}
          >
            Edit
          </button>
          <button
            className="flex-1 bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition"
            onClick={() => {
              const booking_id = currentRequest?.id || routeId;
              if (!feedback.trim() || !rating) {
                alert("Please add a rating and feedback before submitting.");
                return;
              }
              dispatch(submitReview({ booking_id, rating, comment: feedback }));
            }}
          >
            {submit?.loading ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestDetails;
