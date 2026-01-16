import { useNavigate } from "react-router-dom";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";

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
 * @param {function} onProceed - Callback when user chooses to proceed to verification
 * @param {function} onCancel - Callback when user chooses to cancel
 * @param {boolean} isLoading - Optional: loading state for proceed button
 */
export default function VerificationCheckModal({
  isOpen,
  user,
  userType = "provider",
  actionType = "apply",
  onProceed,
  onCancel,
  isLoading = false,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

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
            "To access and connect with verified care providers, we need to confirm your identity.",
          subtitle: "Help us keep the care community safe and trusted.",
          benefit1: "Access to all verified care providers",
          benefit2: "Priority support from providers",
          benefit3: "Secure booking and payment",
          buttonText: "Proceed to Verification",
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
    // Call the onProceed callback first
    if (onProceed) {
      onProceed();
    }

    // Navigate to settings verification tab
    navigate(settingRoute, {
      state: { activeTab: "verify" },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
          {msg.title}
        </h2>
        <p className="text-gray-500 text-sm mb-6">{msg.subtitle}</p>

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
                  {user?.name || user?.full_name || "User"}
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

        {/* Verification Info */}
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

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleProceedClick}
            disabled={isLoading}
            className={`w-full bg-[#0093d1] text-white py-3.5 rounded-lg font-semibold hover:bg-[#007bb0] transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Processing..." : msg.buttonText}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full bg-white text-gray-600 py-3.5 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {msg.skipText}
          </button>
        </div>
      </div>
    </div>
  );
}
