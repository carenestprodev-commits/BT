/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React from "react";
import { useNavigate } from "react-router-dom";
import CareLogo from "../../../../public/CareLogo.png";

import { PiSquaresFour } from "react-icons/pi";
import { MdOutlineSettings } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";

import Triangle from "../../../../public/triangle.svg";
import Message from "../../../../public/receipt-text.svg";
import WalletIcon from "../../../../public/wallet.svg";
import {fetchWithAuth} from "../../../lib/fetchWithAuth.js";

/* ---------------- NAV ITEMS ---------------- */

const navItems = [
  { label: "Home", icon: <PiSquaresFour className="h-6 w-6" /> },
  {
    label: "Requests",
    icon: <img src={Triangle} alt="Requests" className="h-6 w-6" />,
  },
  {
    label: "Wallet",
    icon: <img src={WalletIcon} alt="Wallet" className="h-6 w-6" />,
  },
  {
    label: "Message",
    icon: <img src={Message} alt="Message" className="h-6 w-6" />,
  },
  {
    label: "Settings",
    icon: <MdOutlineSettings className="h-6 w-6" />,
  },
];

/* ---------------- COMPONENT ---------------- */

function Sidebar({ active = "Home", onNav }) {
  const navigate = useNavigate();

  const handleNav = (label) => {
    if (onNav) onNav(label);

    if (label === "Home") navigate("/careproviders/dashboard/home");
    if (label === "Requests") navigate("/careproviders/dashboard/requests");
    if (label === "Wallet") navigate("/careproviders/dashboard/wallet");
    if (label === "Message") navigate("/careproviders/dashboard/message");
    if (label === "Settings") navigate("/careproviders/dashboard/settings");
  };

  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [profileCompletion, setProfileCompletion] = React.useState(null);
  const [showCompletion, setShowCompletion] = React.useState(true);

  React.useEffect(() => {
    const fetchProfileCompletion = async () => {
      try {
        const response = await fetchWithAuth("/api/profile/completion");

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        setProfileCompletion(data.percentage);
      } catch (error) {
        console.error("Failed to fetch profile completion", error);
        // Silently fail – UI should not break
      }
    };

    fetchProfileCompletion();
  }, []);


  const handleLogout = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn("Failed to clear localStorage", e);
    }

    navigate("/careproviders/login/", { replace: true });
    window.location.reload();
  };

  /* ---------------- LOGOUT MODAL ---------------- */
  const LogoutModal = () => {
    if (!showLogoutModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
          {/* Close button */}
          <button
            onClick={() => setShowLogoutModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Icon - Using FiLogOut */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="red"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
            Sign out
          </h3>
          <p className="text-gray-500 text-center mb-6">
            Are you sure you want to Log out?
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-red-500 text-white font-medium hover:bg-red-600 rounded-lg transition-colors"
            >
              Sign Out
            </button>
            <button
              onClick={() => setShowLogoutModal(false)}
              className="w-full px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ================= MOBILE BOTTOM NAV ================= */}
      {active !== "Message" && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 font-sfpro">
          <nav className="flex justify-around items-center py-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNav(item.label)}
                className={`flex flex-col items-center justify-center text-xs transition ${
                  active === item.label ? "text-[#0e2f43]" : "text-gray-400"
                }`}
              >
                <span className="mb-1">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden md:flex md:fixed md:top-0 md:left-0 md:h-screen md:w-64 md:flex-col md:bg-[#0e2f43] md:px-6 md:py-8 md:text-white md:font-sfpro z-40">
        {/* Logo */}
        <div className="flex items-center mb-12">
          <img src={CareLogo} alt="CareNestPro Logo" className="h-10 mr-3" />
          <span className="text-xl tracking-wide">CareNestPro</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNav(item.label)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition hover:bg-[#4a6576] ${
                active === item.label ? "bg-[#4a6576]" : ""
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Profile Completion Card */}
        {profileCompletion !== null &&
          profileCompletion < 100 &&
          showCompletion && (
            <div className="relative bg-[#1a4a5e] rounded-lg p-4 mb-4">
              <button
                onClick={() => setShowCompletion(false)}
                className="absolute top-2 right-2 text-white/60 hover:text-white"
              >
                ×
              </button>

              <div className="flex items-center gap-4 mb-3">
                <div className="relative w-16 h-16">
                  <svg className="transform -rotate-90 w-16 h-16">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-[#2d5f73]"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 28 * (1 - profileCompletion / 100)
                      }`}
                      className="text-white transition-all duration-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
                    {profileCompletion}%
                  </div>
                </div>
              </div>

              <h4 className="text-white font-semibold text-base mb-1">
                Almost complete
              </h4>
              <p className="text-white/80 text-sm mb-3">
                You're almost set. Complete your profile?
              </p>

              <button
                onClick={() => navigate("/careproviders/dashboard/setting")}
                className="flex items-center gap-2 text-[#4fd1c5] hover:text-[#3fb9ad] transition text-sm font-medium"
              >
                Complete profile now
                <span>→</span>
              </button>
            </div>
          )}
        {/* Logout (Bottom, like Figma) */}
        <div className="pt-6 mt-6 border-t border-white/20">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-base font-medium text-[#4fd1c5] hover:bg-[#4a6576] transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
      {/* Logout Modal */}
      <LogoutModal />
    </>
  );
}

export default Sidebar;
