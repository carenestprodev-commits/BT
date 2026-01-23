import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initiateSeekerCheckout } from "../../../Redux/SeekerPayment";
import { nairaToKobo } from "../../../utils/paystackService";
import { fetchWithAuth } from "../../../lib/fetchWithAuth";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function SubscriptionModal({ onClose, imageSrc }) {
  const dispatch = useDispatch();

  const { initiating, authorizationUrl, error } = useSelector(
      (s) => s.seekerPayment || {}
  );

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [processing, setProcessing] = useState(false);

  /* ---------------- Fetch subscription plans ---------------- */
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await fetchWithAuth(
            API_URL + "/api/payments/user-subscription-plans/"
        );

        if (!res.ok) throw new Error("Failed to fetch plans");

        const data = await res.json();

        setPlans(data);

        // Auto-select first plan
        if (data.length > 0) {
          setSelectedPlanId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlans();
  }, []);

  /* ---------------- Redirect to Paystack ---------------- */
  useEffect(() => {
    if (authorizationUrl) {
      window.location.href = authorizationUrl;
    }
  }, [authorizationUrl]);

  /* ---------------- Continue button ---------------- */
  const handleContinue = async () => {
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) return;

    try {
      setProcessing(true);

      const result = await dispatch(
          initiateSeekerCheckout({
            bookingId: 0,
            amount: nairaToKobo(plan.price),
            bookingDetails: {
              plan_id: plan.id,
              payment_gateway: "paystack",
            },
          })
      ).unwrap();

      console.log(result);

      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      }
    } catch (err) {
      console.error("Checkout failed", err);
      setProcessing(false);
    }
  };

  const imgSrc = imageSrc || "/subscription.svg";

  /* ---------------- UI ---------------- */
  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white w-[720px] max-w-full rounded-2xl p-8 relative shadow-2xl">
          <button
              onClick={onClose}
              disabled={processing || initiating}
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>

          <div className="flex flex-col items-center text-center">
            <img
                src={imgSrc}
                alt="Subscription"
                className="w-40 h-40 object-contain mb-6"
            />

            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Choose a subscription plan
            </h2>

            {/* Plans */}
            {loadingPlans ? (
                <p className="text-gray-500">Loading plans...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {plans.map((plan) => {
                    const selected = selectedPlanId === plan.id;

                    return (
                        <div
                            key={plan.id}
                            onClick={() => !processing && setSelectedPlanId(plan.id)}
                            className={`cursor-pointer rounded-xl border p-6 transition ${
                                selected
                                    ? "bg-[#0aa0d6] text-white shadow-lg border-transparent"
                                    : "bg-white text-gray-800 border-gray-200 hover:shadow"
                            }`}
                        >
                          <h3 className="font-medium mb-2">{plan.name}</h3>

                          <div className="text-3xl font-bold mb-1">
                            ₦{plan.price.toLocaleString()}
                          </div>

                          <p
                              className={`text-sm ${
                                  selected ? "opacity-80" : "text-gray-500"
                              }`}
                          >
                            {plan.interval}
                          </p>
                        </div>
                    );
                  })}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mt-4 w-full bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* CTA */}
            <button
                onClick={handleContinue}
                disabled={processing || initiating || loadingPlans}
                className={`mt-8 bg-[#0093d1] hover:bg-[#007bb0] text-white px-10 py-3 rounded-md font-medium transition ${
                    processing || initiating
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                }`}
            >
              {processing || initiating ? "Processing..." : "Continue"}
            </button>

            <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
              🔒 Secure payment via <span className="font-semibold">Paystack</span>
            </p>
          </div>
        </div>
      </div>
  );
}

export default SubscriptionModal;
