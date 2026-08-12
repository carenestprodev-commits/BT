import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchActiveRequests,
  fetchClosedRequests,
  fetchPendingRequests,
} from "../../../Redux/CareProviderRequest";
import { BASE_URL } from "../../../Redux/config";

const tabs = ["Active", "Closed", "Awaiting seeker review"];

function Requests() {
  const location = useLocation();
  const initialTab =
    location.state && typeof location.state.tab === "number"
      ? location.state.tab
      : 0;
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { active, closed, pending, loading } = useSelector(
    (s) =>
      s.careProviderRequests || {
        active: [],
        closed: [],
        pending: [],
        loading: false,
      },
  );

  useEffect(() => {
    dispatch(fetchActiveRequests());
    dispatch(fetchClosedRequests());
    dispatch(fetchPendingRequests());
  }, [dispatch]);

  const resolveImage = (url, name = "User") => {
    if (!url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E5E7EB&color=374151&size=64`;
    }
    if (url.startsWith("http") || url.startsWith("https")) return url;
    if (url.startsWith("/")) return `${BASE_URL}${url}`;
    return url;
  };

  const renderActiveBadge = (req) => {
    const isInProgress = req.is_activity_in_progress ?? false;
    const hasEnded = req.has_ended_activity ?? false;

    if (isInProgress && !hasEnded) {
      return (
        <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Session running
        </span>
      );
    }

    if (hasEnded && !isInProgress) {
      return (
        <span className="bg-amber-50 text-amber-600 text-xs font-semibold px-2.5 py-1 rounded-full">
          ⏳ Awaiting payment
        </span>
      );
    }

    return null;
  };

  return (
    <div className="flex min-h-screen bg-white font-sfpro">
      <Sidebar active="Requests" />

      <div className="flex-1 md:ml-64">
        <div className="sticky top-[57px] md:top-0 z-30 bg-white border-b border-gray-100 px-6 py-4 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <button
              className="text-gray-500 hover:text-[#0d99c9] text-2xl font-bold leading-none"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              ←
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">Request</h1>
          </div>

          <div className="flex border-b border-gray-100 -mb-[1px]">
            {tabs.map((tab, idx) => {
              const count =
                tab === "Active"
                  ? active.length
                  : tab === "Closed"
                    ? closed.length
                    : pending.length;

              return (
                <button
                  key={tab}
                  className={`py-2 px-4 text-gray-500 font-medium focus:outline-none relative ${
                    selectedTab === idx ? "text-[#0d99c9]" : ""
                  }`}
                  onClick={() => setSelectedTab(idx)}
                >
                  {tab} <span className="ml-1 text-gray-400">({count})</span>
                  {selectedTab === idx && (
                    <span className="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-[#0d99c9] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 md:px-8 pt-6 overflow-y-auto">
          {loading && (
            <div className="text-sm text-gray-500 mb-4">Loading...</div>
          )}

          {selectedTab === 0 && (
            <div>
              {active.length === 0 && !loading ? (
                <div className="text-sm text-gray-500">No active requests.</div>
              ) : null}

              {active.map((req) => {
                return (
                  <button
                    key={req.id}
                    onClick={() =>
                      navigate(
                        `/careproviders/dashboard/active_details/${req.id}`,
                      )
                    }
                    className="w-full text-left flex items-center bg-gray-50 rounded-lg shadow-sm p-4 mb-4 hover:bg-gray-100 transition"
                  >
                    <div className="flex flex-col items-center mr-4 flex-shrink-0">
                      <span className="text-gray-400 text-sm">
                        {req.dateLabel}
                      </span>
                      <span className="text-[#0d99c9] font-bold text-lg">
                        {req.date ? new Date(req.date).getDate() : ""}
                      </span>
                    </div>

                    <div className="py-8 px-0.5 mr-3 bg-[#0d99c9] rounded-l-lg" />

                    <img
                      src={resolveImage(req.seekerImageUrl, req.seekerName)}
                      alt={req.seekerName}
                      className="w-10 h-10 rounded-full mr-4 object-cover flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {req.requestTitle}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5 truncate">
                        {req.seekerName}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {req.timeLabel || "Time not specified"}
                      </div>
                    </div>

                    <div className="ml-3 flex-shrink-0">
                      {renderActiveBadge(req)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedTab === 1 && (
            <div>
              {closed.length === 0 && !loading ? (
                <div className="text-sm text-gray-500">No closed requests.</div>
              ) : null}

              {closed.map((req) => {
                return (
                  <button
                    key={req.id}
                    className="w-full text-left bg-gray-50 rounded-lg shadow-sm p-6 mb-4 flex items-start hover:bg-gray-100 transition"
                    onClick={() =>
                      navigate(
                        `/careproviders/dashboard/request_details/${req.id}`,
                      )
                    }
                  >
                    <img
                      src={resolveImage(req.seekerImageUrl, req.seekerName)}
                      alt={req.seekerName}
                      className="w-12 h-12 rounded-full mr-4 flex-shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 truncate">
                        {req.seekerName}
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        {req.postedLabel}
                      </div>
                      <div className="text-sm text-gray-500 font-medium mb-1 truncate">
                        {req.requestTitle}
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {req.requestSummary}
                      </div>
                    </div>
                    <span className="ml-3 flex-shrink-0 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full self-start">
                      Closed
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedTab === 2 && (
            <div>
              {pending.length === 0 && !loading ? (
                <div className="text-sm text-gray-500">
                  No pending requests.
                </div>
              ) : null}

              {pending.map((req) => (
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
  const navigate = useNavigate();

  return (
    <div
      className="bg-gray-50 rounded-lg shadow-sm p-4 mb-4 relative cursor-pointer hover:bg-gray-100 transition"
      onClick={() =>
        navigate(`/careproviders/dashboard/pending_details/${req.id}`, {
          state: { details: req },
        })
      }
    >
      <div className="text-xs text-gray-400 mb-1">{req.postedLabel}</div>
      <div className="font-medium text-gray-800 mb-1 truncate">
        {req.requestTitle}
      </div>
      <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">
        {req.requestSummary}
      </div>
    </div>
  );
}

export default Requests;
