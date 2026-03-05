/* eslint-disable no-unused-vars */
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./../Dashboard/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { fetchProviders } from "../../../Redux/CareProviderNearYou";
import VerificationCheckModal from "../../../Components/VerificationCheckModal";
import { AuthContext } from "../../../Context/AuthContext";

function CareProvidersNearYou() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  const { providers, loading, error } = useSelector(
    (s) =>
      s.careProviderNearYou || { providers: [], loading: false, error: null },
  );

  // Helper function to get category title based on service category
  const getCategoryTitle = () => {
    // Try to get service_category from various sources
    const serviceCategory =
      user?.service_category ||
      user?.care_category ||
      user?.job_data?.service_category ||
      localStorage.getItem("seeker_care_category") ||
      localStorage.getItem("service_category");

    const categoryMap = {
      childcare: "Child Care Providers Near You",
      "childcare ": "Child Care Providers Near You",
      "elderly care": "Adult & Senior Care Providers Near You",
      elderlycare: "Adult & Senior Care Providers Near You",
      elderly: "Adult & Senior Care Providers Near You",
      tutoring: "Tutors near you",
      housekeeping: "Housekeepers near you",
      "house keeping": "Housekeepers near you",
    };

    const normalizedCategory = serviceCategory?.toLowerCase().trim() || "";
    return categoryMap[normalizedCategory] || "Care Providers near you";
  };

  useEffect(() => {
    dispatch(fetchProviders());
  }, [dispatch]);

  const handleMessageClick = (providerId) => {
    if (!user?.is_verified) {
      setSelectedProviderId(providerId);
      setShowVerificationModal(true);
    } else {
      navigate("/careseekers/dashboard/message_provider/" + providerId);
    }
  };

  const handleVerificationProceed = () => setShowVerificationModal(false);
  const handleVerificationCancel = () => {
    setShowVerificationModal(false);
    setSelectedProviderId(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sfpro">
      <Sidebar active="Care Providers" />
      <div className="flex-1 font-sfpro px-4 md:px-8 py-8 md:ml-64">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center px-4 md:px-8 pt-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
              {getCategoryTitle()}
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="px-4 md:px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {loading && (
                <div className="text-sm text-gray-500">Loading providers…</div>
              )}
              {error && (
                <div className="text-sm text-red-600">
                  {error.error || "Failed to load"}
                </div>
              )}

              {!loading &&
                !error &&
                providers.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition relative"
                  >
                    {/* Top Profile Section */}
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.user?.full_name || "Provider")}&background=E5E7EB&color=374151&size=100`}
                        alt="Provider"
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 pr-6">
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-gray-800 text-lg">
                            {p.user?.full_name || "Provider"}
                          </h4>
                          {/* Verified Badge Icon */}
                          <svg
                            className="w-5 h-5 text-[#0093d1]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">
                          {p.city}, {p.country}{" "}
                          <span className="text-gray-300 ml-1">
                            (45 mins from location)
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2 leading-tight">
                          {p.profile_title || "No description provided."}
                        </p>
                      </div>
                      {/* Optional: Design Menu Icon if needed */}
                    </div>

                    {/* Stats Grid - Fixed 3 columns on mobile */}
                    <div className="grid grid-cols-3 border border-gray-100 rounded-xl mb-5 bg-gray-50/30">
                      <div className="p-3 text-left border-r border-gray-100">
                        <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                          Experience
                        </div>
                        <div className="font-bold text-sm text-gray-700">
                          {p.years_of_experience ?? 0} years
                        </div>
                      </div>
                      <div className="p-3 text-left border-r border-gray-100">
                        <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                          Rate
                        </div>
                        <div className="font-bold text-sm text-gray-700">
                          ₦{p.hourly_rate ?? 0}/hr
                        </div>
                      </div>
                      <div className="p-3 text-left">
                        <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                          Rating
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-sm text-gray-700">
                            {(p.average_rating ?? 0).toFixed(1)}
                          </span>
                          <div className="flex text-yellow-400 text-xs">
                            {"★★★★★".split("").map((s, i) => (
                              <span
                                key={i}
                                className={
                                  i < Math.round(p.average_rating || 0)
                                    ? "opacity-100"
                                    : "opacity-30"
                                }
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <button
                        className="flex-1 bg-[#0093d1] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#007bb0] transition"
                        onClick={() => handleMessageClick(p?.user?.id || p?.id)}
                      >
                        Message
                      </button>
                      <button
                        className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition"
                        onClick={() =>
                          navigate(
                            `/careseekers/dashboard/details/${p?.user?.id || p?.id}`,
                          )
                        }
                      >
                        View details
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <VerificationCheckModal
        isOpen={showVerificationModal}
        user={user}
        userType="seeker"
        actionType="message"
        onProceed={handleVerificationProceed}
        onCancel={handleVerificationCancel}
      />
    </div>
  );
}

export default CareProvidersNearYou;
