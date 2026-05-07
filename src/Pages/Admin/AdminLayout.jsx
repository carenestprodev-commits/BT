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
    "profile-verification/care-seekers": "Care Seekers",
    "profile-verification/care-providers": "Care Providers",
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
    <div className="flex min-h-[100dvh] flex-col md:flex-row bg-slate-50 font-sfpro text-slate-900">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={pageTitle}
          onToggleSidebar={() => setSidebarOpen((s) => !s)}
        />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
