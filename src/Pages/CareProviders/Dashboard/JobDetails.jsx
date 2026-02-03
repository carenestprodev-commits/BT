/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import { AiOutlineCheckCircle } from "react-icons/ai";
import VerificationCheckModal from "../../../Components/VerificationCheckModal";
import {
  fetchJobById,
  clearSelectedJob,
  submitBooking,
} from "../../../Redux/JobsFeed";
import avatar_user from "../../../../public/avatar_user.png";

function JobDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const {
    selectedJob: job,
    loading,
    error,
    bookingLoading,
    bookingError,
  } = useSelector(
    (s) =>
      s.jobsFeed || {
        selectedJob: null,
        loading: false,
        error: null,
        bookingLoading: false,
        bookingError: null,
      },
  );

  // Get current user info from Redux store
  // Adjust the selector based on your actual Redux state structure
  const currentUser = useSelector((s) => s.auth?.user || s.user?.profile || {});

  console.log("JobDetails - currentUser:", currentUser);
  console.log(
    "JobDetails - currentUser.is_verified:",
    currentUser?.is_verified,
  );
  console.log("JobDetails - selectedJob from Redux:", job);

  useEffect(() => {
    const jobFromState = location?.state?.job;
    const jobId = location?.state?.jobId || jobFromState?.id;
    console.log(
      "JobDetails useEffect - jobId:",
      jobId,
      "jobFromState:",
      jobFromState,
    );
    if (jobFromState) {
      dispatch(clearSelectedJob());
      dispatch(fetchJobById(jobFromState.id));
    } else if (jobId) {
      dispatch(fetchJobById(jobId));
    }

    return () => {
      dispatch(clearSelectedJob());
    };
  }, [dispatch, location]);

  // Extract skills and expertise from job details or API response
  const getSkillsAndExpertise = () => {
    // If API provides skills_and_expertise array, use it directly
    if (job?.skills_and_expertise && Array.isArray(job.skills_and_expertise)) {
      return job.skills_and_expertise;
    }

    // Otherwise, parse from details object (fallback for other API responses)
    const skills = [];
    const details = job?.details;

    if (!details) return skills;

    // Provider experience skills
    const providerExp = details.provider_experience;
    if (providerExp) {
      if (providerExp.sleep_in) skills.push("sleep-in");
      if (providerExp.non_smoker) skills.push("Non-smoker");
      if (providerExp.experience_with_twins)
        skills.push("Experience with twins");
      if (providerExp.help_with_homework) skills.push("help with homework");
      if (providerExp.sign_language) skills.push("Sign language");
      if (providerExp.special_needs_experience)
        skills.push("Special needs experience");
      if (providerExp.cook_basic_meals) skills.push("cook basic meals");
      if (providerExp.experience_with_speech_delay)
        skills.push("Experience with speech delay");
      if (providerExp.live_in) skills.push("live-in");
      if (providerExp.behavioral_support) skills.push("Behavioral support");
      if (providerExp.experience_with_autism)
        skills.push("Experience with autism");

      // Languages
      if (Array.isArray(providerExp.languages)) {
        providerExp.languages.forEach((lang) => {
          skills.push(`Speaks ${lang} Fluently`);
        });
      }
    }

    // Additional skills from other fields
    if (details.additional_skills && Array.isArray(details.additional_skills)) {
      skills.push(...details.additional_skills);
    }

    return skills;
  };

  const handleApplyClick = () => {
    // Check if user is verified
    if (!currentUser?.is_verified) {
      setShowVerificationModal(true);
      return;
    }

    // If verified, proceed directly to submit application
    handleSubmitApplication();
  };

  const handleSubmitApplication = async () => {
    if (!job?.id) return;

    try {
      const resAction = await dispatch(submitBooking(job.id));
      if (submitBooking.fulfilled.match(resAction)) {
        const payload = resAction.payload || {};
        alert(payload.message || "Application submitted");
        navigate("/careproviders/dashboard/requests", {
          state: { tab: 2 },
        });
      } else {
        const payload = resAction.payload || resAction.error;
        alert(
          (payload && (payload.error || payload.message)) ||
            "Failed to submit application",
        );
      }
    } catch {
      alert("Failed to submit application");
    }
  };

  const handleVerificationProceed = () => {
    // After user completes verification and returns, submit the application
    handleSubmitApplication();
  };

  const handleVerificationCancel = () => {
    setShowVerificationModal(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sfpro">
      <Sidebar active="Home" />
      <div className="flex-1 font-sfpro md:ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <button
            className="text-gray-600 hover:text-gray-800 text-xl sm:text-2xl font-semibold flex items-center gap-2"
            onClick={() => window.history.back()}
          >
            ← <span className="text-lg sm:text-xl">Details</span>
          </button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {loading && (
            <div className="text-gray-500 text-center py-8">
              Loading job details…
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              Failed to load job: {error.error || error?.message || "Unknown"}
            </div>
          )}

          {job && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              {/* Job Poster Info */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <img
                  src={job.poster_avatar || avatar_user}
                  alt="Job poster"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-800 text-base sm:text-lg">
                      {job.seeker_name || job.poster_name || "User"}
                    </span>
                    {job.is_verified && (
                      <RiVerifiedBadgeFill className="text-blue-500 text-sm sm:text-base" />
                    )}
                  </div>
                </div>
              </div>

              {/* Job Title */}
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                {job.title}
              </h1>

              {/* Posted Time */}
              <div className="text-gray-400 text-xs sm:text-sm mb-6">
                {job.posted_ago || "Just now"}
              </div>

              {/* Job Description */}
              <div className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 whitespace-pre-line">
                {job.summary || job.description || "No description provided"}
              </div>

              {/* Skills and Expertise Section */}
              {(job.skills_and_expertise?.length > 0 ||
                getSkillsAndExpertise().length > 0) && (
                <div className="mb-8">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                    Skills and expertise
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(job.skills_and_expertise?.length > 0
                      ? job.skills_and_expertise
                      : getSkillsAndExpertise()
                    ).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full border border-gray-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {/* Location */}
                {job.details?.location_information && (
                  <div>
                    <div className="text-gray-800 font-semibold mb-2 text-sm sm:text-base">
                      Location
                    </div>
                    <div className="text-gray-600 text-sm">
                      {[
                        job.details.location_information.city,
                        job.details.location_information.state,
                        job.details.location_information.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                )}

                {/* Service Category */}
                {job.service_category && (
                  <div>
                    <div className="text-gray-800 font-semibold mb-2 text-sm sm:text-base">
                      Service category
                    </div>
                    <div className="text-gray-600 text-sm">
                      {job.service_category}
                    </div>
                  </div>
                )}

                {/* Job Type */}
                {job.job_type && (
                  <div>
                    <div className="text-gray-800 font-semibold mb-2 text-sm sm:text-base">
                      Job type
                    </div>
                    <div className="text-gray-600 text-sm">
                      {job.job_type}
                      {job.start_date && ` · starts ${job.start_date}`}
                    </div>
                  </div>
                )}

                {/* Budget */}
                {job.budget_display && (
                  <div>
                    <div className="text-gray-800 font-semibold mb-2 text-sm sm:text-base">
                      Budget
                    </div>
                    <div className="text-gray-600 text-sm">
                      {job.budget_display}
                    </div>
                  </div>
                )}
              </div>

              {/* Apply Now Button */}
              <button
                className={`w-full bg-[#0093d1] text-white py-3.5 sm:py-4 rounded-lg font-semibold text-sm sm:text-base hover:bg-[#007bb0] transition-colors shadow-sm ${
                  bookingLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleApplyClick}
                disabled={bookingLoading}
              >
                {bookingLoading ? "Applying…" : "Apply Now"}
              </button>

              {bookingError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                  {bookingError.error ||
                    bookingError?.message ||
                    "Failed to submit application"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Verification Check Modal */}
      <VerificationCheckModal
        isOpen={showVerificationModal}
        user={currentUser}
        userType="provider"
        actionType="apply"
        onProceed={handleVerificationProceed}
        onCancel={handleVerificationCancel}
        isLoading={bookingLoading}
      />
    </div>
  );
}

export default JobDetails;
