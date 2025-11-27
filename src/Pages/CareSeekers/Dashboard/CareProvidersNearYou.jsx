import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./../Dashboard/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { fetchProviders } from "../../../Redux/CareProviderNearYou";
// Subscription gating removed: buttons always active

function CareProvidersNearYou() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { providers, loading, error } = useSelector(
    (s) =>
      s.careProviderNearYou || { providers: [], loading: false, error: null }
  );

  // No frontend gating by subscription: all actions are active

  useEffect(() => {
    dispatch(fetchProviders());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sfpro">
      <Sidebar active="Care Providers" />
      <div className="flex-1 font-sfpro px-4 md:px-8 py-8 md:ml-64">
        {/* Main Content (Blurred when signup popup is active) */}
        <div
        // className={`font-sfpro w-full bg-white min-h-screen transition ${
        //   showSignupPopup ? "blur-sm pointer-events-none" : ""
        // }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-8 pt-8">
            <h2 className="text-3xl font-semibold text-gray-800">
              Care Providers near you
            </h2>
            {/* <div className="flex items-center">
              <span className="text-lg text-[#0093d1] font-bold">Step 8</span>
              <span className="ml-2 text-lg text-gray-500"> of 8</span>
            </div> */}
          </div>

          {/* Cards Grid */}
          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              {loading && (
                <div className="col-span-2 text-sm text-gray-500">
                  Loading providers…
                </div>
              )}
              {error && (
                <div className="col-span-2 text-sm text-red-600">
                  {error.error || "Failed to load providers"}
                </div>
              )}
              {!loading &&
                !error &&
                providers.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition"
                  >
                    <div className="flex items-center mb-4">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          p.user?.full_name || "Provider"
                        )}&background=E5E7EB&color=374151&size=64`}
                        alt="Provider"
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mr-4 object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">
                          {p.user?.full_name || p.profile_title || "Provider"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {p.city || p.country || ""}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-4 leading-snug">
                      {p.profile_title || ""}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 border border-gray-200 rounded-lg overflow-hidden mb-4">
                      <div className="p-2 text-center border-b sm:border-b-0 sm:border-r border-gray-200">
                        <div className="text-xs text-gray-500">Experience</div>
                        <div className="font-semibold text-sm text-gray-700">
                          {p.years_of_experience ?? 0} years
                        </div>
                      </div>
                      <div className="p-2 text-center border-b sm:border-b-0 sm:border-r border-gray-200">
                        <div className="text-xs text-gray-500">Rate</div>
                        <div className="font-semibold text-sm text-gray-700">
                          ${p.hourly_rate ?? p.hourly_rate}
                        </div>
                      </div>
                      <div className="p-2 text-center">
                        <div className="text-xs text-gray-500">Rating</div>
                        <div className="flex items-center justify-center">
                          <span className="text-yellow-400 text-base">
                            {Array(Math.round(p.average_rating || 0))
                              .fill("★")
                              .join("") || "★"}
                          </span>
                          <span className="text-xs text-gray-600 ml-1">
                            {(p.average_rating ?? 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        className="w-full sm:flex-1 bg-[#0093d1] text-white py-2 rounded-md font-medium hover:bg-[#007bb0] transition"
                        onClick={() =>
                          navigate(
                            "/careseekers/dashboard/message_provider/" +
                              (p?.user?.id || p?.id)
                          )
                        }
                      >
                        Message
                      </button>
                      <button
                        className="w-full sm:flex-1 border border-[#0093d1] text-[#0093d1] py-2 rounded-md font-medium hover:bg-[#f0fbf9] transition"
                        onClick={() =>
                          navigate(
                            `/careseekers/dashboard/details/${
                              p?.user?.id || p?.id
                            }`
                          )
                        }
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareProvidersNearYou;
