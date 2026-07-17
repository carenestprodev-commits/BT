import { Outlet, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState } from "react";
import tokenService from "../../utils/tokenService";

function AdminLayout() {
  const location = useLocation();

  // derive page title from pathname
  const path = location.pathname.replace("/admin/", "");
  const titleMap = {
    users: "Users",
    activities: "Activities",
    earnings: "Earnings",
    subscription: "Subscription",
    support: "Support",
    "profile-verification": "Profile Verification",
    "profile-verification/care-seekers": "Profile Verification — Care Seekers",
    "profile-verification/care-providers": "Profile Verification — Care Providers",
    messages: "Notifications & Messages",
  };
  const pageTitle = titleMap[path] || "Admin";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const access = tokenService.getAccessToken();
  const user = tokenService.getUser();

  if (!access) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user is admin or staff
  if (user) {
    if (!user.is_staff) {
      return <Navigate to="/admin/login" replace />;
    }
  } else {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#f7f9fc] font-sfpro text-slate-900 md:flex-row">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#06172c]/55 backdrop-blur-[1px] md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          title={pageTitle}
          onToggleSidebar={() => setSidebarOpen((s) => !s)}
        />
        <main className="flex-1 overflow-y-auto bg-[#f7f9fc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
