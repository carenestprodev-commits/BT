/* eslint-disable no-unused-vars */

import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LuLayoutDashboard } from "react-icons/lu";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { MdOutlineBarChart } from "react-icons/md";
import wencong_logo from "../../../public/huntrerboom_logo.png";
// import AgentSalesReport from "..Dashboard/AgentSalesReport";
import { CiSettings } from "react-icons/ci";
import { BsDatabaseCheck } from "react-icons/bs";

export default function Dashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Dashboard");
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      items: [
        {
          name: "Dashboard",
          icon: <LuLayoutDashboard size={20} />,
          path: "/home",
        },
      ],
    },
  ];

  useEffect(() => {}, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } bg-white border-r border-gray-200 transition-all duration-500 ease-in-out`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 pt-10">
          <div className="flex items-center ms-1 gap-2 mt-20">
            <div
              className={`transform transition-all duration-500 ${
                isCollapsed
                  ? "opacity-0 -translate-x-full"
                  : "opacity-100 translate-x-0"
              }`}
            >
              <img src={wencong_logo} alt="" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
