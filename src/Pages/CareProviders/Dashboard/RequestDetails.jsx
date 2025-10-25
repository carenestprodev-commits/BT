import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRequestById,
  postReview,
} from "../../../Redux/CareProviderRequest";
import { BASE_URL } from "../../../Redux/config";

function RequestDetails() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current } = useSelector(
    (s) => s.careProviderRequests || { current: null }
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchRequestById({ id, status: "closed" }));
  }, [id, dispatch]);

  const resolveImage = (url) => {
    if (!url)
      return "https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151&size=64";
    if (url.startsWith("http") || url.startsWith("https")) return url;
    if (url.startsWith("/")) return `${BASE_URL}${url}`;
    return url;
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar active="Requests" />
      <div className="flex-1 font-sfpro px-4 md:px-8 py-8 md:ml-64">
        <button
          className="mb-8 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={() => navigate(-1)}
        >
          ←
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">Details</h2>
        <div className="flex items-center mb-6">
          <img
            src={
              current && current.seeker
                ? resolveImage(current.seeker.profile_image_url)
                : "https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151&size=64"
            }
            alt={current && current.seeker ? current.seeker.full_name : "User"}
            className="w-16 h-16 rounded-full object-cover mr-6"
          />
          <div>
            <div className="text-xl font-semibold text-gray-800">
              {current
                ? current.seeker
                  ? current.seeker.full_name
                  : current.job_title || ""
                : "Loading..."}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {current ? current.date_range_for_task || "" : ""}
            </div>
          </div>
        </div>
        <div className="flex gap-6 mb-8">
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start min-w-[120px]">
            <span className="text-gray-500 text-xs mb-1">Experience</span>
            <span className="text-gray-800 font-semibold text-lg">8 years</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start min-w-[120px]">
            <span className="text-gray-500 text-xs mb-1">Rate</span>
            <span className="text-gray-800 font-semibold text-lg">$135/hr</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start min-w-[120px]">
            <span className="text-gray-500 text-xs mb-1">Rating</span>
            <span className="text-gray-800 font-semibold text-lg flex items-center gap-2">
              5.0{" "}
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar key={i} className="text-[#cb9e49] text-base" />
              ))}
            </span>
          </div>
        </div>
        <div className="mb-8">
          <div className="text-gray-700 font-medium mb-2">
            Message to Care Provider
          </div>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white text-gray-800 min-h-[100px] resize-none mb-2"
            placeholder="Input feedback of your time with care provider"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="focus:outline-none -mt-20 ml-5"
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
        <div className="mb-8">
          <div className="text-gray-700 font-medium mb-2">Request details</div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 text-gray-700 text-base">
            <div className="mb-2">
              <strong>Title:</strong> {current ? current.job_title || "" : ""}
            </div>
            <div className="mb-2">
              <strong>Location:</strong>{" "}
              {current ? current.seeker_location || "" : ""}
            </div>
            <div className="mb-2">
              <strong>Seeker since:</strong>{" "}
              {current ? current.seeker_join_date || "" : ""}
            </div>
            <div className="mb-2">
              <strong>Task date range:</strong>{" "}
              {current ? current.date_range_for_task || "" : ""}
            </div>
            <div className="mb-2">
              <strong>Average rating:</strong>{" "}
              {current ? current.seeker_average_rating || "" : ""}
            </div>
            <div className="mb-2">
              <strong>Rate per hour:</strong>{" "}
              {current
                ? current.rate_per_hour
                  ? `$${current.rate_per_hour}`
                  : ""
                : ""}
            </div>
            <div className="mb-2">
              <strong>Review from seeker:</strong>{" "}
              {current ? current.review_from_seeker || "No review" : ""}
            </div>
          </div>
        </div>
        <button
          className="w-full bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition disabled:opacity-50"
          disabled={submitting}
          onClick={async () => {
            const booking_id = current?.id || current?.booking_id || Number(id);
            const ratingValue = rating;
            const comment = feedback;
            if (!booking_id) {
              alert("Missing booking id");
              return;
            }
            setSubmitting(true);
            try {
              const res = await dispatch(
                postReview({ booking_id, rating: ratingValue, comment })
              );
              if (res && res.payload && res.payload.message) {
                alert(res.payload.message);
                // clear inputs and navigate to requests list
                setFeedback("");
                setRating(0);
                navigate("/careproviders/dashboard/requests");
                return;
              } else if (res && res.error && res.error.message) {
                alert(res.error.message);
              } else {
                alert("Submitted");
                setFeedback("");
                setRating(0);
                navigate("/careproviders/dashboard/requests");
                return;
              }
            } catch (err) {
              console.error(err);
              alert("Submit failed");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default RequestDetails;
