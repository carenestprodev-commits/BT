import { useCallback, useEffect, useState } from "react";
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

  const pendingProviderReview =
    userType === "provider" && !isVerified && isSubscribed;

  const loadPlan = useCallback(async () => {
    // Seeker verification fee removed: no plan load needed.
    if (userType === "seeker") {
      setPlan(null);
      setPlanLoading(false);
      setPlanError(null);
      return;
    }
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
    onCancel?.();
  };

  if (userType === "seeker") {
    return (
      <VerificationPaymentModal
        isOpen
        plan={null}
        userType="seeker"
        onClose={onCancel}
        onMaybeLater={onCancel}
        isLoading={false}
        buttonText="Continue to verification"
      />
    );
  }

  return (
    <VerificationPaymentModal
      isOpen
      plan={plan}
      userType={userType}
      onClose={onCancel}
      onMaybeLater={handleMaybeLater}
      isLoading={planLoading}
      loadError={planError}
      onRetry={loadPlan}
      onDeductActivated={() => loadPlan()}
    />
  );
}
