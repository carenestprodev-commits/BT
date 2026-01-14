/* eslint-disable no-unused-vars */
import React from "react";
import Girl from "../../../../public/girl.svg";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

function CareProvidersNearYou() {
  const [showSubscribePopup, setShowSubscribePopup] = React.useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const paymentDetails = {
    Free: { rate: 0, hours: 0, fee: 0, total: 0 },
    Quarterly: { rate: 13, hours: 32, fee: 7, total: 416 },
    Monthly: { rate: 13, hours: 32, fee: 7, total: 416 },
  };

  return (
    <>
      {/* Main Content */}
      <div
        className={`font-sfpro w-full bg-white min-h-screen transition ${
          showSubscribePopup || showPaymentPopup
            ? "blur-sm pointer-events-none"
            : ""
        }`}
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center px-4 lg:px-8 pt-6 lg:pt-8 gap-3 lg:gap-0">
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800">
            Care Providers near you
          </h2>
          <div className="flex items-center">
            <span className="text-base lg:text-lg text-[#0093d1] font-bold">
              Step 8
            </span>
            <span className="ml-2 text-base lg:text-lg text-gray-500">
              of 8
            </span>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="px-4 lg:px-8 pb-6 lg:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-6 lg:mt-8">
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
                    className="w-12 h-12 lg:w-14 lg:h-14 rounded-full mr-3 lg:mr-4 object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">Aleem Sarah</h4>
                    <p className="text-sm text-gray-500">
                      Old Dallas, Salford, UK
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-500 mb-4">
                  5 years of experience managing daily routines for children.
                  Skilled in age-appropriate activities and behavioural
                  guidance.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 border border-gray-200 rounded-lg mb-4">
                  <div className="p-2 text-center border-r">
                    <div className="text-xs text-gray-500">Experience</div>
                    <div className="font-semibold text-blue-400">8 years</div>
                  </div>
                  <div className="p-2 text-center border-r">
                    <div className="text-xs text-gray-500">Rate</div>
                    <div className="font-semibold text-blue-400">₦3000/hr</div>
                  </div>
                  <div className="p-2 text-center">
                    <div className="text-xs text-gray-500">Rating</div>
                    <div className="text-yellow-400">★★★★★ 5.0</div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-[#0093d1] text-white py-2 rounded-md hover:bg-[#007bb0]"
                    onClick={() => setShowSubscribePopup(true)}
                  >
                    Interested
                  </button>
                  <button className="flex-1 border border-[#0093d1] text-[#0093d1] py-2 rounded-md hover:bg-blue-50">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] p-8 relative">
            <button
              className="absolute top-4 right-4 text-2xl text-red-500 font-bold"
              onClick={() => setShowSubscribePopup(false)}
            >
              ×
            </button>

            <img src={Girl} alt="" className="w-32 mx-auto mb-4" />

            <h2 className="text-xl font-semibold text-center mb-6 text-blue-400">
              Subscribe to access Care Providers
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div
                className="bg-[#0093d1] text-white rounded-xl p-4 text-center cursor-pointer"
                onClick={() => {
                  setSelectedPlan("Quarterly");
                  setShowPaymentPopup(true);
                }}
              >
                <h3 className="font-bold text-blue-400">Quarterly</h3>
                <p className="text-blue-400">₦12,000</p>
              </div>

              <div
                className="border rounded-xl p-4 text-center cursor-pointer"
                onClick={() => {
                  setSelectedPlan("Monthly");
                  setShowPaymentPopup(true);
                }}
              >
                <h3 className="font-bold text-blue-400">Monthly</h3>
                <p className="text-blue-400">₦5,000</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Popup */}
      {showPaymentPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] p-8 relative">
            <button
              className="absolute top-4 right-4 text-2xl text-red-500 font-bold"
              aria-label="Close payment popup"
              onClick={() => setShowPaymentPopup(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              Proceed to Payment
            </h2>

            <div className="mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="text-gray-500">
                  ₦{paymentDetails[selectedPlan]?.total}.00
                </span>
              </div>
            </div>

            <Link to="/careseekers/dashboard/careproviders">
              <button className="w-full bg-[#0093d1] text-white py-3 rounded-lg">
                Proceed
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default CareProvidersNearYou;
