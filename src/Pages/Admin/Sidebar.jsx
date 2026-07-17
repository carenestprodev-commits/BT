import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  ChevronDown,
  CreditCard,
  CircleHelp,
  MessageSquareText,
  ShieldCheck,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";

const navItems = [
  {
    to: "/admin/users",
    label: "Users",
    icon: UsersRound,
  },
  {
    to: "/admin/activities",
    label: "Activities",
    icon: Activity,
  },
  {
    to: "/admin/earnings",
    label: "Earnings",
    icon: WalletCards,
  },
  {
    to: "/admin/subscription",
    label: "Subscription",
    icon: CreditCard,
  },
  {
    to: "/admin/support",
    label: "Support",
    icon: CircleHelp,
  },
];

function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const [openProfile, setOpenProfile] = useState(true);
  const { pathname } = useLocation();
  const profileActive = pathname.startsWith("/admin/profile-verification");

  const rootClass = mobileOpen
    ? "fixed inset-y-0 left-0 z-50 flex min-h-[100dvh] w-[252px] flex-col bg-[#071b33] px-4 pb-5 text-white shadow-2xl md:hidden"
    : "hidden min-h-[100dvh] w-[252px] shrink-0 flex-col bg-[#071b33] px-4 pb-5 text-white md:flex";

  const closeOnMobile = () => {
    if (mobileOpen) onClose();
  };

  const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
      isActive
        ? "bg-[#496278] text-white"
        : "text-[#a7b8c9] hover:bg-[#102b48] hover:text-white"
    }`;

  return (
    <aside className={rootClass}>
      <div className="flex h-[86px] shrink-0 items-center justify-between border-b border-white/10 px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#39bee8]/15 ring-1 ring-[#39bee8]/25">
            <img src="/CareLogo.png" alt="CareNestPro" className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[15px] font-semibold tracking-[-0.03em] text-white">
              CareNest<span className="text-[#42c4e9]">Pro</span>
            </p>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#7890a7]">
              Admin portal
            </p>
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#a7b8c9] transition hover:bg-white/10 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 pt-7" aria-label="Admin navigation">
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6f89a2]">
          Workspace
        </p>
        <ul className="space-y-1.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={closeOnMobile}
                className={linkClass}
              >
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}

          <li>
            <button
              type="button"
              onClick={() => setOpenProfile((s) => !s)}
              aria-expanded={openProfile}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
                profileActive
                  ? "bg-[#496278] text-white"
                  : "text-[#a7b8c9] hover:bg-[#102b48] hover:text-white"
              }`}
            >
              <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.8} />
              <span className="flex-1 text-left">Profile Verification</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openProfile ? "" : "-rotate-90"}`} />
            </button>

            {openProfile && (
              <ul className="ml-8 mt-1.5 space-y-1 border-l border-white/10 pl-3">
                <li>
                  <NavLink
                    to="/admin/profile-verification/care-seekers"
                    onClick={closeOnMobile}
                    className={linkClass}
                  >
                    Care Seekers
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/profile-verification/care-providers"
                    onClick={closeOnMobile}
                    className={linkClass}
                  >
                    Care Providers
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
          <li>
            <NavLink
              to="/admin/messages"
              onClick={closeOnMobile}
              className={linkClass}
            >
              <MessageSquareText className="h-[18px] w-[18px]" strokeWidth={1.8} />
              <span>Notifications &amp; Messages</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="mt-6 flex items-center gap-3 border-t border-white/10 px-3 pt-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#42c4e9]/15 text-[#42c4e9]">
          <UserRound className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white">Administrator</p>
          <p className="mt-0.5 text-[10px] text-[#7890a7]">Staff account</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
