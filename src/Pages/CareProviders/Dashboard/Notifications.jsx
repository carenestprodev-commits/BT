import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../Context/NotificationContext";
import { useContext } from "react";
import { AuthContext } from "../../../Context/AuthContext";
import Sidebar from "./Sidebar";
import {
  handleNotificationNavigation,
  getNotificationIcon,
  getNotificationTitle,
  getNotificationDescription,
  getNotificationStyles,
  getTimeDisplay,
} from "../../../utils/notificationUtils";
import { IoNotificationsOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { MdDoneAll } from "react-icons/md";

function Notifications() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const {
    notifications,
    unreadCount,
    isConnected,
    isDegraded,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  } = useNotifications();

  const userRole = useMemo(() => {
    if (user?.role === "care_provider") return "provider";
    if (user?.role === "care_seeker") return "seeker";
    return "seeker";
  }, [user]);

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on type
    handleNotificationNavigation(notification, navigate, userRole);
  };

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  return (
    <div className="flex min-h-screen font-sfpro pb-24 md:pb-0">
      <Sidebar active="Notifications" />
      <div className="flex-1 bg-gray-50 px-4 sm:px-6 lg:px-8 pt-20 pb-5 md:pt-5 md:py-5 font-sfpro md:ml-64">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <IoNotificationsOutline className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                    : "All caught up!"}
                </p>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          {isDegraded && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                Realtime notifications are temporarily unavailable. Checking for
                new messages...
              </p>
            </div>
          )}

          {!isConnected && !isDegraded && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 flex items-center gap-2">
                <span className="text-xl">🔌</span>
                Connecting to notification service...
              </p>
            </div>
          )}

          {isConnected && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <span className="text-xl">✅</span>
                Connected and receiving notifications
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {unreadCount > 0 && (
            <div className="mb-6 flex gap-3">
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <MdDoneAll className="h-4 w-4" />
                Mark all as read
              </button>
            </div>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
            >
              <AiOutlineDelete className="h-4 w-4" />
              Clear all
            </button>
          )}

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <IoNotificationsOutline className="h-16 w-16 text-gray-300 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-600">
                You&apos;re all set! New notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Unread Notifications Section */}
              {unreadNotifications.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-3 px-1">
                    UNREAD ({unreadNotifications.length})
                  </h2>
                  <div className="space-y-2">
                    {unreadNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onDelete={() => clearNotification(notification.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Read Notifications Section */}
              {readNotifications.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">
                    EARLIER ({readNotifications.length})
                  </h2>
                  <div className="space-y-2">
                    {readNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onDelete={() => clearNotification(notification.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Individual Notification Item Component
 */
function NotificationItem({ notification, onClick, onDelete }) {
  const icon = getNotificationIcon(notification.type);
  const title = getNotificationTitle(notification);
  const description = getNotificationDescription(notification);
  const timeDisplay = getTimeDisplay(notification.timestamp);
  const styleClass = getNotificationStyles(
    notification.type,
    notification.read,
  );

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${styleClass}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-2xl mt-1 flex-shrink-0">{icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={`font-semibold text-sm sm:text-base ${
                  notification.read ? "text-gray-700" : "text-gray-900"
                }`}
              >
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                {description}
              </p>
              <p className="text-xs text-gray-500 mt-2">{timeDisplay}</p>
            </div>

            {/* Unread Badge & Delete Button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!notification.read && (
                <div className="h-3 w-3 bg-blue-500 rounded-full" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Delete notification"
              >
                <AiOutlineDelete className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
