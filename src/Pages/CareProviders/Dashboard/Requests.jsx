import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { fetchActiveRequests, fetchClosedRequests, fetchPendingRequests } from '../../../Redux/CareProviderRequest'
import { BASE_URL } from '../../../Redux/config'

const tabs = ["Active", "Closed", "Pending"];

// We'll load lists from Redux

function Requests() {
  const location = useLocation();
  const initialTab = location.state && typeof location.state.tab === "number" ? location.state.tab : 0;
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const { active, closed, pending, loading } = useSelector(s => s.careProviderRequests || { active: [], closed: [], pending: [], loading: false })

  useEffect(() => {
    dispatch(fetchActiveRequests())
    dispatch(fetchClosedRequests())
    dispatch(fetchPendingRequests())
  }, [dispatch])

  const resolveImage = (url) => {
    if (!url) return 'https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151&size=64'
    if (url.startsWith('http') || url.startsWith('https')) return url
    if (url.startsWith('/')) return `${BASE_URL}${url}`
    return url
  }

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
            if (tab === "Active") count = active.length;
            else if (tab === "Closed") count = closed.length;
            else if (tab === "Pending") count = pending.length;
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
          {selectedTab === 0 && (
            <div>
              {loading && <div className="text-sm text-gray-500 mb-4">Loading...</div>}
              {active.map((req) => (
                <button
                  key={req.id}
                  onClick={() => navigate(`/careproviders/dashboard/request_details/${req.id}`)}
                  className="w-full text-left flex items-center bg-gray-50 rounded-lg shadow-sm p-4 mb-4 hover:bg-gray-100 transition"
                >
                  <div className="flex flex-col items-center mr-4">
                    <span className="text-gray-400 text-sm">{req.date ? new Date(req.date).toLocaleString('en-US', { weekday: 'short' }) : ''}</span>
                    <span className="text-[#0d99c9] font-bold text-lg">{req.date ? new Date(req.date).getDate() : ''}</span>
                  </div>
                  <div className="py-8 px-0.5 mr-2 bg-[#0d99c9] rounded-l-lg"></div>
                  <img src={resolveImage(req.seeker && req.seeker.profile_image_url)} alt="avatar" className="w-10 h-10 rounded-full mr-4" />
                  <div>
                    <div className="font-medium text-gray-800">{req.title || (req.job_details && req.job_details.title)}</div>
                    <div className="text-sm text-gray-600 mt-1">{(req.seeker && req.seeker.full_name) || ''}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {req.date ? new Date(req.date).toLocaleDateString() : 'Date: Not specified'}
                      { (req.start_time || req.end_time) && (
                        <span className="ml-2">{req.start_time ? req.start_time : ''}{req.start_time && req.end_time ? ` - ${req.end_time}` : (req.end_time ? req.end_time : '')}</span>
                      ) }
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedTab === 1 && (
            <div>
              {loading && <div className="text-sm text-gray-500 mb-4">Loading...</div>}
              {closed.map((req) => (
                <button
                  key={req.id}
                  className="w-full text-left bg-gray-50 rounded-lg shadow-sm p-6 mb-4 flex hover:bg-gray-100 transition"
                  onClick={() => navigate(`/careproviders/dashboard/request_details/${req.id}`)}
                >
                  <img src={resolveImage(req.seeker && req.seeker.profile_image_url)} alt="avatar" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-semibold text-gray-800">{(req.job_details && req.job_details.title) || (req.seeker && req.seeker.full_name) || req.name || ''}</div>
                    <div className="text-xs text-gray-400 mb-1">{req.job_details && req.job_details.posted_ago ? req.job_details.posted_ago : (req.created_at ? `Posted ${new Date(req.created_at).toLocaleString()}` : '')}</div>
                    <div className="text-sm text-gray-600 leading-relaxed">{(req.job_details && req.job_details.summary) || req.review || ''}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedTab === 2 && (
            <div>
              {loading && <div className="text-sm text-gray-500 mb-4">Loading...</div>}
              {pending.map((req) => (
                <PendingRequestCard key={req.id} req={{ posted: req.job_details && req.job_details.posted_ago ? req.job_details.posted_ago : (req.created_at ? `Posted ${new Date(req.created_at).toLocaleString()}` : ''), title: req.job_details && req.job_details.title, desc: req.job_details && req.job_details.summary }} />
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
    // Add edit logic here
  };
  return (
    <div className="bg-gray-50 rounded-lg shadow-sm p-4 mb-4 relative">
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
      <div className="text-xs text-gray-400 mb-1">{req.posted} </div>
      <div className="font-medium text-gray-800 mb-1">{req.title}</div>
      <div className="text-sm text-gray-600">{req.desc}</div>
    </div>
  );
}

export default Requests;
