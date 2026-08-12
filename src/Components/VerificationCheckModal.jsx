import { useCallback, useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import VerificationPaymentModal from "./VerificationPaymentModal";
import { fetchWithAuth } from "../lib/fetchWithAuth.js";
import { BASE_URL } from "../Redux/config";
import { getUserCountry, resolveCountryIso2Sync } from "../utils/countryHelper";

export default function VerificationCheckModal({
  isOpen,
  userType = "provider",
  onProceed,
  onCancel,
  isLoading = false,
  isVerified = false,
  isSubscribed = false,
}) {
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState(null);
  const [showOutstanding, setShowOutstanding] = useState(false);

  const pendingProviderReview =
    userType === "provider" && !isVerified && isSubscribed;

  const loadPlan = useCallback(async () => {
    setPlanLoading(true);
    setPlanError(null);
    try {
      const endpoint =
        userType === "provider"
          ? "/api/payments/subscription-plans/"
          : "/api/payments/user-subscription-plans/";
      const country =
        resolveCountryIso2Sync(getUserCountry()) || "NG";
      const response = await fetchWithAuth(
        `${BASE_URL}${endpoint}?country=${country}`,
      );
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Unable to load verification fee.",
        );
      }
      const plans = Array.isArray(data) ? data : data.results || [];
      const verificationPlan = plans.find(
        (item) =>
          item.plan_kind === "verification" && item.audience === userType,
      );
      if (!verificationPlan) {
        throw new Error("Verification fee is not configured yet.");
      }
      setPlan(verificationPlan);
    } catch (error) {
      setPlan(null);
      setPlanError(error?.message || "Unable to load verification fee.");
    } finally {
      setPlanLoading(false);
    }
  }, [userType]);

  useEffect(() => {
    if (!isOpen || isVerified || pendingProviderReview) return;
    loadPlan();
  }, [isOpen, isVerified, pendingProviderReview, loadPlan]);

  if (!isOpen) return null;

  if (isVerified) {
    return (
      <VerificationPaymentModal
        isOpen
        onClose={() => {
          onProceed?.();
          onCancel?.();
        }}
        onMaybeLater={onCancel}
        statusTitle="Account Verified"
        statusMessage="Your account is already verified. You can continue with this action."
        buttonText={isLoading ? "Processing..." : "Continue"}
        maybeLaterText="Close"
        showPaymentOptions={false}
      />
    );
  }

  if (pendingProviderReview) {
    return (
      <VerificationPaymentModal
        isOpen
        onClose={onCancel}
        onMaybeLater={onCancel}
        statusTitle="Verification in progress"
        statusMessage="We received your verification payment. Your documents are being reviewed."
        buttonText="Got it"
        maybeLaterText="Close"
        showPaymentOptions={false}
      />
    );
  }

  const handleMaybeLater = () => {
    if (userType === "seeker") {
      setShowOutstanding(true);
      return;
    }
    onCancel?.();
  };

  return (
    <>
      <VerificationPaymentModal
        isOpen
        plan={plan}
        userType={userType}
        onClose={onCancel}
        onMaybeLater={handleMaybeLater}
        isLoading={planLoading}
        loadError={planError}
        onRetry={loadPlan}
      />
      {showOutstanding && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#263238]/55 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 text-[#0b2a3d] shadow-2xl">
            <button
              type="button"
              onClick={() => setShowOutstanding(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              aria-label="Close outstanding verification notice"
            >
              <IoMdClose className="h-5 w-5" />
            </button>
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-4xl text-amber-500">
              !
            </div>
            <h2 className="mb-2 text-center text-xl font-semibold text-gray-900">
              Before You Continue
            </h2>
            <p className="mb-6 text-center text-sm text-gray-500">
              You can continue using the platform for now, but your verification
              fee remains outstanding.
            </p>
            <div className="mb-6 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-gray-800">
              This fee has not been waived or cancelled. It is expected to be
              paid later.
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="mb-3 w-full rounded-lg bg-[#0d99c9] py-3 font-semibold text-white"
            >
              Continue for Now
            </button>
            <button
              type="button"
              onClick={() => setShowOutstanding(false)}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 font-semibold text-gray-700"
            >
              Pay &amp; Verify Now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
