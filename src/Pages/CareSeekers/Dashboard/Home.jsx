import { useEffect, useState } from "react";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { MdArrowForward, MdPeopleAlt, MdWallet } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Sidebar from "./Sidebar";
import SubscriptionModal from "./SubscriptionModal";
import LiveCareSessionCard from "../../../Components/LiveCareSessionCard";
import ApplicationCard from "../../../Components/CareSeekers/ApplicationCard";
import ApplicationDetailsModal from "../../../Components/CareSeekers/ApplicationDetailsModal";
import {
  acceptApplication,
  removeApplication,
  rejectApplication,
} from "../../../Components/CareSeekers/applicationApi";
import { fetchUserProfile } from "../../../Redux/Auth";
import { fetchSeekerDashboard } from "../../../Redux/SeekerDashboardHome";
import { fetchSeekerPendingRequests } from "../../../Redux/SeekerRequest";
import { formatDisplayName } from "../../../utils/formatDisplayName";
import { useUserProfileRefreshOnFocus } from "../../../hooks/useUserProfileRefresh";

const readLocalUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") || {};
  } catch {
    return {};
  }
};

const money = (value) =>
  new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(Number(value) || 0);

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);
  const dashboard = useSelector((state) => state.seekerDashboard || {});
  const requestsState = useSelector((state) => state.seekerRequests || {});
  const [activeTab, setActiveTab] = useState("applications");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    dispatch(fetchSeekerDashboard());
    dispatch(fetchSeekerPendingRequests());
    dispatch(fetchUserProfile());
    if (readLocalUser().is_subscribed === false) setShowSubscriptionModal(true);
  }, [dispatch]);

  useUserProfileRefreshOnFocus();

  const user = authUser || readLocalUser();
  const name = formatDisplayName(dashboard.greeting_name || user.full_name || user.first_name || user.name) || "there";
  const avatar = user.profile_image_url || user.image_url || user.profile_image || "/avatar_user.png";
  const requests = Array.isArray(requestsState.pending) ? requestsState.pending : [];
  const entries = requests.flatMap((request) => (request.applications || []).map((application) => ({ request, application })));

  const rejectApplicationRequest = async (entry) => {
    if (!entry?.application?.id) return;
    await rejectApplication(entry.application.id);
    setSelectedEntry(null);
    dispatch(fetchSeekerPendingRequests());
  };

  const acceptApplicationRequest = async (entry) => {
    if (!entry?.application?.id) return;
    await acceptApplication(entry.application.id);
    setSelectedEntry(null);
    dispatch(fetchSeekerPendingRequests());
    navigate(`/careseekers/dashboard/pending_details/${entry.request.id}`);
  };

  const removeApplicationRequest = async (entry) => {
    if (!entry?.application?.id) return;
    await removeApplication(entry.application.id);
    dispatch(fetchSeekerPendingRequests());
  };

  return (
    <div className="min-h-screen bg-white font-sfpro tracking-normal">
      <Sidebar active="Home" mobileBottomNav />
      <main className={`mx-auto max-w-[1120px] px-5 pb-28 pt-8 md:ml-64 md:px-10 md:pb-10 md:pt-10 ${showSubscriptionModal ? "pointer-events-none blur-sm" : ""}`}>
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={avatar} alt={name} className="h-14 w-14 rounded-full object-cover" />
            <div>
              <h1 className="flex items-center gap-1 text-[22px] font-bold text-[#111]">
                Hello {name}<span className="text-[20px]">👋🏽</span>
              </h1>
              <p className="text-[16px] text-[#8b8f94]">We’re here to make care easier for you</p>
            </div>
          </div>
          <button type="button" className="relative grid h-14 w-14 place-items-center rounded-full bg-[#fafafa] text-2xl text-[#111]" aria-label="Notifications" onClick={() => navigate("/careseekers/dashboard/notifications")}>
            <FaBell />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#ed1c24]" />
          </button>
        </header>

        <section className="relative mt-9 overflow-hidden rounded-[20px] bg-gradient-to-br from-[#e7f6e8] via-[#d9f1d9] to-[#bce3bd] px-5 py-6 md:px-8">
          <div className="absolute -right-10 -top-20 h-52 w-52 rounded-full bg-white/25" />
          <span className="absolute right-5 top-3 text-xl tracking-[5px] text-[#63c86c]">•••</span>
          <span className="absolute right-7 top-12 text-2xl text-[#63c86c]">✦</span>
          <div className="relative flex items-center gap-3 md:gap-5">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-2 border-dashed border-[#00a51e] md:h-28 md:w-28">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#e9f8e8] text-5xl text-[#00a51e] md:h-20 md:w-20">
                <FaUserCircle />
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold text-[#00a51e] md:text-[16px]">Complete your profile</h2>
              <p className="mt-1 text-[13px] leading-[1.25] text-[#00a51e] md:text-[15px]">Set Up Your Profile to Access Trusted Caregivers</p>
              <Link to="/careseekers/dashboard/personal-information" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#009c20] px-4 py-2 text-[14px] font-semibold text-white md:mt-4 md:px-5 md:text-[15px]">
                Complete profile <MdArrowForward />
              </Link>
            </div>
          </div>
        </section>

        <h2 className="mt-10 text-[22px] font-medium text-[#111]">Overview</h2>
        <section className="mt-4 grid grid-cols-2 gap-4">
          <OverviewCard icon={<MdPeopleAlt />} value={dashboard.loading ? "…" : dashboard.new_care_provider_requests ?? 0} label="New provider requests" action="View all requests" onClick={() => navigate("/careseekers/dashboard/requests")} tone="green" />
          <OverviewCard icon={<MdWallet />} value={dashboard.loading ? "…" : `₦${money(dashboard.total_amount_spent)}`} label="Total amount spent" action="View spending history" onClick={() => navigate("/careseekers/dashboard/requests")} tone="blue" />
        </section>

        <Link to="/careseekers/bookservice" className="mt-10 flex min-h-[138px] items-center justify-between overflow-hidden rounded-[20px] bg-gradient-to-r from-[#0d99c9] to-[#0794d6] px-6 text-white">
          <div>
            <h2 className="text-[22px] font-medium">Create care request</h2>
            <p className="mt-1 max-w-[300px] text-[17px] leading-[1.35]">Create a request to get matched with trusted caregiver</p>
          </div>
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-[7px] border-white/20 bg-white text-5xl font-light text-[#0d99c9]">+</span>
        </Link>

        {(dashboard.active_sessions?.length ? dashboard.active_sessions : dashboard.active_session ? [dashboard.active_session] : []).map((session) => (
          <LiveCareSessionCard
            key={session.booking_id}
            bookingId={session.booking_id}
            counterpartName={session.counterpart_name}
            counterpartProfileImageUrl={session.counterpart_profile_image}
            counterpartId={session.counterpart_id}
            serviceCategory={session.service_category}
            startTimeIso={session.start_time}
            hourlyRate={session.hourly_rate}
            currencySymbol={session.display_currency_symbol}
            conversationId={session.conversation_id}
            userType="seeker"
          />
        ))}

        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex rounded-xl bg-[#f4f4f4] p-1">
              <TabButton active={activeTab === "applications"} onClick={() => setActiveTab("applications")}>Applications</TabButton>
              <TabButton active={activeTab === "requests"} onClick={() => setActiveTab("requests")}>Your Requests</TabButton>
            </div>
            <button type="button" className="text-[16px] font-medium text-[#0d99c9]" onClick={() => navigate("/careseekers/dashboard/applications")}>View all</button>
          </div>

          <div className="mt-5 space-y-4">
            {activeTab === "applications" ? (
              entries.length ? entries.slice(0, 2).map((entry) => (
                <ApplicationCard
                  key={entry.application.id}
                  application={entry.application}
                  request={entry.request}
                  onReject={() => rejectApplicationRequest(entry)}
                  onRemove={() => removeApplicationRequest(entry)}
                  onViewDetails={() => setSelectedEntry(entry)}
                />
              )) : <EmptyState text={requestsState.loading ? "Loading applications…" : "No applications yet"} />
            ) : (
              requests.length ? requests.slice(0, 4).map((request) => (
                <button key={request.id} type="button" onClick={() => navigate(`/careseekers/dashboard/pending_details/${request.id}`)} className="flex w-full items-center justify-between rounded-[14px] border border-[#e8edf0] bg-white p-4 text-left">
                  <div>
                    <span className="rounded-full bg-[#e8f7eb] px-3 py-1 text-xs text-[#00a51e]">{request.display_status || "Open"}</span>
                    <h3 className="mt-3 text-[17px] font-semibold text-[#111]">{request.title}</h3>
                    <p className="mt-1 text-sm text-[#8b8f94]">{request.location || "Location not specified"}</p>
                  </div>
                  <MdArrowForward className="text-2xl text-[#0d99c9]" />
                </button>
              )) : <EmptyState text="No care requests yet" />
            )}
          </div>
        </section>
      </main>

      {selectedEntry && (
        <ApplicationDetailsModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onReject={() => {
            setSelectedEntry(null);
            dispatch(fetchSeekerPendingRequests());
          }}
          onAccept={() => acceptApplicationRequest(selectedEntry)}
        />
      )}
      {showSubscriptionModal && <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} />}
    </div>
  );
}

function OverviewCard({ icon, value, label, action, onClick, tone }) {
  const palette = tone === "green" ? { text: "text-[#00a51e]", bg: "bg-[#effaf0]", icon: "bg-[#daf2dd]" } : { text: "text-[#0d99c9]", bg: "bg-[#f0f8fd]", icon: "bg-[#dff2fa]" };
  return (
    <div className={`rounded-[18px] p-3 ${palette.bg}`}>
      <div className="flex items-center gap-3">
        <span className={`grid h-14 w-14 place-items-center rounded-xl text-2xl ${palette.icon} ${palette.text}`}>{icon}</span>
        <div className="min-w-0">
          <p className={`truncate text-[25px] font-bold ${palette.text}`}>{value}</p>
          <p className="text-[14px] text-[#111]">{label}</p>
        </div>
      </div>
      <button type="button" onClick={onClick} className={`mt-3 flex w-full items-center justify-between rounded-lg px-3 py-2 text-[14px] ${palette.icon} ${palette.text}`}>
        {action}<MdArrowForward />
      </button>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return <button type="button" onClick={onClick} className={`rounded-[10px] px-4 py-2 text-[15px] ${active ? "bg-white font-semibold text-[#0e2f43] shadow-sm" : "text-[#9b9b9b]"}`}>{children}</button>;
}

function EmptyState({ text }) {
  return <div className="rounded-[14px] bg-[#fafafa] px-5 py-10 text-center text-sm text-[#8b8f94]"><FaUserCircle className="mx-auto mb-2 text-3xl text-[#d6dadd]" />{text}</div>;
}

export default Home;
