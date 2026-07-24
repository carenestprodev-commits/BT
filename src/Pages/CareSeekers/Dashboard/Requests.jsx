import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSeekerActiveRequests,
  fetchSeekerClosedRequests,
  fetchSeekerPendingRequests,
  deletePendingRequest,
} from "../../../Redux/SeekerRequest";
import {
  ApplicantsAvatarStack,
  resolveImage,
} from "../../../Components/CareRequestSections";

const tabs = ["Active", "Closed", "Pending"];

function Requests() {
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const {
    active: activeRequests = [],
    closed: closedRequests = [],
    pending: pendingRequests = [],
    loading,
    error: fetchError,
  } = useSelector(
    (s) =>
      s.seekerRequests || {
        active: [],
        closed: [],
        pending: [],
        loading: false,
        error: null,
      },
  );
  const fetchErrorMsg =
    typeof fetchError === "string"
      ? fetchError
      : fetchError &&
        (fetchError.message || fetchError.error || JSON.stringify(fetchError));

  useEffect(() => {
    dispatch(fetchSeekerPendingRequests());
    dispatch(fetchSeekerActiveRequests());
    dispatch(fetchSeekerClosedRequests());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen bg-white font-sfpro">
      <Sidebar active="Requests" />
      {/* pt-20 on mobile offsets the fixed top navbar height; md:pt-8 resets for desktop */}
      <div className="flex-1 font-sfpro px-8 py-8 pt-20 md:pt-8 md:ml-64 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            className="mr-4 text-gray-500 hover:text-[#0d99c9] text-xl"
            onClick={() => navigate(-1)}
          >
            &#8592;
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">Request</h1>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map((tab, idx) => {
            let count = 0;
            if (tab === "Active") count = activeRequests.length;
            else if (tab === "Closed") count = closedRequests.length;
            else if (tab === "Pending") count = pendingRequests.length;
            return (
              <button
                key={tab}
                className={`py-2 px-4 text-gray-500 font-medium focus:outline-none relative ${
                  selectedTab === idx ? "text-[#0d99c9]" : ""
                }`}
                onClick={() => setSelectedTab(idx)}
              >
                {tab} <span className="ml-1 text-gray-400">({count})</span>{" "}
                {selectedTab === idx && (
                  <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-[#0d99c9] rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
        {/* Tab Content */}
        <div className="pt-6">
          {loading && (
            <div className="mb-4 text-sm text-gray-500">Loading requests…</div>
          )}
          {fetchError && (
            <div className="mb-4 text-sm text-red-600">{fetchErrorMsg}</div>
          )}
          {selectedTab === 0 && (
            <div>
              {activeRequests.length === 0 && !loading ? (
                <div className="text-sm text-gray-500">No active requests.</div>
              ) : null}

              {activeRequests.map((req, i) => {
                const raw = req.raw || req;
                const isInProgress = raw.is_activity_in_progress ?? false;
                const hasEnded = raw.has_ended_activity ?? false;
                const providerName =
                  raw.provider?.user?.full_name || raw.providerName || "Provider";
                const providerAvatar =
                  resolveImage(
                    raw.provider?.user?.profile_image_url ||
                      raw.provider?.provider_image_url ||
                      raw.providerImageUrl,
                    providerName,
                  ) || req.avatar;

                return (
                  <button
                    key={i}
                    onClick={() =>
                      navigate(
                        `/careseekers/dashboard/request_details/${req.id || raw.id}`,
                      )
                    }
                    className="w-full text-left flex items-center bg-gray-50 rounded-lg shadow-sm p-4 mb-4 hover:bg-gray-100 transition"
                  >
                    <div className="flex flex-col items-center mr-4 flex-shrink-0">
                      <span className="text-gray-400 text-sm">{req.day}</span>
                      <span className="text-[#0d99c9] font-bold text-lg">
                        {req.date}
                      </span>
                    </div>
                    <div className="py-8 px-0.5 mr-3 bg-[#0d99c9] rounded-l-lg"></div>
                    <img
                      src={providerAvatar}
                      alt={providerName}
                      className="w-10 h-10 rounded-full mr-4 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {req.title || raw.title || "Active care"}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5 truncate">
                        {providerName}
                      </div>
                      {req.time ? (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {req.time}
                        </div>
                      ) : null}
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      {isInProgress && !hasEnded && (
                        <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Session running
                        </span>
                      )}
                      {hasEnded && !isInProgress && (
                        <span className="bg-amber-50 text-amber-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                          ⏳ Awaiting payment
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {selectedTab === 1 && (
            <div>
              {closedRequests.map((req, i) => (
                <button
                  key={i}
                  className="w-full text-left bg-gray-50 rounded-lg shadow-sm p-6 mb-4 flex hover:bg-gray-100 transition"
                  onClick={() =>
                    navigate("/careseekers/dashboard/request_details/" + req.id)
                  }
                >
                  <img
                    src={resolveImage(
                      req.avatar,
                      req.provider?.user?.full_name || req.name,
                    )}
                    alt="avatar"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">
                      {req.name}
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                      {req.dateRange}
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="text-xs text-gray-500">
                        {Number.isFinite(Number(req.rating))
                          ? Number(req.rating).toFixed(1)
                          : "Not rated"}
                      </span>
                      <span className="text-[#cb9e49] mr-1">
                        {"★".repeat(
                          Math.max(
                            0,
                            Math.min(5, Math.round(Number(req.rating) || 0)),
                          ),
                        )}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {req.review}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedTab === 2 && (
            <div>
              {pendingRequests.map((req) => (
                <PendingRequestCard key={req.id} req={req} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PendingRequestCard({ req }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };
  const handleClose = async (event) => {
    event.stopPropagation();
    setMenuOpen(false);
    if (
      !window.confirm(
        "Close this care request? Providers will no longer be able to apply.",
      )
    )
      return;
    setClosing(true);
    const result = await dispatch(deletePendingRequest(req.id));
    setClosing(false);
    if (result.error) {
      alert(
        result.payload?.detail ||
          result.error.message ||
          "Could not close request.",
      );
      return;
    }
    dispatch(fetchSeekerPendingRequests());
  };
  const handleEdit = (event) => {
    event.stopPropagation();
    setMenuOpen(false);
    navigate(`/careseekers/dashboard/pending_details/${req.id}`, {
      state: { details: req, edit: true },
    });
  };
  return (
    <div
      className="bg-gray-50 rounded-lg shadow-sm p-4 mb-4 relative cursor-pointer"
      onClick={() =>
        navigate(`/careseekers/dashboard/pending_details/${req.id}`, {
          state: { details: req },
        })
      }
    >
      <div className="absolute top-3 right-3">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 focus:outline-none"
          onClick={handleMenu}
        >
          <svg
            width="20"
            height="20"
            fill="currentColor"
            className="text-gray-400"
            viewBox="0 0 20 20"
          >
            <circle cx="4" cy="10" r="1.5" />
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="16" cy="10" r="1.5" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <button
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
              onClick={handleClose}
            >
              {closing ? "Closing…" : "Close request"}
            </button>
            <button
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
              onClick={handleEdit}
            >
              Edit
            </button>
          </div>
        )}
      </div>
      <div className="text-xs text-gray-400 mb-1">{req.posted}</div>
      <div className="font-medium text-gray-800 mb-1 pr-10">{req.title}</div>
      <div className="text-sm text-gray-600 mb-4">{req.desc}</div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-600">
          {req.applicationCount || 0} care providers applied
        </span>
        <ApplicantsAvatarStack applications={req.applications || []} />
      </div>
    </div>
  );
}

export default Requests;
