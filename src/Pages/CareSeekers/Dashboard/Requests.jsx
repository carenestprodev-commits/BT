import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { fetchSeekerActiveRequests, fetchSeekerClosedRequests, fetchSeekerPendingRequests } from '../../../Redux/SeekerRequest'

const tabs = ["Active", "Closed", "Pending"];

// Data and formatting are provided by the Redux slice; helpers removed.

function Requests() {
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();

  const dispatch = useDispatch()
  const { active: activeRequests = [], closed: closedRequests = [], pending: pendingRequests = [], loading, error: fetchError } = useSelector(s => s.seekerRequests || { active: [], closed: [], pending: [], loading: false, error: null })
  const fetchErrorMsg = typeof fetchError === 'string' ? fetchError : (fetchError && (fetchError.message || fetchError.error || JSON.stringify(fetchError)))

  useEffect(() => {
    dispatch(fetchSeekerPendingRequests())
    dispatch(fetchSeekerActiveRequests())
    dispatch(fetchSeekerClosedRequests())
  }, [dispatch])

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar active="Requests" />
      <div className="flex-1 font-sfpro px-8 py-8 ml-64 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button className="mr-4 text-gray-500 hover:text-[#0d99c9] text-xl">&#8592;</button>
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
                className={`py-2 px-4 text-gray-500 font-medium focus:outline-none relative ${selectedTab === idx ? "text-[#0d99c9]" : ""}`}
                onClick={() => setSelectedTab(idx)}
              >
                {tab} <span className="ml-1 text-gray-400">({count})</span> {selectedTab === idx && (
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
              {activeRequests.map((req, i) => (
                <div key={i} className="flex items-center bg-gray-50 rounded-lg shadow-sm p-4 mb-4">
                  <div className="flex flex-col items-center mr-4">
                    <span className="text-gray-400 text-sm">{req.day}</span>
                    <span className="text-[#0d99c9] font-bold text-lg">{req.date}</span>
                  </div>
                  <div className="py-8 px-0.5 mr-2 bg-[#0d99c9] rounded-l-lg"></div>
                  <img src={req.avatar} alt="avatar" className="w-10 h-10 rounded-full mr-4" />
                  <div>
                    <div className="font-medium text-gray-800">{req.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{req.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedTab === 1 && (
            <div>
              {closedRequests.map((req, i) => (
                <button
                  key={i}
                  className="w-full text-left bg-gray-50 rounded-lg shadow-sm p-6 mb-4 flex hover:bg-gray-100 transition"
                  onClick={() => navigate("/careseekers/dashboard/request_details/" + req.id)}
                >
                  <img src={req.avatar} alt="avatar" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-semibold text-gray-800">{req.name}</div>
                    <div className="text-xs text-gray-400 mb-1">{req.dateRange}</div>
                    <div className="flex items-center mb-2">
                      <span className="text-xs text-gray-500">{req.rating}.0</span>
                      <span className="text-[#cb9e49] mr-1">{"★".repeat(req.rating)}</span>
                    </div>
                    <div className="text-sm text-gray-600 leading-relaxed">{req.review}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedTab === 2 && (
            <div>
                {pendingRequests.map((req, i) => (
                  <PendingRequestCard key={i} req={req} />
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
  const navigate = useNavigate();
  const handleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };
  const handleClose = () => {
    setMenuOpen(false);
    // Add close logic here
  };
  const handleEdit = () => {
    setMenuOpen(false);
    // Navigate to summary (edit) page
    navigate('/careseekers/dashboard/summary')
  };
  return (
  <div className="bg-gray-50 rounded-lg shadow-sm p-4 mb-4 relative cursor-pointer" onClick={() => navigate(`/careseekers/dashboard/pending_details/${req.id}`)}>
      <div className="absolute top-3 right-3">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 focus:outline-none"
          onClick={handleMenu}
        >
          <svg width="20" height="20" fill="currentColor" className="text-gray-400" viewBox="0 0 20 20">
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
              Close
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
      <div className="font-medium text-gray-800 mb-1">{req.title}</div>
      <div className="text-sm text-gray-600">{req.desc}</div>
    </div>
  );
}

export default Requests;
