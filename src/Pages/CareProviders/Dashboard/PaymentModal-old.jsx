/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { initiateProviderSubscription } from "../../../Redux/ProviderPayment";

const PaymentModal = ({
                        isOpen,
                        onClose,
                        plan, // { id, name, price, features }
                      }) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);

  const { initiating, authorizationUrl, error } = useSelector(
      (s) => s.providerPayment || {}
  );

  /* ----------------------------------------
   * Redirect to Paystack on success
   * --------------------------------------*/
  useEffect(() => {
    if (authorizationUrl && isProcessing) {
      window.location.href = authorizationUrl;
    }
  }, [authorizationUrl, isProcessing]);

  /* ----------------------------------------
   * ESC key & body scroll handling
   * --------------------------------------*/
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape" && !initiating && !isProcessing) {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, initiating, isProcessing, onClose]);

  if (!isOpen || !plan) return null;

  /* ----------------------------------------
   * Close modal safely
   * --------------------------------------*/
  const handleClose = () => {
    if (!initiating && !isProcessing) {
      setIsProcessing(false);
      onClose();
    }
  };

  /* ----------------------------------------
   * Initiate payment
   * --------------------------------------*/
  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      await dispatch(
          initiateProviderSubscription({
            planType: plan.id, // 🔑 dynamic plan id
          })
      ).unwrap();
    } catch (err) {
      console.error("Payment error:", err);

      const message =
          err?.message || "Unable to initiate payment. Please try again.";

      alert(message);
      setIsProcessing(false);
    }
  };

  const displayAmount = plan.price.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  return (
      <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: "blur(4px)" }}
          onClick={handleClose}
      >
        <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
              onClick={handleClose}
              disabled={initiating || isProcessing}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <IoMdClose size={24} />
          </button>

          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Complete Payment
              </h2>
              <p className="text-gray-500 text-sm">
                Secure payment via Paystack
              </p>
            </div>

            {/* Amount */}
            <div className="text-center mb-6">
              <div className="text-[#0093d1] text-4xl font-bold">
                {displayAmount}
              </div>
              <p className="text-gray-500 text-sm">
                {plan.name} subscription
              </p>
            </div>

            {/* Features */}
            {plan.features?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-sm mb-3">
                    What&apos;s included
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>{f}</span>
                        </li>
                    ))}
                  </ul>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Actions */}
            <button
                onClick={handlePayment}
                disabled={initiating || isProcessing}
                className={`w-full bg-[#0093d1] text-white py-3 rounded-lg font-semibold hover:bg-[#007bb0] transition ${
                    initiating || isProcessing
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                }`}
            >
              {initiating || isProcessing
                  ? "Processing..."
                  : "Proceed to Payment"}
            </button>

            {!initiating && !isProcessing && (
                <button
                    onClick={handleClose}
                    className="w-full mt-3 bg-gray-100 py-2.5 rounded-lg"
                >
                  Cancel
                </button>
            )}

            <p className="text-xs text-center text-gray-500 mt-4">
              🔒 Secure payment via{" "}
              <span className="text-[#0093d1] font-semibold">Paystack</span>
            </p>
          </div>
        </div>
      </div>
  );
};

export default PaymentModal;
