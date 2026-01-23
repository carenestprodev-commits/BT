/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FaLock } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { initiateProviderSubscription } from "../../../Redux/ProviderPayment";

const PaymentModal = ({
                        isOpen,
                        onClose,
                        selectedPlan = null, // Expect plan object {id, name, price}
                        loading = false,
                      }) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const { initiating, authorizationUrl, error } = useSelector(
      (s) => s.providerPayment || {}
  );

  // Redirect immediately if authorization URL is returned
  useEffect(() => {
    if (authorizationUrl && isProcessing) {
      window.location.href = authorizationUrl;
    }
  }, [authorizationUrl, isProcessing]);

  const handleClose = () => {
    if (!isProcessing && !initiating) {
      setIsProcessing(false);
      onClose();
    }
  };



  // Close modal on ESC key and prevent scroll
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

  if (!isOpen || !selectedPlan) return null;

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Dispatch the thunk with the correct planId
      const result = await dispatch(
          initiateProviderSubscription({ planId: selectedPlan.id })
      ).unwrap();

      // Redirect immediately
      if (result?.authorizationUrl) {
        window.location.href = result.authorizationUrl;
      } else {
        alert("Payment initiation failed. Please try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      const message = err?.message || "Payment initiation failed";
      alert(message);
      setIsProcessing(false);
    }
  };

  const amount = parseFloat(selectedPlan.price || 0);
  const displayAmount = amount.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  const monthlyBreakdown = (amount / 12).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  });

  return (
      <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: "blur(2px)" }}
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

          <div className="p-8 pt-10">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedPlan.name}
              </h2>
              <p className="text-gray-500 text-sm leading-snug">
                One-time payment via secure gateway
              </p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-[#0093d1] text-5xl font-bold mb-2 tracking-tight drop-shadow-sm">
                {displayAmount}
              </div>
              <p className="text-gray-500 text-base font-medium">
                ≈ {monthlyBreakdown} / month
              </p>
            </div>

            <hr className="border-gray-200 mb-6" />

            <div className="mb-8">
              <h3 className="text-gray-800 font-semibold text-base mb-1">
                One-time payment only
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Monthly breakdown is for display purposes — no recurring charges.
              </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
            )}

            {/* Payment Button */}
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

              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <FaLock className="w-3 h-3 text-[#BFA15F]" />
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
