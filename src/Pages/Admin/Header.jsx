import { useNavigate } from "react-router-dom";
import { CalendarDays, LogOut, Menu } from "lucide-react";
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
    <header className="shrink-0 border-b border-[#e8edf3] bg-white font-sfpro">
      <div className="flex min-h-[82px] w-full items-center justify-between gap-4 px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#17334d] transition hover:bg-[#f1f5f8] md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-medium tracking-[-0.03em] text-[#4b4b4b] sm:text-2xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 rounded-full bg-[#f3f7fa] px-3 py-2 text-[11px] font-medium text-[#607488] sm:px-4 sm:text-xs">
            <CalendarDays className="h-4 w-4 text-[#35b8df]" strokeWidth={1.8} />
            <span className="hidden sm:inline">{formatted}</span>
            <span className="sm:hidden">{today.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-xs font-semibold text-[#63778a] transition hover:bg-[#f5f7f9] hover:text-[#102b46] sm:px-3"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.8} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
