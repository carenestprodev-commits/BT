import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import PaymentModal from "./PaymentModal";
import { initiateProviderSubscription } from "../../../Redux/ProviderPayment";
import { nairaToKobo } from "../../../utils/paystackService";
import CurrencyNaira from "../../../../public/NiCurrency.svg";

function Payment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);

  const { initiating } = useSelector((s) => s.providerPayment || {});

  const plans = [
    {
      id: "full",
      title: "Full Payment",
      description: "One-time charge via payment gateway",
      amount: 1500,
      monthlyBreakdown: "12/mo",
      color: "#40a4c5",
      textColor: "text-white",
      bgColor: "bg-[#40a4c5]",
      buttonBg: "bg-[#daecf7]",
      buttonText: "text-[#73b7df]",
    },
    {
      id: "installment",
      title: "Installment Deduction",
      description: "Deducted from two (2) care service payout",
      amount: 1500,
      monthlyBreakdown: "12/mo",
      color: "white",
      textColor: "text-gray-800",
      bgColor: "bg-white",
      buttonBg: "bg-[#daecf7]",
      buttonText: "text-[#6cb3dd]",
      border: "border border-[#73b7df]",
    },
  ];

  const handleMakePayment = (plan) => {
    setSelectedPlan(plan.id);
    setSelectedAmount(plan.amount);
    setShowPaymentModal(true);
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setSelectedAmount(null);
  };

  return (
    <div className="flex min-h-screen bg-white font-sfpro">
      <Sidebar active="Setting" />
      <div className="flex-1 font-sfpro px-4 md:px-8 py-8 md:ml-64">
        <div className="mb-8 flex items-center">
          <button
            className="mr-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Payment</h2>
        </div>
        <div className="max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-lg overflow-hidden shadow-md ${
                  plan.border || ""
                }`}
              >
                <div
                  className={`${plan.bgColor} ${plan.textColor} p-6 h-full flex flex-col justify-between`}
                  style={
                    plan.bgColor === "bg-white"
                      ? {}
                      : { backgroundColor: plan.color }
                  }
                >
                  <div>
                    <div className="text-lg font-semibold">{plan.title}</div>
                    <div
                      className={`text-sm ${
                        plan.bgColor === "bg-white"
                          ? "text-gray-600"
                          : "text-white/90"
                      } mt-2`}
                    >
                      {plan.description}
                    </div>
                  </div>
                  <div className="mt-6">
                    <div
                      className={`text-3xl font-bold flex items-center ${
                        plan.bgColor === "bg-white"
                          ? "text-gray-800"
                          : "text-white"
                      }`}
                    >
                      <img
                        src={CurrencyNaira}
                        alt="Naira"
                        className="w-5 h-5 inline-block mr-2"
                      />
                      <span>{plan.amount.toLocaleString()}</span>
                    </div>
                    <div
                      className={`text-sm ${
                        plan.bgColor === "bg-white"
                          ? "text-gray-500"
                          : "text-white/80"
                      } flex items-center`}
                    >
                      <img
                        src={CurrencyNaira}
                        alt="Naira"
                        className="w-4 h-4 inline-block mr-2"
                      />
                      <span>{plan.monthlyBreakdown}</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => handleMakePayment(plan)}
                      disabled={initiating}
                      className={`w-full ${plan.buttonBg} ${plan.buttonText} py-3 rounded-md font-semibold opacity-90 hover:opacity-100 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {initiating ? "Processing..." : "Make Payment"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Information */}
          <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Information
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Secure Payment:</strong> All payments are processed
                securely through Paystack
              </p>
              <p>
                <strong>Full Payment:</strong> Pay the full amount once and get
                immediate access
              </p>
              <p>
                <strong>Installment:</strong> Spread the payment across two
                payouts from your care services
              </p>
              <p>
                <strong>Verification:</strong> You must be verified before
                making a payment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleCloseModal}
        planType={selectedPlan}
        amount={selectedAmount}
        loading={initiating}
      />
    </div>
  );
}

export default Payment;
