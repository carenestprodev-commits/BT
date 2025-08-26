import React from "react";
 import Girl from "../../../../public/girl.svg";
import { Link } from "react-router-dom";


function CareProvidersNearYou() {
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
    <>
      {/* Signup Blur Overlay */}
      {showSignupPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 font-sfpro">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-full p-8 dark:bg-white">
            <img
              src={Girl}
              alt="Signup Illustration"
              className="w-32 h-32 mx-auto mb-4"
            />
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-1">
              Sign Up to View Care Providers near you 
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Kindly enter your email address below to view care providers near you.
            </p>
            <input
              type="email"
              placeholder="Email"
              value={signupForm.email}
              onChange={(e) =>
                setSignupForm({ ...signupForm, email: e.target.value })
              }
              className="w-full mb-3 p-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={signupForm.password}
              onChange={(e) =>
                setSignupForm({ ...signupForm, password: e.target.value })
              }
              className="w-full mb-3 p-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={signupForm.confirmPassword}
              onChange={(e) =>
                setSignupForm({
                  ...signupForm,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full mb-6 p-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400"
            />
            <button
              className="w-full bg-[#0093d1] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition"
              onClick={() => {
                // close signup modal and show subscribe popup before navigating
                setShowSignupPopup(false);
                setShowSubscribePopup(true);
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}


      {/* Main Content (Blurred when signup popup is active) */}
      <div
        className={`font-sfpro w-full bg-white min-h-screen transition ${
          showSignupPopup || showSubscribePopup || showPaymentPopup ? "blur-sm pointer-events-none" : ""
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 pt-8">
          <h2 className="text-3xl font-semibold text-gray-800">
            Care Providers near you 
          </h2>
          <div className="flex items-center">
            <span className="text-lg text-[#0093d1] font-bold">Step 8</span>
            <span className="ml-2 text-lg text-gray-500"> of 8</span>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-2 gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6].map((provider) => (
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
                    className="flex-1 bg-[#0093d1] text-white py-2 rounded-md font-medium hover:bg-[#007bb0] transition"
                    onClick={() => setShowSubscribePopup(true)}
                  >
                    Interested
                  </button>
                  <button className="flex-1 border border-[#0093d1] text-[#0093d1] py-2 rounded-md font-medium hover:bg-[#f0fbf9] transition">
                    Not Interested
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscribe Popup */}
      {showSubscribePopup && !showPaymentPopup && (
        <div className="font-sfpro fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-full relative flex flex-col items-center p-8">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold z-10"
              onClick={() => setShowSubscribePopup(false)}
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={Girl}
              alt="Subscribe Illustration"
              className="w-32 h-32 mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
              Subscribe to have unlimited
              <br />
              access to Care Provider
            </h2>
            <div className="grid grid-cols-3 gap-4 mt-6 w-full">
              {/* Free */}
                <div
                  className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
                  onClick={() => {
                      setSelectedPlan("Free");
                      setShowSubscribePopup(false);
                      localStorage.setItem("careProviderPlan", "Free");
                      window.location.href = "/careseekers/dashboard/";
                    }}
                >
                <div className="text-lg font-bold text-gray-800 mb-1">Free</div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  $00.00
                </div>
                <button className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded mt-2">
                  Limited
                </button>
              </div>
              {/* Quarterly */}
              <div
                className="bg-[#0093d1] border border-[#0093d1] rounded-xl p-4 flex flex-col items-center text-white cursor-pointer hover:shadow-lg transition"
                onClick={() => {
                  setSelectedPlan("Quarterly");
                  localStorage.setItem("careProviderPlan", "Quarterly");
                  setShowPaymentPopup(true);
                }}
              >
                <div className="text-lg font-bold mb-1">Quarterly</div>
                <div className="text-2xl font-bold mb-1">$68.99</div>
                <div className="text-xs mb-1">($12.22/mo)</div>
                <button className="bg-white text-[#0093d1] text-xs px-3 py-1 rounded mt-2">
                  32% off
                </button>
              </div>
              {/* Monthly */}
              <div
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
                onClick={() => {
                  setSelectedPlan("Monthly");
                  localStorage.setItem("careProviderPlan", "Monthly");
                  setShowPaymentPopup(true);
                }}
              >
                <div className="text-lg font-bold text-gray-800 mb-1">
                  Monthly
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  $23.99
                </div>
                <button className="bg-blue-50 text-[#0093d1] text-xs px-3 py-1 rounded mt-2">
                  10% off
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Popup */}
      {showPaymentPopup && (
        <div className="font-sfpro fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-full relative flex flex-col items-center p-8">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold z-10"
              onClick={() => {
                setShowPaymentPopup(false);
                setShowSubscribePopup(false);
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
              Proceed to Payment
            </h2>
            <p className="text-sm text-gray-500 mb-6 text-center">
              Are you sure you want to proceed to payment?
            </p>
            <div className="w-full bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex justify-between mb-2 text-gray-700">
                <span>Rate per hour</span>
                <span>${paymentDetails[selectedPlan]?.rate ?? 13}</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-700">
                <span>Total hours</span>
                <span>{paymentDetails[selectedPlan]?.hours ?? 32}</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-700">
                <span>Service Fee</span>
                <span>${paymentDetails[selectedPlan]?.fee ?? 7}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-gray-800 text-lg">
                <span>Total Amount</span>
                <span>${paymentDetails[selectedPlan]?.total ?? 416}.00</span>
              </div>
            </div>
            <Link to="/careseekers/dashboard/">
            <button className="w-full bg-[#0093d1] text-white py-3 px-20 rounded-lg font-semibold text-lg mb-3 hover:bg-[#007bb0] transition">
              Proceed to Payment
            </button>
            </Link>
            <button
              className="w-full border border-[#0093d1] text-[#0093d1] py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition"
              onClick={() => {
                setShowPaymentPopup(false);
                setShowSubscribePopup(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default CareProvidersNearYou;
