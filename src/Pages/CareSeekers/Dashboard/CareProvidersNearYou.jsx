  // Check plan from localStorage
  const plan = typeof window !== "undefined" ? localStorage.getItem("careProviderPlan") : null;
import React from "react";
import { useNavigate } from "react-router-dom";
import Girl from "../../../../public/girl.svg";
import Sidebar from "./../Dashboard/Sidebar";

function CareProvidersNearYou() {
  const navigate = useNavigate();
  const [showSubscribePopup, setShowSubscribePopup] = React.useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  const [showSignupPopup, setShowSignupPopup] = React.useState(true);
  const [signupForm, setSignupForm] = React.useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const paymentDetails = {
    Free: { rate: 0, hours: 0, fee: 0, total: 0 },
    Quarterly: { rate: 13, hours: 32, fee: 7, total: 416 },
    Monthly: { rate: 13, hours: 32, fee: 7, total: 416 },
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Home" />
      <div className="flex-1 font-sfpro px-8 py-8 ml-64">
        

        {/* Main Content (Blurred when signup popup is active) */}
        <div
          // className={`font-sfpro w-full bg-white min-h-screen transition ${
          //   showSignupPopup ? "blur-sm pointer-events-none" : ""
          // }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-8 pt-8">
            <h2 className="text-3xl font-semibold text-gray-800">
              Care Providers near you
            </h2>
            {/* <div className="flex items-center">
              <span className="text-lg text-[#0093d1] font-bold">Step 8</span>
              <span className="ml-2 text-lg text-gray-500"> of 8</span>
            </div> */}
          </div>

          {/* Cards Grid */}
          <div className="px-8 pb-8">
            <div className="grid grid-cols-2 gap-6 mt-8">
              {[1, 2, 3, 4, 5, 6].map((provider, idx) => (
                <div
                  key={provider}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition"
                >
                  {/* Profile */}
                  <div className="flex items-center mb-4">
                    <img
                      src="https://randomuser.me/api/portraits/women/1.jpg"
                      alt="Provider"
                      className="w-14 h-14 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg">
                        Aleem Sarah
                      </h4>
                      <p className="text-sm text-gray-500">
                        Old Dallas, Salford, UK
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-500 mb-4 leading-snug">
                    5 years of experience with extensive ways of managing daily
                    routines for multiple children. Skilled in age-appropriate
                    activities, behavioural guidance.
                  </p>

                  {/* Experience | Rate | Rating */}
                  <div className="grid grid-cols-3 border border-gray-200 rounded-lg overflow-hidden mb-4">
                    <div className="p-2 text-center border-r border-gray-200">
                      <div className="text-xs text-gray-500">Experience</div>
                      <div className="font-semibold text-sm text-gray-700">
                        8 years
                      </div>
                    </div>
                    <div className="p-2 text-center border-r border-gray-200">
                      <div className="text-xs text-gray-500">Rate</div>
                      <div className="font-semibold text-sm text-gray-700">
                        $135/hr
                      </div>
                    </div>
                    <div className="p-2 text-center">
                      <div className="text-xs text-gray-500">Rating</div>
                      <div className="flex items-center justify-center">
                        <span className="text-yellow-400 text-base">★★★★★</span>
                        <span className="text-xs text-gray-600 ml-1">5.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-2">
                    <button
                      className={`flex-1 bg-[#0093d1] text-white py-2 rounded-md font-medium transition ${plan === "Free" && idx !== 0 ? 'opacity-50 cursor-not-allowed hover:bg-[#0093d1]' : 'hover:bg-[#007bb0]'}`}
                      onClick={() => {
                        if (plan === "Free" && idx !== 0) return;
                        navigate("/careseekers/dashboard/message_provider");
                      }}
                      disabled={plan === "Free" && idx !== 0}
                    >
                      Message
                    </button>
                    <button
                      className="flex-1 border border-[#0093d1] text-[#0093d1] py-2 rounded-md font-medium hover:bg-[#f0fbf9] transition"
                      onClick={() => navigate("/careseekers/dashboard/details", { state: { messageable: plan !== "Free" || idx === 0 } })}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareProvidersNearYou;
