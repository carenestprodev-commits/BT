/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../Redux/config";
import { fetchWithAuth } from "../lib/fetchWithAuth.js";
import { fetchSeekerDashboard } from "../Redux/SeekerDashboardHome";
import { fetchProviderProfile } from "../Redux/ProviderSettings";
import {
  fetchSeekerActiveRequests,
  fetchSeekerClosedRequests,
  fetchSeekerPendingRequests,
} from "../Redux/SeekerRequest";
import {
  fetchActiveRequests,
  fetchClosedRequests,
  fetchPendingRequests,
} from "../Redux/CareProviderRequest";

export const NotificationContext = createContext();

const notificationsUrl = () =>
  `${(BASE_URL || window.location.origin).replace(/\/$/, "")}/api/notifications/inbox`;

const notificationKey = (notification) =>
  notification?.id != null
    ? `id:${notification.id}`
    : `${notification?.type || "notification"}:${notification?.timestamp || ""}:${notification?.message || ""}`;

const mergeNotifications = (current, incoming) => {
  const merged = new Map();
  [...incoming, ...current].forEach((notification) => {
    const key = notificationKey(notification);
    if (!merged.has(key)) merged.set(key, notification);
  });
  return [...merged.values()].sort(
    (left, right) =>
      new Date(right.timestamp || 0).getTime() -
      new Date(left.timestamp || 0).getTime(),
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isDegraded, setIsDegraded] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();

  // Get access token from any possible storage location
  const getAccessToken = useCallback(() => {
    const tokens = [
      localStorage.getItem("access_token"),
      localStorage.getItem("accessToken"),
      localStorage.getItem("access"),
      sessionStorage.getItem("access_token"),
      sessionStorage.getItem("accessToken"),
      sessionStorage.getItem("access"),
    ];
    return tokens.find((token) => token);
  }, []);

  // Get API host from environment or config
  const getWSHost = useCallback(() => {
    // Try to use the same backend as the app
    const apiUrl =
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_URL ||
      window.location.origin;

    // For local development
    if (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) {
      return apiUrl.replace("http://", "ws://").replace("https://", "wss://");
    }

    // For production/staging
    return apiUrl.replace("http://", "wss://").replace("https://", "wss://");
  }, []);

  // Backoff calculation for reconnection
  const calculateBackoff = useCallback(() => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 16000);
  }, []);

  const refreshRequestCaches = useCallback(
    (userType) => {
      if (userType === "seeker") {
        dispatch(fetchSeekerPendingRequests());
        dispatch(fetchSeekerActiveRequests());
        dispatch(fetchSeekerClosedRequests());
        return;
      }
      if (userType === "provider") {
        dispatch(fetchPendingRequests());
        dispatch(fetchActiveRequests());
        dispatch(fetchClosedRequests());
      }
    },
    [dispatch],
  );

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${notificationsUrl()}/`);
      if (!response.ok) return;
      const stored = await response.json();
      if (!Array.isArray(stored)) return;
      setNotifications((current) => mergeNotifications(current, stored));
    } catch (error) {
      console.warn("Could not load stored notifications:", error);
    }
  }, []);

  // Connect WebSocket
  const connectWebSocket = useCallback(() => {
    const token = getAccessToken();
    if (!token) {
      console.warn("⚠️ No access token found for notifications");
      setIsDegraded(true);
      return;
    }

    const wsHost = getWSHost();
    const wsUrl = `${wsHost}/ws/appnotifications/?token=${token}`;

    try {
      console.log("🔌 Attempting WebSocket connection to:", wsUrl);
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Notifications WebSocket connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        setIsDegraded(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle degraded mode notification
          if (data.type === "notification_status" && data.degraded_mode) {
            console.warn("⚠️ Notifications degraded mode:", data.message);
            setIsDegraded(true);
            return;
          }

          // Add notification to list
          const newNotification = {
            id: data.id || `${data.type}-${Date.now()}`,
            type: data.type,
            read: false,
            timestamp: data.timestamp || new Date().toISOString(),
            ...data,
          };

          setNotifications((prev) => mergeNotifications(prev, [newNotification]));

          // Trigger dashboard/profile reload on session changes
          const userType = user?.user_type || user?.userType;
          if (
            data.type === "activity_started" ||
            data.type === "activity_ended" ||
            data.type === "payment_ready" ||
            data.type === "payment_confirmed" ||
            data.type === "payment_failed" ||
            data.type === "provider_fee_pending" ||
            data.type === "booking_completed" ||
            data.type === "booking_cancelled" ||
            data.type === "booking_rejected" ||
            data.type === "wallet_credit"
          ) {
            if (userType === "seeker") {
              dispatch(fetchSeekerDashboard());
            } else if (userType === "provider") {
              dispatch(fetchProviderProfile());
            }
            refreshRequestCaches(userType);
          }

          console.log("📬 New notification:", newNotification);
        } catch {
          console.warn("❌ Invalid WebSocket message:", event.data);
        }
      };

      ws.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);
        setIsConnected(false);

        // Don't reconnect if token is invalid (4001, 4003)
        if ([4001, 4003].includes(event.code)) {
          console.warn(
            "🔐 Token invalid/expired, stopping reconnection attempts",
          );
          setIsDegraded(true);
          return;
        }

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const backoff = calculateBackoff();
          console.log(
            `⏱️ Reconnecting in ${backoff}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`,
          );
          reconnectAttemptsRef.current += 1;

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, backoff);
          return;
        }

        console.warn("⚠️ Notifications websocket exhausted reconnect attempts");
        setIsDegraded(true);
      };

      ws.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
      };
    } catch (err) {
      console.error("❌ Failed to create WebSocket:", err);
      setIsDegraded(true);
    }
  }, [
    calculateBackoff,
    dispatch,
    getAccessToken,
    getWSHost,
    refreshRequestCaches,
    user?.userType,
    user?.user_type,
  ]);

  // Auto-connect when user is available
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return undefined;
    }
    loadNotifications();
    return undefined;
  }, [loadNotifications, user]);

  useEffect(() => {
    if (user && !socketRef.current) {
      connectWebSocket();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [user, connectWebSocket]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) => prev.map((notif) =>
      String(notif.id) === String(notificationId)
        ? { ...notif, read: true }
        : notif,
    ));
    const id = Number(notificationId);
    if (!Number.isInteger(id) || id <= 0) return;
    fetchWithAuth(`${notificationsUrl()}/${id}/read/`, { method: "POST" }).catch(
      () => {},
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    fetchWithAuth(`${notificationsUrl()}/read-all/`, { method: "POST" }).catch(
      () => {},
    );
  }, []);

  // Clear notification
  const clearNotification = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.filter((notif) => String(notif.id) !== String(notificationId)),
    );
    const id = Number(notificationId);
    if (!Number.isInteger(id) || id <= 0) return;
    fetchWithAuth(`${notificationsUrl()}/${id}/`, { method: "DELETE" }).catch(
      () => {},
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    fetchWithAuth(`${notificationsUrl()}/dismiss-all/`, { method: "POST" }).catch(
      () => {},
    );
  }, []);

  const value = {
    notifications,
    unreadCount,
    isConnected,
    isDegraded,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
};
