import React, { useState } from "react";
import CareLogo from "../../../../public/CareLogo.png";
import { useNavigate } from "react-router-dom";
import { PiSquaresFour } from "react-icons/pi";
import { TbTrianglePlus } from "react-icons/tb";
import { MdMessage } from "react-icons/md";
import { MdOutlineSettings } from "react-icons/md";
import { MdAccountBalanceWallet } from "react-icons/md";
import Triangle from "../../../../public/triangle.svg";
import Message from "../../../../public/receipt-text.svg";
import WalletIcon from "../../../../public/wallet.svg";

const navItems = [
  { label: "Home", icon: <PiSquaresFour className="h-6 w-6" /> },
  {
    label: "Requests",
    icon: <img src={Triangle} alt="Triangle Icon" className="h-6 w-6" />,
  },
  {
    label: "Wallet",
    icon: <img src={WalletIcon} alt="Wallet Icon" className="h-6 w-6" />,
  },
  {
    label: "Message",
    icon: <img src={Message} alt="Message Icon" className="h-6 w-6" />,
  },
  { label: "Setting", icon: <MdOutlineSettings className="h-6 w-6" /> },
];

function Sidebar({ active = "Home", onNav }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleNav = (label) => {
    if (onNav) {
      onNav(label);
    }
    if (label === "Home") {
      navigate("/careproviders/dashboard");
    } else if (label === "Requests") {
      navigate("/careproviders/dashboard/requests");
    } else if (label === "Message") {
      navigate("/careproviders/dashboard/message");
    } else if (label === "Wallet") {
      navigate("/careproviders/dashboard/wallet");
    } else if (label === "Setting") {
      navigate("/careproviders/dashboard/setting");
    }
    setMobileOpen(false);
  };
  return (
    <>
      {/* Mobile hamburger */}
      <button
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white text-[#0e2f43] p-2 rounded-md shadow"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-64 bg-[#0e2f43] flex flex-col py-8 px-6 text-white font-sfpro">
            <div className="flex items-center mb-6">
              <img src={CareLogo} alt="CareNestPro Logo" className="h-8 mr-3" />
              <span className="text-lg tracking-wide">CareNestPro</span>
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="ml-auto bg-white text-[#0e2f43] p-1 rounded"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-base hover:bg-[#4a6576] focus:outline-none ${
                    active === item.label ? "bg-[#4a6576]" : ""
                  }`}
                  onClick={() => handleNav(item.label)}
                >
                  <span className="sidebar-icon mr-2 text-xl">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:h-screen md:w-64 md:bg-[#0e2f43] md:flex-col md:py-8 md:px-6 md:text-white md:font-sfpro md:fixed md:top-0 md:left-0 z-40">
        <div className="flex items-center mb-12">
          <img src={CareLogo} alt="CareNestPro Logo" className="h-10 mr-3" />
          <span className="text-xl  tracking-wide font-sfpro">CareNestPro</span>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-base hover:bg-[#4a6576] focus:outline-none ${
                active === item.label ? "bg-[#4a6576]" : ""
              }`}
              onClick={() => handleNav(item.label)}
            >
              <span className="sidebar-icon mr-2 text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

export default Sidebar;
