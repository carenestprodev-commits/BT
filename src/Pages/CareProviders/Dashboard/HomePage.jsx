import { FiSearch } from "react-icons/fi";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import BudgetFilter from "../../../../public/budget_filter.svg";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobsFeed } from "../../../Redux/JobsFeed";

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { jobs, loading, error } = useSelector(
    (s) => s.jobsFeed || { jobs: [], loading: false, error: null }
  );
  // get authenticated user from redux (falls back to localStorage)
  const authUser = useSelector((s) =>
    s.auth && s.auth.user ? s.auth.user : null
  );
  const displayName =
    authUser?.full_name ||
    (() => {
      try {
        const u = localStorage.getItem("user");
        return u ? JSON.parse(u).full_name : "User";
      } catch {
        return "User";
      }
    })();
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState(null); // 'asc' or 'desc'

  useEffect(() => {
    dispatch(fetchJobsFeed());
  }, [dispatch]);

  // Filter and sort jobs
  let filteredJobs = Array.isArray(jobs)
    ? jobs.filter(
        (job) =>
          (job.title || "").toLowerCase().includes(search.toLowerCase()) ||
          (job.summary_short || "").toLowerCase().includes(search.toLowerCase())
      )
    : [];
  if (sortOrder === "asc")
    filteredJobs = filteredJobs.sort((a, b) =>
      (a.budget_display || "").localeCompare(b.budget_display || "")
    );
  if (sortOrder === "desc")
    filteredJobs = filteredJobs.sort((a, b) =>
      (b.budget_display || "").localeCompare(a.budget_display || "")
    );

  return (
    <div className="flex min-h-screen bg-white ">
      <Sidebar active="Home" />
      <div className="flex-1 font-sfpro px-4 md:px-6 md:ml-64">
        <div className="bg-[#f5f8ff] py-5 px-2">
          <div className="flex items-center mb-4 ml-5">
            <RiVerifiedBadgeFill className="text-[#8ed796] mr-2 text-3xl" />
            <h2 className="text-3xl font-semibold text-gray-800  ">
              Hello, {displayName}!
            </h2>
          </div>

          <div className="mb-8 ml-5 flex items-end px-2">
            <div className="relative flex w-full items-center">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search jobs"
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-200 bg-[#f7fcfe] text-gray-700 text-sm focus:outline-none shadow-sm"
                  style={{ background: "#f7fcfe" }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative " style={{ marginLeft: "auto" }}>
                <img
                  src={BudgetFilter}
                  alt="Budget Filter"
                  className="ml-2 h-10 rounded-md p-1 mr-5 cursor-pointer  bg-white"
                  onClick={() => setFilterOpen((v) => !v)}
                />
                {filterOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <button
                      className={`w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm ${
                        sortOrder === "asc" ? "bg-gray-50" : ""
                      }`}
                      onClick={() => {
                        setSortOrder("asc");
                        setFilterOpen(false);
                      }}
                    >
                      Budget: Lower to Higher
                    </button>
                    <button
                      className={`w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm ${
                        sortOrder === "desc" ? "bg-gray-50" : ""
                      }`}
                      onClick={() => {
                        setSortOrder("desc");
                        setFilterOpen(false);
                      }}
                    >
                      Budget: Higher to Lower
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="p-6 text-sm text-gray-500">Loading jobs…</div>
        )}
        {error && (
          <div className="p-6 text-sm text-red-600">
            {error.error || "Failed to load jobs"}
          </div>
        )}

        {filteredJobs.map((job) => (
          <button
            key={job.id}
            className="w-full text-left bg-white border border-gray-100 rounded-lg px-6 py-4 mb-4 transition hover:shadow-lg hover:border-[#0093d1] focus:outline-none "
            onClick={() =>
              navigate("/careproviders/dashboard/job_details", {
                state: { jobId: job.id, job },
              })
            }
          >
            <div className="px-5">
              <div className="flex justify-between items-center mb-2 ">
                <span className="text-gray-400 text-xs">{job.posted_ago}</span>
                <span className="text-[#436d7b] text-xs font-semibold">
                  {job.budget_display}
                </span>
              </div>
              <div className="font-semibold text-lg text-gray-800 mb-1">
                {job.title}
              </div>
              <div className="text-gray-500 text-sm">{job.summary_short}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
