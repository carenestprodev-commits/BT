import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initiateSeekerCheckout } from "../../../Redux/SeekerPayment";
import { nairaToKobo } from "../../../utils/paystackService";

function SubscriptionModal({ onClose, imageSrc }) {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState("quarterly");
  const [isProcessing, setIsProcessing] = useState(false);
  const { initiating, authorizationUrl, error } = useSelector(
    (s) => s.seekerPayment || {}
  );

  const plans = [
    {
      id: "free",
      title: "Free",
      price: "₦00.00",
      subtitle: "Limited",
      badgeType: "muted",
      amount: 0,
    },
    {
      id: "quarterly",
      title: "Quarterly",
      price: "₦12,000",
      subtitle: "(₦3,000/mo)",
      badgeType: "primary",
      badgeText: "32% off",
      amount: 12000,
    },
    {
      id: "monthly",
      title: "Monthly",
      price: "₦5,000",
      subtitle: "",
      badgeType: "muted",
      badgeText: "10% off",
      amount: 5000,
    },
  ];

  const imgSrc = imageSrc || "/subscription.svg";

  // Redirect to Paystack when authorization URL is available
  useEffect(() => {
    if (authorizationUrl && !isProcessing) {
      window.location.href = authorizationUrl;
      setIsProcessing(false);
    }
  }, [authorizationUrl, isProcessing]);

  const handleContinue = async () => {
    // Free plan: just close
    if (selected === "free") {
      onClose && onClose();
      return;
    }

    try {
      setIsProcessing(true);

      // Get the selected plan
      const selectedPlan = plans.find((p) => p.id === selected);
      if (!selectedPlan) {
        alert("Invalid plan selected");
        setIsProcessing(false);
        return;
      }

      // Convert amount to kobo for Paystack
      const amountInKobo = nairaToKobo(selectedPlan.amount);

      // Dispatch the checkout initiation
      const result = await dispatch(
        initiateSeekerCheckout({
          bookingId: 0, // For subscription, booking ID might be 0 or handled by backend
          amount: amountInKobo,
          bookingDetails: {
            plan_type: selected,
            plan_id: selected === "quarterly" ? 1 : 2,
          },
        })
      );

      if (!result.payload?.success && result.payload?.error) {
        alert("Checkout initiation failed: " + result.payload.error);
        setIsProcessing(false);
      }
      // If successful, useEffect will handle the redirect
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[720px] max-w-full p-8 relative">
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          disabled={isProcessing || initiating}
        >
          ×
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-40 h-40 mb-6 flex items-center justify-center">
            <img
              src={imgSrc}
              alt="subscription"
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Subscribe to have unlimited <br /> access to Care Provider
          </h2>

          <div className="mt-6 w-full grid grid-cols-3 gap-4">
            {plans.map((p) => {
              const isSelected = selected === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => !isProcessing && setSelected(p.id)}
                  className={
                    `cursor-pointer rounded-lg p-6 flex flex-col items-center justify-between border transition ` +
                    (isSelected
                      ? "bg-[#0aa0d6] text-white border-transparent shadow-lg"
                      : "bg-white text-gray-800 border border-gray-100 hover:shadow")
                  }
                >
                  <div className="text-sm font-medium mb-2">{p.title}</div>
                  <div className="text-3xl font-bold mb-1">{p.price}</div>
                  <div
                    className={`text-sm ${
                      isSelected ? "opacity-80" : "text-gray-500"
                    }`}
                  >
                    {p.subtitle}
                  </div>

                  <div className="mt-4">
                    <div
                      className={
                        `px-3 py-1 rounded-md text-sm font-medium inline-block ` +
                        (p.badgeType === "primary"
                          ? isSelected
                            ? "bg-white text-[#0aa0d6]"
                            : "bg-[#e6f7fb] text-[#0aa0d6]"
                          : "bg-gray-100 text-gray-500")
                      }
                    >
                      {p.badgeText || p.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 w-full bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-6 w-full flex justify-center">
            <button
              onClick={handleContinue}
              disabled={isProcessing || initiating}
              className={`bg-[#0093d1] hover:bg-[#007bb0] text-white font-medium py-3 px-8 rounded-md transition ${
                isProcessing || initiating
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isProcessing || initiating ? "Processing..." : "Continue"}
            </button>
          </div>

          {/* Payment Info */}
          <div className="mt-6 text-xs text-gray-600 flex items-center justify-center gap-2">
            <span>🔒</span>
            <span>
              Secure payment via{" "}
              <span className="text-[#0093d1] font-semibold">Paystack</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionModal;
