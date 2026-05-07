import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRegCalendarAlt, FaBars } from "react-icons/fa";
import { BASE_URL } from "../../Redux/config";
import tokenService from "../../utils/tokenService";
import { useAuth } from "../../Context/AuthContext";

function Header({ title = "Admin", onToggleSidebar }) {
  const navigate = useNavigate();
  const { logout: clearAuthContext } = useAuth();
  const today = new Date();
  const formatted = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleLogout = async () => {
    try {
      const refresh = tokenService.getRefreshToken();

      // Call backend to blacklist the refresh token
      if (refresh) {
        await fetch(`${BASE_URL}/api/admin/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with client-side logout even if backend call fails
    } finally {
      // Clear ALL auth data using tokenService
      tokenService.clearAuthStorage();

      // Clear AuthContext state so route guards immediately reflect logout
      clearAuthContext();

      // Redirect to admin login
      navigate("/admin/login");
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm font-sfpro">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700"
          aria-label="Toggle sidebar"
        >
          <FaBars className="h-4 w-4" />
        </button>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Admin
            </p>
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
            <FaRegCalendarAlt className="h-3.5 w-3.5 text-slate-400" />
            <span>{formatted}</span>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 active:scale-[0.98]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
