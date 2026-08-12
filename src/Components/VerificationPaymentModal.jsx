import { useEffect, useMemo, useState } from "react";
import { FaCheck, FaLock, FaShieldAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { fetchWithAuth } from "../lib/fetchWithAuth.js";
import { BASE_URL } from "../Redux/config";
import {
  getUserCountry,
  resolveCountryIso2Sync,
} from "../utils/countryHelper";

const money = (value, symbol) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `${symbol || ""}${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const planValue = (plan, ...keys) => {
  for (const key of keys) {
    if (plan?.[key] !== undefined && plan?.[key] !== null) return plan[key];
  }
  return null;
};

const planCountry = (plan) =>
  resolveCountryIso2Sync(
    planValue(plan, "country_used", "countryUsed") || getUserCountry(),
  ) || "NG";

const planAmount = (plan) =>
  Number(
    String(
      planValue(plan, "localized_price", "localizedPrice", "price") || 0,
    ).replace(/,/g, ""),
  );

const planSymbol = (plan) => {
  const symbol = planValue(plan, "currency_symbol", "currencySymbol");
  if (symbol) return symbol;
  return planValue(plan, "currency_code", "currencyCode") === "NGN"
    ? "₦"
    : planCountry(plan) === "NG"
      ? "₦"
      : "$";
};

const getErrorMessage = (data, fallback) =>
  data?.error || data?.message || data?.detail || fallback;

export default function VerificationPaymentModal({
  isOpen,
  plan,
  userType = "seeker",
  onClose,
  onMaybeLater,
  isLoading = false,
  loadError = null,
  onRetry,
  statusTitle = null,
  statusMessage = null,
  buttonText = "Proceed to Payment",
  maybeLaterText = "Maybe Later",
  showPaymentOptions = true,
  gateway = null,
}) {
  const [paymentOption, setPaymentOption] = useState("full");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const total = useMemo(() => planAmount(plan), [plan]);
  const symbol = useMemo(() => planSymbol(plan), [plan]);
  const paymentGateway =
    gateway || (planCountry(plan) === "NG" ? "paystack" : "stripe");
  const half = total / 2;

  useEffect(() => {
    if (!isOpen) return undefined;
    setPaymentOption("full");
    setIsProcessing(false);
    setPaymentError(null);
    return undefined;
  }, [isOpen, plan]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isProcessing) onClose?.();
    };
    window.addEventListener("keydown", handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose, isProcessing]);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (isProcessing || (!plan && showPaymentOptions)) return;
    if (!showPaymentOptions) {
      onClose?.();
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    try {
      const endpoint =
        userType === "provider"
          ? "/api/payments/provider-plans/subscribe/"
          : "/api/payments/checkout/";
      const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: plan.id,
          payment_gateway: paymentGateway,
          country: planCountry(plan),
          ...(userType === "provider"
            ? { payment_option: paymentOption }
            : {}),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Payment initiation failed."));
      }

      const checkoutUrl = data.checkout_url || data.authorization_url;
      if (!checkoutUrl) throw new Error("Payment link was not returned.");
      window.location.assign(checkoutUrl);
    } catch (error) {
      setPaymentError(error?.message || "Payment initiation failed.");
      setIsProcessing(false);
    }
  };

  const close = () => {
    if (!isProcessing) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#263238]/90 px-3 py-4 backdrop-blur-[2px] sm:px-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      role="presentation"
    >
      <section
        aria-modal="true"
        aria-labelledby="verification-modal-title"
        className="relative max-h-[calc(100dvh-32px)] w-full max-w-[430px] overflow-y-auto rounded-[8px] bg-white px-3.5 py-4 text-[#0b2a3d] shadow-[0_24px_80px_rgba(5,20,26,0.35)] sm:px-5 sm:py-5"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          type="button"
          onClick={close}
          disabled={isProcessing}
          aria-label="Close verification modal"
          className="absolute right-3 top-3 rounded p-1 text-[#0b2a3d] transition hover:bg-[#eef8fb] disabled:cursor-not-allowed disabled:opacity-40 sm:right-4 sm:top-4"
        >
          <IoMdClose className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#effaff] sm:h-[76px] sm:w-[76px]">
          <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full border border-dashed border-[#a8dff1]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0d99c9] text-white shadow-sm">
              <FaShieldAlt className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="mt-2.5 text-center sm:mt-3">
          <h2
            id="verification-modal-title"
            className="text-[16px] font-extrabold leading-tight text-[#101010] sm:text-[18px]"
          >
            {statusTitle || "Verify Your Account"}
          </h2>
          <p className="mx-auto mt-1.5 max-w-[350px] text-[10px] leading-[1.35] text-[#858585] sm:text-[11px]">
            {statusMessage ||
              "To help keep care seekers and families safe, complete account verification, including identity verification and a comprehensive background check."}
          </p>
        </div>

        {isLoading ? (
          <div className="mt-5 space-y-2.5" aria-live="polite">
            <div className="h-20 animate-pulse rounded-lg bg-[#eef7fa]" />
            <div className="h-12 animate-pulse rounded-lg bg-[#f3f5f6]" />
            <div className="h-12 animate-pulse rounded-lg bg-[#f3f5f6]" />
          </div>
        ) : loadError ? (
          <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-3 text-center text-xs text-red-700">
            <p>{loadError}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 font-semibold text-[#0d99c9] underline"
              >
                Try again
              </button>
            )}
          </div>
        ) : statusMessage ? (
          <div className="mt-5 rounded-lg border border-[#bce8f5] bg-[#f0fbfe] p-3 text-center text-xs text-[#315667]">
            Verification is being reviewed. We&apos;ll notify you when it is
            approved.
          </div>
        ) : (
          <>
            <div className="relative mt-5 overflow-hidden rounded-lg bg-[radial-gradient(circle_at_92%_100%,#b8e8f8,transparent_52%),linear-gradient(130deg,#effaff,#e7f7fc)] px-3 py-2.5 text-center sm:mt-6">
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#0d99c9] sm:text-[11px]">
                <span className="h-px w-12 bg-[#a9ddea]" />
                Verification Fee
                <span className="h-px w-12 bg-[#a9ddea]" />
              </div>
              <div className="mt-1.5 text-[25px] font-extrabold tracking-tight text-[#101010] sm:text-[30px]">
                {money(total, symbol)}
              </div>
              <span className="mt-1 inline-flex rounded-full border border-[#0d99c9] px-2 py-0.5 text-[8px] font-medium leading-none text-[#0d99c9] sm:text-[9px]">
                one-time payment
              </span>
            </div>

            <div className="my-2 border-t border-[#edf0f1] sm:my-2.5" />
            <p className="text-[11px] font-bold text-[#0b2a3d] sm:text-xs">
              Choose how you want to pay
            </p>

            <div className="mt-2.5 space-y-2.5">
              <PaymentOption
                selected={paymentOption === "full"}
                onClick={() => setPaymentOption("full")}
                title="Pay in Full"
                subtitle="Pay the full amount now"
                amount={money(total, symbol)}
              />
              {userType === "provider" && (
                <PaymentOption
                  selected={paymentOption === "half"}
                  onClick={() => setPaymentOption("half")}
                  title="Pay in installments"
                  subtitle="Split into 2 payments"
                  amount={`2 x ${money(half, symbol)}`}
                />
              )}
            </div>
          </>
        )}

        {paymentError && (
          <p className="mt-2.5 rounded-md bg-red-50 px-3 py-2 text-center text-[11px] text-red-700">
            {paymentError}
          </p>
        )}

        <div className="mt-3.5 space-y-2.5 sm:mt-4">
          <button
            type="button"
            onClick={handlePayment}
            disabled={isLoading || Boolean(loadError) || isProcessing || (!plan && showPaymentOptions)}
            className="w-full rounded-md bg-[#0d99c9] py-2.5 text-[12px] font-bold text-white transition hover:bg-[#087fa8] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-sm"
          >
            {isProcessing ? "Processing..." : buttonText}
          </button>
          <button
            type="button"
            onClick={onMaybeLater || close}
            disabled={isProcessing}
            className="w-full rounded-md border border-[#d5d5d5] bg-white py-2.5 text-[12px] font-medium text-[#555] transition hover:bg-[#f8fafb] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-sm"
          >
            {maybeLaterText}
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-[#666] sm:mt-3.5 sm:text-[11px]">
          <FaLock className="h-2.5 w-2.5 text-[#89908f]" />
          Secure payment via
          <span className="font-semibold text-[#0d99c9]">
            {paymentGateway === "stripe" ? "Stripe" : "Paystack"}
          </span>
        </div>
      </section>
    </div>
  );
}

function PaymentOption({ selected, onClick, title, subtitle, amount }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left transition active:scale-[0.995] sm:px-3 ${
        selected
          ? "border-[#0d99c9] bg-[#f3fbfe]"
          : "border-[#dfe3e5] bg-white hover:border-[#9fdced]"
      }`}
    >
      <span
        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
          selected
            ? "border-[#0d99c9] bg-[#0d99c9] text-white"
            : "border-[#d6dfe2] bg-white"
        }`}
      >
        {selected && <FaCheck className="h-2 w-2" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold text-[#0b2a3d] sm:text-[11px]">
          {title}
        </span>
        <span className="block text-[9px] leading-tight text-[#8a8a8a] sm:text-[10px]">
          {subtitle}
        </span>
      </span>
      <span className="shrink-0 text-[10px] font-bold text-[#0b2a3d] sm:text-[11px]">
        {amount}
      </span>
    </button>
  );
}
