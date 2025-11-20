import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (message, { type = "info", duration = 4000 } = {}) => {
      const id = ++idCounter;
      setToasts((t) => [...t, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => {
          setToasts((t) => t.filter((x) => x.id !== id));
        }, duration);
      }
      return id;
    },
    []
  );

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // Override global alert to show toasts instead
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message) => {
      showToast(String(message), { type: "info" });
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div style={containerStyle} aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{ ...toastStyle, ...(typeStyles[t.type] || {}) }}
          >
            <div style={messageStyle}>{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="dismiss"
              style={closeButtonStyle}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
};

// Styles
const containerStyle = {
  position: "fixed",
  right: 12,
  top: 12,
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  maxWidth: "calc(100% - 24px)",
};

const toastStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "#111827",
  color: "#fff",
  padding: "10px 12px",
  borderRadius: 8,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  minWidth: 200,
  maxWidth: 420,
};

const messageStyle = { flex: 1, paddingRight: 8 };

const closeButtonStyle = {
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: 16,
  cursor: "pointer",
};

const typeStyles = {
  error: { background: "#b91c1c" },
  success: { background: "#064e3b" },
  info: { background: "#111827" },
  warning: { background: "#92400e" },
};

export default ToastProvider;
