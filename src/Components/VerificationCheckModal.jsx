import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import { formatDisplayName } from "../utils/formatDisplayName";

/**
 * VerificationCheckModal Component
 *
 * Reusable modal that checks if a user is verified before performing an action.
 * Can be used for:
 * - CareProviders applying for jobs
 * - CareSeekers booking/hiring providers
 * - Any other action requiring verified status
 *
 * @param {boolean} isOpen - Whether the modal should be displayed
 * @param {object} user - User object containing name, email, avatar, etc.
 * @param {string} userType - 'provider' or 'seeker'
 * @param {string} actionType - 'apply', 'hire', 'message', or custom action type
 * @param {function} onProceed - Callback when verified user proceeds with action (e.g., apply for job)
 * @param {function} onCancel - Callback when user chooses to cancel
 * @param {boolean} isLoading - Optional: loading state for proceed button
 * @param {boolean} isVerified - Whether the user is already verified
 * @param {boolean} isSubscribed - Provider: verification fee paid (awaiting admin). Ignored for seekers.
 */
export default function VerificationCheckModal({
  isOpen,
  user,
  userType = "provider",
  actionType = "apply",
  onProceed,
  onCancel,
  isLoading = false,
  isVerified = false,
  isSubscribed = false,
}) {
  const navigate = useNavigate();
  const [showOutstanding, setShowOutstanding] = useState(false);

  if (!isOpen) return null;

  const pendingProviderReview =
    userType === "provider" && !isVerified && isSubscribed;

  // Get context-specific messages
  const getMessages = () => {
    const messages = {
      provider: {
        apply: {
          title: "Verify Your Account",
          description:
            "To access and connect with verified care seekers, we need to confirm your identity.",
          subtitle: "Help us keep the care community safe and trusted.",
          benefit1: "Protect care providers from fake requests",
          benefit2: "Build trust and accountability",
          benefit3: "Ensure a safe experience for everyone",
          buttonText: "Proceed to Verification",
          skipText: "Maybe Later",
        },
        message: {
          title: "Verify Your Account",
          description:
            "To message Care Seekers and build trust in the community, we need to confirm your identity.",
          subtitle: "Help us keep the care community safe and trusted.",
          benefit1: "Enable direct messaging with Care Seekers",
          benefit2: "Display verified badge on your profile",
          benefit3: "Unlock premium features",
          buttonText: "Proceed to Verification",
          skipText: "Maybe Later",
        },
      },
      seeker: {
        hire: {
          title: "Verify Your Account",
          description:
            "To keep caregivers and families safe, and to start care activity, you are required to complete account verification.",
          subtitle:
            "To keep caregivers and families safe, and to have access to verified care providers you are required to complete account verification.",
          benefit1: "Identity Verification",
          benefit2: "Background checks",
          benefit3: "Secure activity start",
          buttonText: "Proceed to Payment",
          skipText: "Maybe Later",
        },
        message: {
          title: "Verify Your Account",
          description:
            "To message care providers and book services with confidence, we need to confirm your identity.",
          subtitle: "Help us keep the care community safe and trusted.",
          benefit1: "Direct messaging with care providers",
          benefit2: "Display verified badge on your profile",
          benefit3: "Secure transactions and support",
          buttonText: "Proceed to Verification",
          skipText: "Maybe Later",
        },
      },
    };

    return (
      messages[userType]?.[actionType] ||
      messages[userType]?.apply ||
      messages.provider.apply
    );
  };

  const msg = getMessages();
  const settingRoute =
    userType === "provider"
      ? "/careproviders/dashboard/setting"
      : "/careseekers/dashboard/setting";

  const handleProceedClick = () => {
    if (isVerified) {
      if (onProceed) {
        onProceed();
      }
      if (onCancel) {
        onCancel();
      }
      return;
    }
    if (pendingProviderReview) {
      if (onCancel) {
        onCancel();
      }
      return;
    }
    navigate(`${settingRoute}?tab=verify`);
    if (onCancel) {
      onCancel();
    }
  };

  const handleMaybeLater = () => {
    if (userType === "seeker") {
      setShowOutstanding(true);
      return;
    }
    onCancel?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {showOutstanding && (
        <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowOutstanding(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <IoMdClose className="w-6 h-6" />
            </button>
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50">
              <span className="text-5xl text-amber-400">!</span>
            </div>
            <h2 className="mb-2 text-center text-2xl font-semibold text-gray-900">
              Before You Continue
            </h2>
            <p className="mb-6 text-center text-sm text-gray-500">
              We&apos;re allowing you to defer your verification payment for now
              so you can continue using the platform.
            </p>
            <div className="mb-3 rounded-lg border border-cyan-100 bg-cyan-50 p-4 text-sm font-medium text-gray-800">
              However, your verification fee remains outstanding
            </div>
            <div className="mb-6 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm font-medium text-gray-800">
              This fee has not been waived, cancelled or removed, it is
              expected to be paid later
            </div>
            <button
              onClick={onCancel}
              className="mb-3 w-full rounded-lg bg-[#0093d1] py-3.5 font-semibold text-white"
            >
              Continue for Now
            </button>
            <button
              onClick={handleProceedClick}
              className="w-full rounded-lg border border-gray-300 bg-white py-3.5 font-semibold text-gray-700"
            >
              Pay & Verify Now
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <IoMdClose className="w-6 h-6" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {pendingProviderReview ? "Verification in progress" : msg.title}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {pendingProviderReview
            ? "We received your verification payment. Your documents are being reviewed."
            : msg.subtitle}
        </p>
        {pendingProviderReview && (
          <div
            className="mb-4 p-3 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-sm"
            role="status"
          >
            You will be able to apply for jobs after an administrator approves
            your verification.
          </div>
        )}

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
            <img
              src={user?.avatar || user?.profile_picture || "/avatar_user.png"}
              alt={user?.name || "User"}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-800">
                  {formatDisplayName(user?.name || user?.full_name) || "User"}
                </span>
                {user?.is_verified && (
                  <RiVerifiedBadgeFill className="text-blue-500 text-base" />
                )}
              </div>
              <p className="text-gray-500 text-sm">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        )}

        {!pendingProviderReview && (
          <>
            <p className="text-gray-600 text-sm mb-4">{msg.description}</p>

            <div className="mb-6">
              <p className="font-semibold text-gray-800 text-sm mb-3">
                Verification helps us:
              </p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AiOutlineCheckCircle className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{msg.benefit1}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <AiOutlineCheckCircle className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{msg.benefit2}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <AiOutlineCheckCircle className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{msg.benefit3}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleProceedClick}
            disabled={isLoading}
            className={`w-full bg-[#0093d1] text-white py-3.5 rounded-lg font-semibold hover:bg-[#007bb0] transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading
              ? "Processing..."
              : pendingProviderReview
                ? "Got it"
                : msg.buttonText}
          </button>
          {!pendingProviderReview && (
            <button
              onClick={handleMaybeLater}
              disabled={isLoading}
              className="w-full bg-white text-gray-600 py-3.5 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {msg.skipText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
