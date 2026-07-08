// src/hooks/useAppNotifications.js
import { useEffect, useRef } from "react";
import { tokenService } from "../utils/tokenService";

const getWSHost = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    return apiUrl.replace("http://", "ws://").replace("https://", "wss://");
};

export function useAppNotifications(onMessage) {
    const socketRef = useRef(null);
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const isJwtExpired = (token) => {
        try {
            const payload = token.split(".")[1];
            if (!payload) return true;
            const pad = "=".repeat((4 - (payload.length % 4)) % 4);
            const json = JSON.parse(
                atob(`${payload.replace(/-/g, "+").replace(/_/g, "/")}${pad}`),
            );
            return !json.exp || Date.now() / 1000 >= json.exp - 30;
        } catch {
            return true;
        }
    };

    useEffect(() => {
        let closed = false;
        let socket = null;

        const connect = async () => {
            let token = tokenService.getAccessToken();

            if (!token || isJwtExpired(token)) {
                token = await tokenService.refreshToken();
            }

            if (closed || !token) return;

            const wsUrl = `${getWSHost()}/ws/appnotifications/?token=${token}`;
            socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("✅ Notifications WebSocket connected");
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessageRef.current?.(data);
                } catch (e) {
                    console.warn("Invalid WS message", event.data);
                }
            };

            socket.onclose = (event) => {
                console.log("🔌 WS closed", event.code);
            };

            socket.onerror = (err) => {
                console.error("❌ WebSocket error", err);
            };
        };

        connect();

        return () => {
            closed = true;
            socket?.close();
        };
    }, []);
}
