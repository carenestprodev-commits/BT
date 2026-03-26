/**
 * Utility functions for handling notification navigation based on type
 */

export const getNotificationIcon = (type) => {
  const icons = {
    provider_application: "🔔",
    activity_started: "▶️",
    activity_ended: "⏹️",
    wallet_credit: "💰",
    new_message: "💬",
    call_started: "📞",
    call_ended: "📴",
    recording_processing: "⏳",
    recording_uploaded: "🎥",
    recording_errored: "⚠️",
    notification_status: "ℹ️",
  };
  return icons[type] || "📬";
};

export const getNotificationTitle = (notification) => {
  const { type, provider_name, sender_name, amount } = notification;

  switch (type) {
    case "provider_application":
      return `${provider_name || "Provider"} applied for your job`;
    case "activity_started":
      return "Activity started";
    case "activity_ended":
      return "Activity ended";
    case "wallet_credit":
      return `Credit: ₦${amount || "0"}`;
    case "new_message":
      return `Message from ${sender_name || "Someone"}`;
    case "call_started":
      return "Call started";
    case "call_ended":
      return "Call ended";
    case "recording_processing":
      return "Recording processing";
    case "recording_uploaded":
      return "Recording ready";
    case "recording_errored":
      return "Recording unavailable";
    case "notification_status":
      return notification.message || "Notification status";
    default:
      return notification.message || "New notification";
  }
};

export const getNotificationDescription = (notification) => {
  const { type, message, amount, balance, sender_name } = notification;

  switch (type) {
    case "provider_application":
      return message || "A provider has applied for your job request";
    case "activity_started":
      return message || "An activity has started";
    case "activity_ended":
      return message || "An activity has ended";
    case "wallet_credit":
      return `₦${amount || "0"} credited to your wallet. Balance: ₦${balance || "0"}`;
    case "new_message":
      return message || `New message from ${sender_name || "a user"}`;
    case "call_started":
      return message || "A call has started";
    case "call_ended":
      return message || "A call has ended";
    case "recording_processing":
      return message || "Recording is processing";
    case "recording_uploaded":
      return message || "Recording is ready";
    case "recording_errored":
      return message || "Recording could not be saved";
    case "notification_status":
      return notification.message || "System notification";
    default:
      return message || "You have a new notification";
  }
};

/**
 * Navigate user based on notification type
 * @param {Object} notification - The notification object
 * @param {Function} navigate - React Router navigate function
 * @param {String} role - User role (seeker, provider, admin)
 */
export const handleNotificationNavigation = (
  notification,
  navigate,
  role = "seeker",
) => {
  const { type, job_request_id, booking_id, conversation_id } = notification;

  const basePath =
    role === "provider"
      ? "/careproviders/dashboard"
      : `/care${role}s/dashboard`;

  const navigationMap = {
    provider_application: () => {
      // Navigate to requests/job details
      if (job_request_id) {
        navigate(`${basePath}/requests/${job_request_id}`);
      } else {
        navigate(`${basePath}/requests`);
      }
    },
    activity_started: () => {
      // Navigate to bookings/activity details
      if (booking_id) {
        navigate(`${basePath}/requests/${booking_id}`);
      } else {
        navigate(`${basePath}/requests`);
      }
    },
    activity_ended: () => {
      // Navigate to bookings/activity details
      if (booking_id) {
        navigate(`${basePath}/requests/${booking_id}`);
      } else {
        navigate(`${basePath}/requests`);
      }
    },
    wallet_credit: () => {
      // Navigate to wallet/payment page
      if (role === "provider") {
        navigate(`${basePath}/wallet`);
      } else {
        navigate(`${basePath}/settings`);
      }
    },
    new_message: () => {
      // Navigate to conversation
      if (conversation_id) {
        navigate(`${basePath}/message/${conversation_id}`);
      } else {
        navigate(`${basePath}/message`);
      }
    },
    call_started: () => {
      if (conversation_id) {
        navigate(`${basePath}/message/${conversation_id}`);
      } else {
        navigate(`${basePath}/message`);
      }
    },
    call_ended: () => {
      if (conversation_id) {
        navigate(`${basePath}/message/${conversation_id}`);
      } else {
        navigate(`${basePath}/message`);
      }
    },
    recording_processing: () => {
      if (conversation_id) {
        navigate(`${basePath}/message/${conversation_id}`);
      } else {
        navigate(`${basePath}/message`);
      }
    },
    recording_uploaded: () => {
      if (conversation_id) {
        navigate(`${basePath}/message/${conversation_id}`);
      } else {
        navigate(`${basePath}/message`);
      }
    },
    recording_errored: () => {
      if (conversation_id) {
        navigate(`${basePath}/message/${conversation_id}`);
      } else {
        navigate(`${basePath}/message`);
      }
    },
    notification_status: () => {
      // Stay on notifications page
      navigate(`${basePath}/notifications`);
    },
    default: () => {
      navigate(`${basePath}/notifications`);
    },
  };

  const handler = navigationMap[type] || navigationMap.default;
  handler();
};

/**
 * Get notification styling based on type
 */
export const getNotificationStyles = (type, read) => {
  const baseClass = read
    ? "bg-white border-gray-200"
    : "bg-blue-50 border-blue-200 shadow-sm";

  const bgColorClass = {
    provider_application: "border-l-4 border-l-blue-500",
    activity_started: "border-l-4 border-l-green-500",
    activity_ended: "border-l-4 border-l-orange-500",
    wallet_credit: "border-l-4 border-l-emerald-500",
    new_message: "border-l-4 border-l-purple-500",
    call_started: "border-l-4 border-l-cyan-500",
    call_ended: "border-l-4 border-l-slate-500",
    recording_processing: "border-l-4 border-l-amber-500",
    recording_uploaded: "border-l-4 border-l-emerald-500",
    recording_errored: "border-l-4 border-l-red-500",
    notification_status: "border-l-4 border-l-yellow-500",
  };

  return `${baseClass} ${bgColorClass[type] || "border-l-4 border-l-gray-500"}`;
};

/**
 * Get time display for notification
 */
export const getTimeDisplay = (timestamp) => {
  const now = new Date();
  const notifTime = new Date(timestamp);
  const diffMs = now - notifTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return notifTime.toLocaleDateString();
};
