/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FaLock } from "react-icons/fa"; // Importing Lock icon for better match
import { useDispatch, useSelector } from "react-redux";
import { initiateSeekerCheckout } from "../../../Redux/SeekerPayment";

const PaymentModal = ({
  isOpen,
  onClose,
  planType = "monthly",
  amount = 30000, // Updated default to match image
  loading = false,
}) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const { initiating, authorizationUrl, error, reference } = useSelector(
    (s) => s.seekerPayment || {}
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

      // Dispatch the payment initiation thunk
      const result = await dispatch(
        initiateSeekerCheckout({
          bookingId: 0,
          amount: amount,
          bookingDetails: { verification: true },
        })
      ).unwrap();

      if (result && result.authorizationUrl) {
        // Redirect will happen in useEffect
      } else {
        alert("Payment initiation failed. Please try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      const errorMessage = err?.message || err || "Failed to process payment";

      if (
        errorMessage.includes("session has expired") ||
        errorMessage.includes("log in again")
      ) {
        alert("Your session has expired. Please log in again.");
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

  // Calculate monthly breakdown for display purposes (e.g. 1500 / 12)
  const monthlyBreakdown = (amount / 12).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  });

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{
        backdropFilter: "blur(2px)",
      }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[400px] relative animate-fade-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors z-10"
          disabled={isProcessing || initiating}
          aria-label="Close modal"
        >
          <IoMdClose className="w-6 h-6" />
        </button>

        {/* Content Container */}
        <div className="p-8 pt-10">
          {/* Header Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Full Payment
            </h2>
            <p className="text-gray-500 text-sm leading-snug">
              One-time verification fee via secure payment gateway
            </p>
          </div>

          {/* Price Display Section */}
          <div className="mb-6">
            <div className="text-[#0093d1] text-5xl font-bold mb-2 tracking-tight drop-shadow-sm">
              {displayAmount}
            </div>
            <p className="text-gray-500 text-base font-medium">
              ≈ {monthlyBreakdown} / month
            </p>
          </div>

          {/* Divider Line */}
          <hr className="border-gray-200 mb-6" />

          {/* Explanatory Text */}
          <div className="mb-8">
            <h3 className="text-gray-800 font-semibold text-base mb-1">
              This is a one-time payment.
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              The monthly amount is for cost breakdown only — no recurring
              charges.
            </p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-4">
            <button
              onClick={handlePayment}
              disabled={isProcessing || initiating || loading}
              className={`w-full bg-[#0093d1] text-white py-3.5 rounded-lg font-semibold text-base shadow-md hover:bg-[#0082b9] hover:shadow-lg transition-all duration-200 ${
                isProcessing || initiating || loading
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
            >
              {isProcessing || initiating || loading
                ? "Processing..."
                : "Make Payment"}
            </button>

            {/* Footer - Secure Payment */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <FaLock className="w-3 h-3 text-[#BFA15F]" />{" "}
              {/* Gold/Yellowish lock icon */}
              <span>
                Secure payment via{" "}
                <span className="text-[#0093d1] font-medium">Paystack</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
