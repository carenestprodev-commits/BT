// src/hooks/useAppNotifications.js
import { useEffect, useRef } from "react";
import {logout} from "../Redux/Login.jsx"; // adjust path if needed

const getWSHost = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    return apiUrl.replace("http://", "ws://").replace("https://", "wss://");
};

export function useAppNotifications(onMessage) {
    const socketRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const wsUrl = `${getWSHost()}/ws/appnotifications/?token=${token}`;
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("✅ Notifications WebSocket connected");
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage?.(data);
            } catch (e) {
                console.warn("Invalid WS message", event.data);
            }
        };

        socket.onclose = (event) => {
            console.log("🔌 WS closed", event.code);

            // 🔐 Token expired / invalid
            if ([4001, 4003].includes(event.code)) {
                logout();
            }
        };

        socket.onerror = (err) => {
            console.error("❌ WebSocket error", err);
        };

        return () => socket.close();
    }, [onMessage]);
}
