/* eslint-disable no-unused-vars */
import React from "react";
import CareLogo from "../../../../public/CareLogo.png";
import { useNavigate } from "react-router-dom";
import { PiSquaresFour } from "react-icons/pi";
import { TbTrianglePlus } from "react-icons/tb";
import { MdMessage } from "react-icons/md";
import { MdOutlineSettings } from "react-icons/md";
import { MdAccountBalanceWallet } from "react-icons/md";

const navItems = [
  { label: "Home", icon: <PiSquaresFour /> },
  { label: "Requests", icon: <TbTrianglePlus /> },
  { label: "Message", icon: <MdMessage /> },
  { label: "Wallet", icon: <MdAccountBalanceWallet /> },
  { label: "Setting", icon: <MdOutlineSettings /> },
];

function Sidebar({ active = "Home", onNav }) {
  const navigate = useNavigate();
  const handleNav = (label) => {
    if (onNav) {
      onNav(label);
    }
    if (label === "Home") {
      navigate("/careproviders/dashboard/home");
    } else if (label === "Requests") {
      navigate("/careproviders/dashboard/requests");
    } else if (label === "Message") {
      navigate("/careproviders/dashboard/message");
    } else if (label === "Wallet") {
      navigate("/careproviders/dashboard/wallet");
    } else if (label === "Setting") {
      navigate("/careproviders/dashboard/setting");
    }
  };
  return (
    <div className="h-screen w-64 bg-[#0e2f43] flex flex-col py-8 px-6 text-white font-sfpro fixed top-0 left-0 z-40 font-sfpro">
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
  );
}

export default Sidebar;
