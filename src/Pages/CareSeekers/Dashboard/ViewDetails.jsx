import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import {
  fetchProviderDetails,
  clearProviderDetails,
} from "../../../Redux/ProvidersDetails";
import { BASE_URL } from "../../../Redux/config";
import {
  formatCurrencyAmount,
  getUserCurrencyInfo,
} from "../../../utils/countryHelper";

function ViewDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const defaultCurrency = getUserCurrencyInfo();

  // Check plan from localStorage
  const plan =
    typeof window !== "undefined"
      ? localStorage.getItem("careProviderPlan")
      : null;
  const dispatch = useDispatch();
  const { details, loading, error } = useSelector(
    (s) => s.providersDetails || { details: null, loading: false, error: null },
  );

  // Get current user from Auth context or Redux
  const currentUser = useSelector((s) =>
    s.auth?.user || s.user?.profile || localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : {},
  );

  const resolveImage = (url) => {
    if (!url)
      return "https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151&size=64";
    if (url.startsWith("http") || url.startsWith("https")) return url;
    if (url.startsWith("/")) return `${BASE_URL}${url}`;
    return url;
  };

  useEffect(() => {
    const id = location?.state?.providerId || params?.id;
    if (!id) return;
    dispatch(fetchProviderDetails(id));

    return () => {
      dispatch(clearProviderDetails());
    };
  }, [dispatch, location, params]);

  const providerId = location?.state?.providerId || params?.id;

  const handleMessageClick = () => {
    proceedToMessage();
  };

  const proceedToMessage = () => {
    try {
      const otherId =
        details?.user?.id ||
        details?.user?.pk ||
        details?.user?.user_id ||
        details?.user?.uid ||
        details?.id;
      navigate(`/careseekers/dashboard/message/${otherId}`);
    } catch (err) {
      console.error("Failed to navigate to message page", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sfpro">
      <Sidebar active="Home" />
      <div className="flex-1 font-sfpro px-3 sm:px-6 md:px-8 py-4 sm:py-8 md:ml-64 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center mb-6 sm:mb-8">
          <button
            className="mr-3 sm:mr-4 text-gray-500 hover:text-gray-700 text-xl sm:text-2xl font-bold"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Details
          </h2>
        </div>

        {!providerId && (
          <div className="py-12 text-center">
            <h2 className="text-lg font-semibold text-gray-800">Profile unavailable</h2>
            <p className="mt-2 text-sm text-gray-500">This provider link is incomplete.</p>
          </div>
        )}
        {providerId && loading && <div className="py-8">Loading provider details…</div>}
        {error && (
          <div className="text-red-500 py-4">
            Failed to load provider:{" "}
            {typeof error === "string"
              ? error
              : error?.error || error?.message || "Unknown"}
          </div>
        )}

        {details && (
          <>
            {/* Profile */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <img
                src={resolveImage(details?.user?.profile_image_url)}
                alt="Provider"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full sm:flex-shrink-0 object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-base sm:text-lg line-clamp-2">
                  {details?.user?.full_name || details?.title}
                </h4>
                <p className="text-sm sm:text-base text-gray-500 mt-1 mb-2 line-clamp-1">
                  {[details?.city, details?.state, details?.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                  {details?.summary}
                </p>
              </div>
            </div>

            {/* Experience/Rate/Rating */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg px-3 sm:px-6 py-2 sm:py-3 flex flex-col items-center">
                <span className="text-xs text-gray-500 text-center">
                  Experience
                </span>
                <span className="font-semibold text-gray-800 text-sm sm:text-lg mt-1">
                  {details?.years_of_experience ?? "N/A"}
                </span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-3 sm:px-6 py-2 sm:py-3 flex flex-col items-center">
                <span className="text-xs text-gray-500 text-center">Rate</span>
                <span className="font-semibold text-gray-800 text-sm sm:text-lg mt-1 line-clamp-1">
                  {details?.hourly_rate
                    ? formatCurrencyAmount(
                        details.localized_hourly_rate ?? details.hourly_rate,
                        details.display_currency_code ||
                          defaultCurrency.currencyCode,
                        details.display_currency_symbol ||
                          defaultCurrency.currencySymbol,
                      )
                    : "N/A"}
                </span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-3 sm:px-6 py-2 sm:py-3 flex flex-col items-center">
                <span className="text-xs text-gray-500 text-center">
                  Rating
                </span>
                <div className="flex flex-col items-center mt-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < Math.round(details?.average_rating || 0)
                            ? "text-[#cb9e49] text-xs sm:text-sm"
                            : "text-gray-300 text-xs sm:text-sm"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600 font-bold mt-1">
                    {details?.average_rating ?? "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Dedicated Childcare Provider */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2 text-base sm:text-lg">
                {details?.title || "Provider"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-700">
                {details?.summary}
              </p>
            </div>

            {/* Testimonials */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-base sm:text-lg">
                Testimonials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {Array.isArray(details?.testimonials) &&
                details.testimonials.length > 0 ? (
                  details.testimonials.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col"
                    >
                      <p className="text-xs sm:text-sm text-gray-700 mb-2 line-clamp-3">
                        {t.comment}
                      </p>
                      <div className="flex items-center mt-auto pt-2">
                        <img
                          src={resolveImage(t.reviewer?.profile_image_url)}
                          alt={t.reviewer?.full_name}
                          className="w-8 h-8 rounded-full mr-2 sm:mr-3 object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-gray-700 line-clamp-1">
                            {t.reviewer?.full_name || "Anonymous"}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1">
                            {t.reviewer?.id ? `User #${t.reviewer.id}` : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs sm:text-sm text-gray-600">
                    No testimonials yet.
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {Array.isArray(details?.skills) && details.skills.length > 0 && (
              <div className="mb-6 dark: text-black">
                <h3 className="font-semibold text-gray-800 mb-3 text-base sm:text-lg">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {details.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs sm:text-sm bg-white border border-gray-200 rounded-full px-3 py-1"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              className={`w-full bg-[#0093d1] text-white py-2.5 sm:py-3 rounded-md font-semibold text-base sm:text-lg transition ${
                plan !== "Free" ||
                (location.state && location.state.messageable)
                  ? "hover:bg-[#007bb0]"
                  : "hover:bg-[#0093d1] opacity-50 cursor-not-allowed"
              }`}
              disabled={
                plan === "Free" &&
                !(location.state && location.state.messageable)
              }
              onClick={handleMessageClick}
            >
              Message
            </button>
            {plan === "Free" && !(location.state && location.state.messageable) && (
              <p className="mt-2 text-center text-sm text-gray-500">
                Messaging becomes available after this provider applies to your request.
              </p>
            )}

          </>
        )}
      </div>
    </div>
  );
}

export default ViewDetails;
