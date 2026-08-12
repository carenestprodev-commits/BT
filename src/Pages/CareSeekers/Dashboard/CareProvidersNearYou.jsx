import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./../Dashboard/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { fetchProviders } from "../../../Redux/CareProviderNearYou";
import { AuthContext } from "../../../Context/AuthContext";
import {
  formatCurrencyAmount,
  getUserCurrencyInfo,
} from "../../../utils/countryHelper";
import { formatDisplayName } from "../../../utils/formatDisplayName";
import { resolveImage } from "../../../Components/CareRequestSections";
import ImageLightbox from "../../../Components/ImageLightbox";
import { Search, SlidersHorizontal } from "lucide-react";

function CareProvidersNearYou() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const defaultCurrency = getUserCurrencyInfo();
  const [filters, setFilters] = useState({
    search: "",
    serviceCategory: null,
    radiusKm: null,
    minExperience: null,
    maxExperience: null,
    minRating: null,
    verified: false,
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSection, setFilterSection] = useState(null);

  const { providers, loading, error } = useSelector(
    (s) =>
      s.careProviderNearYou || { providers: [], loading: false, error: null },
  );

  const getServiceCategory = () =>
    user?.service_category ||
    user?.care_category ||
    user?.job_data?.service_category ||
    localStorage.getItem("seeker_care_category") ||
    localStorage.getItem("service_category");

  // Helper function to get category title based on service category
  const getCategoryTitle = () => {
    const serviceCategory = getServiceCategory();

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

  const effectiveServiceCategory =
    filters.serviceCategory === null
      ? getServiceCategory()
      : filters.serviceCategory;
  const normalizedEffectiveServiceCategory =
    effectiveServiceCategory?.toLowerCase().trim().replace(/\s+/g, "");
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchProviders({
          ...filters,
          serviceCategory: effectiveServiceCategory,
        }),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, filters, effectiveServiceCategory]);

  const handleMessageClick = (providerId) => {
    navigate("/careseekers/dashboard/message_provider/" + providerId);
  };
  const updateFilter = (patch) =>
    setFilters((current) => ({ ...current, ...patch }));
  const clearFilters = () =>
    setFilters({
      search: "",
      serviceCategory: null,
      radiusKm: null,
      minExperience: null,
      maxExperience: null,
      minRating: null,
      verified: false,
    });
  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.serviceCategory !== null ||
    filters.radiusKm !== null ||
    filters.minExperience !== null ||
    filters.maxExperience !== null ||
    filters.minRating !== null ||
    filters.verified;

  const categoryLabels = {
    childcare: "Childcare",
    elderlycare: "Adult/Senior care",
    tutoring: "Tutoring",
    housekeeping: "Housekeeping",
  };
  const serviceLabel =
    filters.serviceCategory === ""
      ? "All care services"
      : categoryLabels[normalizedEffectiveServiceCategory] || "All care services";

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
          <div className="relative px-4 md:px-8 pt-6">
            <div className="flex max-w-3xl gap-3">
              <label className="relative block flex-1">
                <span className="sr-only">Search care providers</span>
                <Search className="pointer-events-none absolute inset-y-0 left-4 my-auto text-gray-500" size={22} />
                <input
                  type="search"
                  value={filters.search}
                  onChange={(event) => updateFilter({ search: event.target.value })}
                  placeholder="Search"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 outline-none focus:border-[#0093d1] focus:ring-2 focus:ring-[#0093d1]/15"
                />
              </label>
              <button
                type="button"
                aria-label="Open provider filters"
                onClick={() => {
                  setFilterOpen((open) => !open);
                  setFilterSection(null);
                }}
                className={`rounded-xl border px-4 text-gray-700 transition ${
                  hasActiveFilters
                    ? "border-[#0093d1] text-[#0093d1]"
                    : "border-gray-200 bg-white"
                }`}
              >
                <SlidersHorizontal aria-hidden="true" size={22} />
              </button>
            </div>
            {filterOpen && (
              <div className="absolute right-4 top-[calc(100%+8px)] z-30 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl md:right-8">
                {filterSection ? (
                  <div>
                    <button
                      type="button"
                      className="mb-3 text-sm font-semibold text-[#0093d1]"
                      onClick={() => setFilterSection(null)}
                    >
                      ← Filter by
                    </button>
                    {filterSection === "service" && (
                      <div className="space-y-1">
                        {[
                          ["childcare", "Childcare"],
                          ["elderlycare", "Adult/Senior care"],
                          ["tutoring", "Tutoring"],
                          ["housekeeping", "Housekeeping"],
                        ].map(([value, label]) => (
                          <button
                            key={label}
                            type="button"
                            className="flex w-full items-center justify-between border-b border-gray-100 py-3 text-left text-sm"
                            onClick={() => {
                              updateFilter({ serviceCategory: value });
                              setFilterSection(null);
                            }}
                          >
                            {label}
                            {serviceLabel === label && <span>✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                    {filterSection === "location" && (
                      <div className="space-y-1">
                        {[
                          [1, "Near me"],
                          [5, "Within 5km"],
                          [10, "Within 10km"],
                        ].map(([value, label]) => (
                          <button
                            key={label}
                            type="button"
                            className="block w-full border-b border-gray-100 py-3 text-left text-sm"
                            onClick={() => {
                              updateFilter({ radiusKm: value });
                              setFilterSection(null);
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                    {filterSection === "experience" && (
                      <div className="space-y-1">
                        {[
                          [1, 2, "1–2 years"],
                          [3, 5, "3–5 years"],
                          [6, 10, "6–10 years"],
                          [10, null, "10+ years"],
                        ].map(([min, max, label]) => (
                          <button
                            key={label}
                            type="button"
                            className="block w-full border-b border-gray-100 py-3 text-left text-sm"
                            onClick={() => {
                              updateFilter({ minExperience: min, maxExperience: max });
                              setFilterSection(null);
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                    {filterSection === "rating" && (
                      <div className="space-y-1">
                        {[4.5, 4, 3.5, 3].map((value) => (
                          <button
                            key={value ?? "any"}
                            type="button"
                            className="block w-full border-b border-gray-100 py-3 text-left text-sm"
                            onClick={() => {
                              updateFilter({ minRating: value });
                              setFilterSection(null);
                            }}
                          >
                            {`${value.toFixed(1)} & above`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-3">
                      <h3 className="text-xl font-medium text-gray-800">Filter by</h3>
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#0093d1]"
                        onClick={clearFilters}
                      >
                        Clear all
                      </button>
                    </div>
                    {[
                      ["service", "Care services"],
                      ["location", "Location"],
                      ["experience", "Experience"],
                      ["rating", "Rating"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        className="flex w-full items-center justify-between border-b border-gray-100 py-3 text-left text-sm text-gray-700"
                        onClick={() => setFilterSection(key)}
                      >
                        <span>{label}</span>
                        <span aria-hidden="true">›</span>
                      </button>
                    ))}
                    <label className="flex cursor-pointer items-center gap-2 py-4 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={filters.verified}
                        onChange={(event) => updateFilter({ verified: event.target.checked })}
                        className="h-4 w-4 accent-[#0093d1]"
                      />
                      Verified providers
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cards Grid */}
          <div className="px-4 md:px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {loading && (
                <div className="text-sm text-gray-500">Loading providers…</div>
              )}
              {error && (
                <div className="text-sm text-red-600">
                  <p>{error.error || "Failed to load providers."}</p>
                  <button
                    className="mt-2 text-[#0093d1] font-semibold"
                    onClick={() =>
                      dispatch(
                        fetchProviders({
                          ...filters,
                          serviceCategory: effectiveServiceCategory,
                        }),
                      )
                    }
                  >
                    Retry
                  </button>
                </div>
              )}
              {!loading && !error && providers.length === 0 && (
                <div className="text-sm text-gray-500">
                  {hasActiveFilters
                    ? "No providers match your search or filters."
                    : "No matched providers yet. Check back soon or adjust your request."}
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
                      <ImageLightbox
                        src={resolveImage(p.user?.profile_image_url, p.user?.full_name)}
                        alt={p.user?.full_name || "Provider"}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 pr-6">
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-gray-800 text-lg">
                            {formatDisplayName(p.user?.full_name) || "Provider"}
                          </h4>
                          {p.is_verified && (
                            <svg
                              className="w-5 h-5 text-[#0093d1]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-label="Verified provider"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-1">
                          {[p.city, p.country].filter(Boolean).join(", ") ||
                            "Location not listed"}
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
                          {formatCurrencyAmount(
                            p.localized_hourly_rate ?? p.hourly_rate ?? 0,
                            p.display_currency_code || defaultCurrency.currencyCode,
                            p.display_currency_symbol || defaultCurrency.currencySymbol,
                          )}
                          /hr
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
    </div>
  );
}

export default CareProvidersNearYou;
