/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { FiSearch } from "react-icons/fi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { HiOutlineBell } from "react-icons/hi";
import { MdFilterList } from "react-icons/md";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobsFeed } from "../../../Redux/JobsFeed";
import avatar_user from "../../../../public/avatar_user.png";
import { useAppNotifications } from "../../../hooks/useAppNotifications.js";
import { useJobFeedSearch } from "../../../hooks/useJobFeedSearch";

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { jobs, loading, error } = useSelector(
    (s) => s.jobsFeed || { jobs: [], loading: false, error: null },
  );

  console.log("HomePage - Redux jobs state:", { jobs, loading, error });

  const authUser = useSelector((s) =>
    s.auth && s.auth.user ? s.auth.user : null,
  );

  const displayName =
    authUser?.full_name ||
    (() => {
      try {
        const u = localStorage.getItem("user");
        return u ? JSON.parse(u).full_name : "Mark";
      } catch {
        return "Mark";
      }
    })();

  const { search, setSearch } = useJobFeedSearch();
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Nearest");
  const [filterBy, setFilterBy] = useState("All");
  const [verifiedFilter, setVerifiedFilter] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useAppNotifications((data) => {
    setNotifications((prev) => [{ ...data, read: false }, ...prev]);
  });

  const handleClearAll = () => {
    setSearch("");
    setSortBy("Nearest");
    setFilterBy("All");
    setVerifiedFilter(false);
    setSortDropdownOpen(false);
    setFilterDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownOpen && !event.target.closest(".relative")) {
        setSortDropdownOpen(false);
      }
      if (filterDropdownOpen && !event.target.closest(".relative")) {
        setFilterDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [sortDropdownOpen, filterDropdownOpen]);

  useEffect(() => {
    dispatch(fetchJobsFeed());
  }, [dispatch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(fetchJobsFeed({ search }));
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, dispatch]);

  let filteredJobs = Array.isArray(jobs)
    ? jobs.filter(
        (job) =>
          (job.title || "").toLowerCase().includes(search.toLowerCase()) ||
          (job.summary_short || "")
            .toLowerCase()
            .includes(search.toLowerCase()),
      )
    : [];

  // Apply filterBy logic
  if (filterBy === "Verified") {
    filteredJobs = filteredJobs.filter((job) => job.verified === true);
  } else if (filterBy === "Earliest") {
    filteredJobs = filteredJobs.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at),
    );
  } else if (filterBy === "Oldest") {
    filteredJobs = filteredJobs.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sfpro">
      <Sidebar active="Home" />
      <div className="flex-1 font-sfpro md:ml-64">
        {/* Responsive Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
            {/* Top Row: Greeting & Notification */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center">
                {authUser?.is_verified && (
                  <RiVerifiedBadgeFill className="text-green-400 mr-2 text-2xl hidden md:block" />
                )}
                <h2 className="text-2xl font-medium text-gray-800">
                  Hello, {displayName}!
                </h2>
              </div>
              {/* 🔔 Notification Bell */}
              <button className="relative p-2 text-gray-600 hover:text-gray-800">
                <HiOutlineBell className="text-2xl" />

                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[8px] h-2 px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Only: Subtitle */}
            <div className="mb-4 md:hidden">
              <p className="text-sm text-gray-600">
                Everything you need to find and manage care, in one place.
              </p>
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder={
                    window.innerWidth < 768
                      ? "Search tutor, caregivers, housekeepers..."
                      : "Q. Search for amount"
                  }
                  className="w-full pl-12 pr-4 py-3.5 md:py-3 rounded-xl md:rounded-lg border border-gray-300 md:border-gray-200 bg-white text-gray-700 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Desktop: Filter Controls */}
              <div className="hidden md:flex items-center gap-3">
                {/* Active Filter Tag */}
                {filterBy !== "All" && (
                  <div className="flex items-center bg-white border border-gray-300 text-gray-800 px-4 py-2.5 rounded-lg text-sm">
                    {filterBy}
                    <button
                      className="ml-2 text-gray-600 hover:text-gray-800"
                      onClick={() => setFilterBy("All")}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Clear Button */}
                <button
                  className="px-4 py-2.5 text-white text-sm font-medium rounded-lg transition"
                  style={{ backgroundColor: "#0E2F43" }}
                  onClick={handleClearAll}
                >
                  Clear
                </button>

                {/* Desktop Sort Dropdown */}
                <div className="relative">
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  >
                    Sort by:
                    <span className="font-medium">{sortBy}</span>
                    <span className="text-gray-400">▼</span>
                  </button>

                  {sortDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      {["None", "Nearest", "Farthest", "Relevance"].map(
                        (option) => (
                          <button
                            key={option}
                            className={`w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 text-sm ${
                              sortBy === option ? "bg-gray-50" : ""
                            }`}
                            onClick={() => {
                              setSortBy(option);
                              setSortDropdownOpen(false);
                            }}
                          >
                            {option}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>

                {/* Filter Icon with Dropdown */}
                <div className="relative">
                  <button
                    className="p-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-[#0D99C9]"
                    style={{ backgroundColor: "#0E2F43" }}
                    onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                  >
                    <MdFilterList className="text-xl text-white" />
                  </button>

                  {filterDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="px-4 py-2 text-xs text-gray-500 font-medium border-b border-gray-100">
                        Filter by:
                      </div>
                      {["All", "Verified", "Earliest", "Oldest"].map(
                        (option) => (
                          <button
                            key={option}
                            className={`w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 text-sm ${
                              filterBy === option ? "bg-gray-50" : ""
                            }`}
                            onClick={() => {
                              setFilterBy(option);
                              setFilterDropdownOpen(false);
                            }}
                          >
                            {option}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile: Filter Controls */}
              <div className="flex items-center justify-between md:hidden">
                {/* Left side - Sort and Filter buttons */}
                <div className="flex items-center space-x-3">
                  {/* Sort by dropdown */}
                  <div className="relative">
                    <button
                      className="flex items-center px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50"
                      onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    >
                      Sort by: {sortBy} ▼
                    </button>

                    {sortDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        {["None", "Nearest", "Farthest", "Relevance"].map(
                          (option) => (
                            <button
                              key={option}
                              className={`w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 text-sm ${
                                sortBy === option ? "bg-gray-50" : ""
                              }`}
                              onClick={() => {
                                setSortBy(option);
                                setSortDropdownOpen(false);
                              }}
                            >
                              {option}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* Filter dropdown */}
                  <div className="relative">
                    <button
                      className="p-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50"
                      onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                    >
                      <MdFilterList className="text-xl" />
                    </button>

                    {filterDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="px-4 py-2 text-xs text-gray-500 font-medium border-b border-gray-100">
                          Filter by:
                        </div>
                        {["All", "Verified", "Earliest", "Oldest"].map(
                          (option) => (
                            <button
                              key={option}
                              className={`w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 text-sm ${
                                filterBy === option ? "bg-gray-50" : ""
                              }`}
                              onClick={() => {
                                setFilterBy(option);
                                setFilterDropdownOpen(false);
                              }}
                            >
                              {option}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mobile Verified Filter Tag */}
                  {filterBy === "Verified" && (
                    <div className="flex items-center bg-teal-100 text-teal-800 px-3 py-1.5 rounded-lg text-sm">
                      Verified
                      <button
                        className="ml-1.5 text-teal-600 hover:text-teal-800"
                        onClick={() => setFilterBy("All")}
                      >
                        ✗
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Clear Button */}
                <button
                  className="text-teal-600 text-sm font-medium hover:text-teal-700 px-3 py-2.5"
                  onClick={handleClearAll}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {loading && (
            <div className="p-6 text-sm text-gray-500">Loading jobs…</div>
          )}
          {error && (
            <div className="p-6 text-sm text-red-600">
              {error.error || "Failed to load jobs"}
            </div>
          )}

          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <button
                key={job.id}
                className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 md:p-6 transition hover:shadow-md hover:border-gray-300 focus:outline-none"
                onClick={() =>
                  navigate("/careproviders/dashboard/job_details", {
                    state: { jobId: job.id, job },
                  })
                }
              >
                {/* Mobile Layout - Original Design */}
                <div className="md:hidden">
                  {/* Header Row - Avatar, Name, Time */}
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={avatar_user}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-800 text-sm">
                          {job.seeker_name || job.poster_name || "User"}
                        </span>
                        <RiVerifiedBadgeFill className="text-blue-500 text-xs flex-shrink-0" />
                      </div>
                      <span className="text-gray-400 text-xs">
                        Posted {job.posted_ago || "Just now"}
                      </span>
                    </div>
                  </div>

                  {/* Job Title */}
                  <h3 className="font-semibold text-base text-gray-800 mb-2 leading-snug">
                    {job.title}
                  </h3>

                  {/* Job Description */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">
                    {job.summary_short}
                  </p>

                  {/* Budget - Bottom with border (Mobile) */}
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-teal-700 text-sm font-semibold">
                      Budget -{" "}
                      {job.budget_display ||
                        job.budget ||
                        "Contact for details"}
                    </span>
                  </div>
                </div>

                {/* Desktop Layout - New Design */}
                <div className="hidden md:block">
                  {/* Header Row - Avatar, Name, Verification and Budget */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={avatar_user}
                        alt="avatar"
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-900 text-base">
                            {job.seeker_name || job.poster_name || "User"}
                          </span>
                          <RiVerifiedBadgeFill className="text-blue-500 text-sm flex-shrink-0" />
                        </div>
                        <span className="text-gray-400 text-xs mt-0.5">
                          Posted {job.posted_ago || "Just now"}
                        </span>
                      </div>
                    </div>

                    {/* Budget - Top Right (Desktop Only) */}
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className="text-gray-900 text-base font-medium">
                        Budget -{" "}
                        {job.budget_display ||
                          job.budget ||
                          "Contact for details"}
                      </span>
                    </div>
                  </div>

                  {/* Job Title */}
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 leading-snug">
                    {job.title}
                  </h3>

                  {/* Job Description */}
                  <p className="text-gray-500 text-base leading-relaxed">
                    {job.summary_short}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
