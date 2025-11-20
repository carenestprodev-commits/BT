import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import Sidebar from "./Sidebar";
import pattern from "../../../../public/pattern.svg";
import folder from "../../../../public/folder.svg";
import calender from "../../../../public/calender.svg";
import provider from "../../../../public/provider.png";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSeekerDashboard } from "../../../Redux/SeekerDashboardHome";
import { fetchSeekerActiveRequests } from "../../../Redux/SeekerRequest";
import SubscriptionModal from "./SubscriptionModal";

function Home() {
  const dispatch = useDispatch();
  const {
    greeting_name,
    new_care_provider_requests,
    total_amount_spent,
    loading,
  } = useSelector((state) => state.seekerDashboard || {});

  // Check subscription status and show modal if not subscribed
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const isSubscribed = localStorage.getItem("is_subscribed") === "true";
  const justLoggedIn = localStorage.getItem("just_logged_in") === "true";
  const modalAlreadyShown =
    localStorage.getItem("subscription_modal_shown") === "true";

  useEffect(() => {
    dispatch(fetchSeekerDashboard());
    dispatch(fetchSeekerActiveRequests());

    // Show subscription modal only once after login when user is not subscribed
    if (!isSubscribed && justLoggedIn && !modalAlreadyShown) {
      setShowSubscriptionModal(true);
      try {
        localStorage.setItem("subscription_modal_shown", "true");
        localStorage.removeItem("just_logged_in");
      } catch {
        // ignore
      }
    }
  }, [dispatch, isSubscribed, justLoggedIn, modalAlreadyShown]);

  const greetingName = greeting_name || "Mark";
  const requestsCount = new_care_provider_requests ?? 0;
  const totalSpent = total_amount_spent ?? 0.0;
  const activeRequests = useSelector(
    (state) => state.seekerRequests?.active || []
  );
  const firstActive =
    activeRequests && activeRequests.length > 0 ? activeRequests[0] : null;

  return (
    <div className="flex min-h-screen font-sfpro">
      <Sidebar active="Home" />
      <div
        className={`flex-1 bg-white px-6 py-5 font-sfpro md:ml-64 ${
          showSubscriptionModal ? "blur-sm pointer-events-none" : ""
        }`}
      >
        {/* Ensure sidebar highlights Home when this component is used inside dashboard layout */}
        {/* Header */}
        <div className="border-b border-gray-200 mb-4">
          <span className="text-[#0a0a0a]   mb-4  text-2xl">Homepage</span>
        </div>

        {/* Greeting */}
        <div className="flex items-center space-x-2 mb-4">
          <FaCheckCircle className="text-[#00b894] text-lg" />
          <p className="text-black text-2xl">
            Hello, <span className="font-semibold">{greetingName}</span>
          </p>
        </div>

        {/* Care Provider Request & Spending Card */}
        <div
          className="bg-[#dff0f9] bg-opacity-40 rounded-xl p-6 relative overflow-hidden z-0"
          style={{
            backgroundImage: `url(${pattern})`,
            backgroundSize: "auto 100%",
          }}
        >
          <div className="flex items-center">
            {/* Left: New Requests */}
            <div className="text-[#0093d1] w-1/2">
              <div className="text-[40px] font-semibold leading-none">
                {loading ? "..." : requestsCount}
              </div>
              <p className="text-[13px] mt-1">New Care Providers request</p>
            </div>

            {/* Divider
    <div className="w-px h-20 bg-[#cbd5e1] mx-6" /> */}

            {/* Right: Amount Spent */}
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end text-[#0093d1] text-[28px] font-semibold leading-none">
                <img
                  src="/NiCurrency.svg"
                  alt="Naira"
                  className="w-7 h-7 mr-2"
                />
                <span>{loading ? "..." : Number(totalSpent).toFixed(2)}</span>
              </div>
              <p className="text-[13px] mt-1 text-[#0093d1]">
                Total Amount Spent
              </p>
            </div>
          </div>

          <button className="w-full mt-5 bg-[#0093d1] text-white rounded-md py-3 text-[15px] font-medium">
            View Details
          </button>
        </div>

        {/* Verify Identity */}
        <div className="bg-white rounded-xl p-4 mt-5 flex items-center justify-between border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <img src={folder} alt="Folder Icon" className="h-15 w-15" />
            <div>
              <h3 className="text-2xl font-medium text-gray-800">
                Verify Your Identity
              </h3>
              <p className="text-[13px] text-gray-500">
                Upload a verifiable government ID
              </p>
            </div>
          </div>
          <Link to="/careseekers/dashboard/verify-identity">
            <button className="bg-[#0093d1] text-white text-[14px] font-medium px-6 py-2 rounded-md">
              Verify ID
            </button>
          </Link>
        </div>

        {/* What would you like to do */}
        <h2 className="mt-8 mb-3 text-[15px] font-medium text-gray-800">
          What would you like to do today
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Book a Service Card */}
          <Link to="/careseekers/bookservice">
            <div className="bg-[#f3f9fc] rounded-xl px-4 py-6 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 shadow-sm border border-gray-100 hover:shadow-lg transition">
              <div className="p-2 rounded-md flex-shrink-0 flex items-center justify-center">
                <img
                  src={calender}
                  alt="Calendar Icon"
                  className="h-12 w-12 sm:h-15 sm:w-15"
                />
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-medium text-gray-800 mb-[2px]">
                  Book a Service
                </h4>
                <p className="text-[13px] text-gray-500 leading-snug">
                  Find Your Perfect Care provider
                </p>
              </div>
            </div>
          </Link>

          {/* Become a Care Provider Card */}
          <Link to="/careproviders/signup">
            <div className="bg-[#f2faf8] rounded-xl px-4 py-6 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 shadow-sm border border-gray-100 hover:shadow-lg transition">
              <div className="p-2 rounded-md flex-shrink-0 flex items-center justify-center">
                <img
                  src={provider}
                  alt="Provider Icon"
                  className="h-12 w-12 sm:h-15 sm:w-15"
                />
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-medium text-gray-800 mb-[2px]">
                  Become a Care provider
                </h4>
                <p className="text-[13px] text-gray-500 leading-snug">
                  Apply to Care for Families
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Appointment */}
        <h2 className="mt-8 mb-3 text-[15px] font-medium text-gray-800 ">
          What would you like to do today
        </h2>

        <div className="bg-[#f5f5f5] rounded-md flex items-center overflow-hidden py-3 hover:shadow-lg transition">
          {/* Date Column */}
          <div className="w-14 flex flex-col items-center justify-center py-3 border-r-[5px] border-[#0d99c9] rounded-l-lg">
            {/* If we have an active request, show its day and date (fallbacks provided) */}
            <p className="text-xs text-gray-500">
              {firstActive
                ? typeof firstActive.day === "string"
                  ? firstActive.day.split(" ")[0] || firstActive.day
                  : firstActive.day
                : "Wed"}
            </p>
            <p className="text-base font-semibold text-gray-700">
              {firstActive
                ? firstActive.date ??
                  (firstActive.day && firstActive.day.split(" ")[1]) ??
                  ""
                : "12"}
            </p>
          </div>

          {/* Vertical Blue Line */}
          <div className="w-[2px] h-full bg-[#0093d1] " />

          {/* Content */}
          <div className="flex items-center px-4 py-3 space-x-3 flex-1">
            <img
              src={
                firstActive
                  ? firstActive.avatar
                  : "https://randomuser.me/api/portraits/women/1.jpg"
              }
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <p className="text-lg font-medium text-gray-800 leading-tight">
                {firstActive
                  ? firstActive.title
                  : "Child care with Aleem Sarah"}
              </p>
              <p className="text-sm text-gray-500">
                {firstActive ? firstActive.time : "06:45 AM - 13:00 PM"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}
    </div>
  );
}

export default Home;
