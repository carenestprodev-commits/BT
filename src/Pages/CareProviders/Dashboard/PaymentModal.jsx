/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { initiateProviderSubscription } from "../../../Redux/ProviderPayment";
import { formatCurrencyAmount } from "../../../utils/countryHelper";

const PaymentModal = ({ isOpen, onClose, selectedPlan, plan }) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const activePlan = selectedPlan || plan;

  // Redux slice for payment
  const {
    initiating,
    authorizationUrl,
    error,
    localizedPrice,
    currencyCode,
    currencySymbol,
    countryUsed,
    isFallbackPrice,
    gatewayError,
    supportedGateways,
  } = useSelector((s) => s.providerPayment || {});

  // Automatically redirect to Paystack when authorizationUrl is available
  useEffect(() => {
    if (authorizationUrl && isProcessing) {
      window.location.href = authorizationUrl;
    }
  }, [authorizationUrl, isProcessing]);

  // Close modal if ESC key is pressed
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && !isProcessing && !initiating) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden"; // prevent scroll
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isProcessing, initiating, onClose]);

  if (!isOpen || !activePlan) return null;

  // Use localized price if available, otherwise use plan price
  const displayPrice =
    localizedPrice !== null ? localizedPrice : activePlan.price;
  const displayCurrency = currencyCode || "NGN";
  const displaySymbol = currencySymbol || "₦";

  const displayAmount = formatCurrencyAmount(
    displayPrice,
    displayCurrency,
    displaySymbol,
  );

  // Trigger payment
  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      const result = await dispatch(
        initiateProviderSubscription({ planType: activePlan.id }),
      ).unwrap();

      if (result?.authorizationUrl) {
        window.location.href = result.authorizationUrl;
        return;
      }

      setIsProcessing(false);
      alert("Payment initiation failed. No checkout URL returned");
    } catch (err) {
      alert(err.message || "Payment initiation failed");
      setIsProcessing(false);
    }
  };

  // Close modal handler
  const handleClose = () => {
    if (!isProcessing && !initiating) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md my-8 relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
          disabled={isProcessing || initiating}
          aria-label="Close modal"
        >
          <IoMdClose className="w-6 h-6" />
        </button>

        {/* Modal content */}
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
            {isFallbackPrice && (
              <p className="text-orange-600 text-xs sm:text-sm font-medium mt-2">
                ⚠️ Using standard pricing
              </p>
            )}
            {countryUsed && !isFallbackPrice && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Localized for {countryUsed}
              </p>
            )}
          </div>

          {/* Payment Info */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-gray-800 font-semibold text-sm mb-3">
              What's included:
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

          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-xs sm:text-sm font-medium mb-2">
                {error}
              </p>
              {gatewayError && supportedGateways?.length > 0 && (
                <div className="mt-2 text-xs text-red-700">
                  <p className="font-medium mb-1">Available payment methods:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {supportedGateways.map((gateway) => (
                      <li key={gateway}>{gateway}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={isProcessing || initiating}
              className={`w-full bg-[#0093d1] text-white py-3 sm:py-3.5 rounded-lg font-semibold text-sm sm:text-base hover:bg-[#007bb0] transition-all duration-200 shadow-md hover:shadow-lg ${
                isProcessing || initiating
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isProcessing || initiating
                ? "Processing..."
                : "Proceed to Payment"}
            </button>

            {!isProcessing && !initiating && (
              <button
                onClick={handleClose}
                className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}

            {/* Payment provider info */}
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 pt-2">
              <span className="text-yellow-600">🔒</span>
              <span>
                Secure payment via{" "}
                <span className="text-[#0093d1] font-semibold">Paystack</span>
              </span>
            </div>

            <p className="text-xs text-center text-gray-500 pt-2">
              By clicking "Proceed to Payment", you agree to our Terms and
              Conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
