import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Boxes,
  Building2,
  ChevronDown,
  CircleHelp,
  CreditCard,
  MessageSquareText,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

const userLinks = [
  { to: "/admin/users", label: "All Users", end: true },
  { to: "/admin/users/providers", label: "Care Providers" },
  {
    to: "/admin/profile-verification/care-providers",
    label: "Verify Providers",
  },
  { to: "/admin/profile-verification/care-seekers", label: "Verify Seekers" },
];

const paymentLinks = [
  { to: "/admin/earnings", label: "Payout" },
  { to: "/admin/earnings/fees", label: "Providers fees" },
  { to: "/admin/subscription/plans", label: "Providers subscription plans" },
  { to: "/admin/subscription", label: "Provider subscriptions" },
  { to: "/admin/earnings/transactions", label: "Transactions" },
  { to: "/admin/subscription/users", label: "User subscriptions" },
  { to: "/admin/earnings/wallet-transactions", label: "Wallet transactions" },
  { to: "/admin/earnings/wallet", label: "Wallet" },
];

const jobLinks = [
  { to: "/admin/jobs", label: "Bookings" },
  { to: "/admin/jobs/conversations", label: "Conversations" },
  { to: "/admin/jobs/requests", label: "Job requests" },
  { to: "/admin/jobs/message", label: "Message" },
  { to: "/admin/jobs/reviews", label: "Reviews" },
];

const organisationLinks = [
  {
    to: "/admin/organisations",
    label: "Overview",
    end: true,
    preserveSearch: true,
  },
  {
    to: "/admin/organisations/employees",
    label: "Employees",
    preserveSearch: true,
  },
  {
    to: "/admin/organisations/care-rules",
    label: "Care rules",
    preserveSearch: true,
  },
  {
    to: "/admin/organisations/covered-services",
    label: "Covered services",
    preserveSearch: true,
  },
  {
    to: "/admin/organisations/spending-history",
    label: "Spending history",
    preserveSearch: true,
  },
  {
    to: "/admin/organisations/billing",
    label: "Billing",
    preserveSearch: true,
  },
];

function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const { pathname, search } = useLocation();
  const usersActive =
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/profile-verification");
  const paymentsActive =
    pathname.startsWith("/admin/earnings") ||
    pathname.startsWith("/admin/subscription");
  const jobsActive =
    pathname.startsWith("/admin/jobs") ||
    pathname.startsWith("/admin/activities");
  const organisationsActive = pathname.startsWith("/admin/organisations");
  const [openUsers, setOpenUsers] = useState(usersActive);
  const [openPayments, setOpenPayments] = useState(paymentsActive);
  const [openJobs, setOpenJobs] = useState(jobsActive);
  const [openOrganisations, setOpenOrganisations] =
    useState(organisationsActive);

  const rootClass = mobileOpen
    ? "fixed inset-y-0 left-0 z-50 flex min-h-[100dvh] w-[268px] flex-col bg-[#0E3347] text-white shadow-2xl md:hidden"
    : "sticky top-0 hidden h-[100dvh] w-[268px] shrink-0 flex-col overflow-y-auto overscroll-contain bg-[#0E3347] text-white md:flex";

  const closeOnMobile = () => {
    if (mobileOpen) onClose();
  };

  const rootLinkClass = (active) =>
    "flex w-full items-center gap-3 px-7 py-3.5 text-[14px] transition-colors " +
    (active
      ? "bg-[#496278] text-white"
      : "text-[#d0d8df] hover:bg-[#123e54] hover:text-white");

  const childLinkClass = ({ isActive }) =>
    "block border-l border-white/35 py-2 pl-4 pr-5 text-[14px] transition-colors " +
    (isActive
      ? "font-medium text-[#16b9ed]"
      : "text-[#d0d8df] hover:text-white");

  const group = (label, Icon, open, setOpen, active, links) => (
    <li>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={rootLinkClass(active)}
      >
        <Icon className="h-[21px] w-[21px]" strokeWidth={1.6} />
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={
            "h-4 w-4 transition-transform " + (open ? "" : "-rotate-90")
          }
          strokeWidth={1.8}
        />
      </button>
      {open && (
        <ul className="ml-9 space-y-1 border-l border-white/35 py-2 pl-0">
          {links.map((link, index) => (
            <li key={link.label + index}>
              <NavLink
                to={
                  link.preserveSearch
                    ? { pathname: link.to, search }
                    : link.to
                }
                end={link.end ?? true}
                onClick={closeOnMobile}
                className={childLinkClass}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );

  return (
    <aside className={rootClass}>
      <div className="flex h-[152px] shrink-0 items-center border-b border-white/10 px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center">
            <img src="/CareLogo.png" alt="CareNestPro" className="h-9 w-9" />
          </div>
          <p className="text-[20px] font-medium tracking-[-0.04em] text-white">
            CareNest<span className="text-[#42c4e9]">Pro</span>
          </p>
        </div>
        {mobileOpen && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#d0d8df] hover:bg-white/10 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 pt-2" aria-label="Admin navigation">
        <ul>
          {group(
            "Users",
            UsersRound,
            openUsers,
            setOpenUsers,
            usersActive,
            userLinks,
          )}
          {group(
            "Payments",
            CreditCard,
            openPayments,
            setOpenPayments,
            paymentsActive,
            paymentLinks,
          )}
          {group("Jobs", Boxes, openJobs, setOpenJobs, jobsActive, jobLinks)}
          {group(
            "Organisations",
            Building2,
            openOrganisations,
            setOpenOrganisations,
            organisationsActive,
            organisationLinks,
          )}

          <li>
            <NavLink
              to="/admin/token-blacklist"
              onClick={closeOnMobile}
              className={({ isActive }) => rootLinkClass(isActive)}
            >
              <ShieldCheck className="h-[21px] w-[21px]" strokeWidth={1.6} />
              <span>Token Blacklist</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/support"
              onClick={closeOnMobile}
              className={({ isActive }) => rootLinkClass(isActive)}
            >
              <CircleHelp className="h-[21px] w-[21px]" strokeWidth={1.6} />
              <span>Support</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/messages"
              onClick={closeOnMobile}
              className={({ isActive }) => rootLinkClass(isActive)}
            >
              <MessageSquareText
                className="h-[21px] w-[21px]"
                strokeWidth={1.6}
              />
              <span>Notifications &amp; Messages</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 px-7 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#42c4e9]/15 text-[#42c4e9]">
          <UserRound className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white">
            Administrator
          </p>
          <p className="mt-0.5 text-[10px] text-[#9eb4c2]">Staff account</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
