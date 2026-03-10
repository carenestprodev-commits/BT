import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isDegraded, setIsDegraded] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const { user } = useContext(AuthContext);

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
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;

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

  // Connect WebSocket
  const connectWebSocket = useCallback(() => {
    const token = getAccessToken();
    if (!token) {
      console.warn("⚠️ No access token found for notifications");
      setIsDegraded(true);
      return;
    }

    const wsHost = getWSHost();
    const wsUrl = `${wsHost}/ws/notifications/?token=${token}`;

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

          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          console.log("📬 New notification:", newNotification);
        } catch (err) {
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

        // Don't reconnect if WebSocket server not available (1006, 1011)
        if ([1006, 1011].includes(event.code)) {
          console.warn(
            "⚠️ WebSocket server unavailable, activating degraded mode",
          );
          setIsDegraded(true);
          // Still attempt reconnection but less aggressively
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const backoff = calculateBackoff();
            console.log(
              `⏱️ Retrying in ${backoff}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`,
            );
            reconnectAttemptsRef.current += 1;

            reconnectTimeoutRef.current = setTimeout(() => {
              connectWebSocket();
            }, backoff);
          }
          return;
        }

        // Attempt reconnection with backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const backoff = calculateBackoff();
          console.log(
            `⏱️ Reconnecting in ${backoff}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`,
          );
          reconnectAttemptsRef.current += 1;

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, backoff);
        }
      };

      ws.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
        console.warn(
          "⚠️ WebSocket connection failed, falling back to degraded mode",
        );
        setIsDegraded(true);
      };
    } catch (err) {
      console.error("❌ Failed to create WebSocket:", err);
      setIsDegraded(true);
    }
  }, [getAccessToken, getWSHost, calculateBackoff]);

  // Auto-connect when user is available
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
      }
    };
  }, [user, connectWebSocket]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear notification
  const clearNotification = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId),
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
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
