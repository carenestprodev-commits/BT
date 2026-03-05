/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FaLock } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { initiateProviderSubscription } from "../../../Redux/ProviderPayment";
import { fetchWithAuth } from "../../../lib/fetchWithAuth.js";
import { formatCurrencyAmount } from "../../../utils/countryHelper";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const PaymentModal = ({
  isOpen,
  onClose,
  selectedPlan = null, // Expect plan object {id, name, price}
  loading = false,
}) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    initiating,
    authorizationUrl,
    error,
    localizedPrice,
    currencyCode,
    currencySymbol,
    countryUsed,
    isFallbackPrice,
  } = useSelector((s) => s.providerPayment || {});

  console.log(authorizationUrl);
  console.log(selectedPlan);
  console.log(loading);

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

  const handlePaymentOld = async () => {
    try {
      setIsProcessing(true);

      // Dispatch the thunk with the correct planId
      const result = await dispatch(
        initiateProviderSubscription({
          planType: selectedPlan.id,
          amount: plan.price,
        }),
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

  const handlePayment = async () => {
    if (!selectedPlan?.id) return alert("No plan selected");

    try {
      setIsProcessing(true);

      const response = await fetchWithAuth(
        API_URL + `/api/payments/checkout/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Include auth token if required:
            // "Authorization": `Bearer ${userToken}`
          },
          body: JSON.stringify({
            plan_id: selectedPlan.id,
            payment_gateway: "paystack",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Payment initiation failed");
        setIsProcessing(false);
        return;
      }

      // Redirect to Paystack checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert("Payment initiation failed. No checkout URL returned");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert(err?.message || "Payment initiation failed");
      setIsProcessing(false);
    }
  };

  const amount = parseFloat(displayPrice || 0);
  const displayAmount = formatCurrencyAmount(
    amount,
    displayCurrency,
    displaySymbol,
  );

  const monthlyBreakdown = formatCurrencyAmount(
    amount / 12,
    displayCurrency,
    displaySymbol,
  );

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
            {isFallbackPrice && (
              <p className="text-orange-600 text-xs sm:text-sm font-medium mt-2">
                ⚠️ Using standard pricing
              </p>
            )}
            {countryUsed && !isFallbackPrice && (
              <p className="text-xs text-gray-500 mt-1">
                Localized for {countryUsed}
              </p>
            )}
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
