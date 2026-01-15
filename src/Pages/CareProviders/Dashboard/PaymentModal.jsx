/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { initiateProviderSubscription } from "../../../Redux/ProviderPayment";

const PaymentModal = ({
  isOpen,
  onClose,
  planType = "monthly",
  amount = 80000,
  loading = false,
}) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const { initiating, authorizationUrl, error, reference } = useSelector(
    (s) => s.providerPayment || {}
  );

  useEffect(() => {
    // If payment is initiated successfully, redirect to Paystack
    if (authorizationUrl && isProcessing) {
      window.location.href = authorizationUrl;
    }
  }, [authorizationUrl, isProcessing]);

  // Close modal handler
  const handleClose = () => {
    if (!isProcessing && !initiating) {
      setIsProcessing(false);
      onClose();
    }
  };

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && !isProcessing && !initiating) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isProcessing, initiating, onClose]);

  if (!isOpen) return null;

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Dispatch the payment initiation thunk (planType and amount not needed anymore)
      const result = await dispatch(
        initiateProviderSubscription({
          planType: 2, // plan_id is hardcoded in the service
          amount: 0, // amount is not needed by backend
        })
      ).unwrap();

      // If successful, the useEffect will handle the redirect
      if (result && result.authorizationUrl) {
        // Redirect will happen in useEffect
      } else {
        alert("Payment initiation failed. Please try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      const errorMessage = err?.message || err || "Failed to process payment";

      // Check if it's an authentication error
      if (
        errorMessage.includes("session has expired") ||
        errorMessage.includes("log in again")
      ) {
        alert("Your session has expired. Please log in again.");
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else {
        alert(errorMessage);
      }
      setIsProcessing(false);
    }
  };

  const displayAmount = amount.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md my-8 relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
          disabled={isProcessing || initiating}
          aria-label="Close modal"
        >
          <IoMdClose className="w-6 h-6" />
        </button>

        {/* Content Container with Padding */}
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 pr-8">
              Complete Payment
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm">
              Secure payment via Paystack to activate your subscription
            </p>
          </div>

          {/* Price Display */}
          <div className="mb-6 text-center">
            <div className="text-[#0093d1] text-3xl sm:text-4xl font-bold mb-1">
              {displayAmount}
            </div>
            <p className="text-gray-500 text-xs sm:text-sm">
              One-time subscription payment
            </p>
          </div>

          {/* Payment Info */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-gray-800 font-semibold text-sm mb-3">
              What&apos;s included:
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                <span>Access to all job listings</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                <span>Direct messaging with Care Seekers</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                <span>Profile boost and visibility</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                <span>Priority support</span>
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={isProcessing || initiating || loading}
              className={`w-full bg-[#0093d1] text-white py-3 sm:py-3.5 rounded-lg font-semibold text-sm sm:text-base hover:bg-[#007bb0] transition-all duration-200 shadow-md hover:shadow-lg ${
                isProcessing || initiating || loading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isProcessing || initiating || loading
                ? "Processing..."
                : "Proceed to Payment"}
            </button>

            {/* Cancel Button (optional, shown when not processing) */}
            {!isProcessing && !initiating && (
              <button
                onClick={handleClose}
                className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}

            {/* Payment Provider Info */}
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 pt-2">
              <span className="text-yellow-600">🔒</span>
              <span>
                Secure payment via{" "}
                <span className="text-[#0093d1] font-semibold">Paystack</span>
              </span>
            </div>

            {/* Additional Info */}
            <p className="text-xs text-center text-gray-500 pt-2">
              By clicking &quot;Proceed to Payment&quot;, you agree to our Terms
              and Conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
