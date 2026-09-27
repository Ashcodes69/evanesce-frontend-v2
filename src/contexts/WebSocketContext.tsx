"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";

type Listener = (data: any) => void;

interface WebSocketContextType {
  sendJson: (data: object) => void;
  addListener: (cb: Listener) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Set<Listener>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    // 1. SSR Guard: Ensure we are running in the browser
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token || wsRef.current) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";
    const socket = new WebSocket(`${wsUrl}/ws?token=${token}`);

    wsRef.current = socket;

    socket.onopen = () => {
      console.log("Secure WS connected");
      // Clear any pending reconnect attempts now that we are connected
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };

    socket.onmessage = (event) => {
      // 2. Safety: Catch malformed messages so they don't break the UI
      try {
        const data = JSON.parse(event.data);
        listenersRef.current.forEach((cb) => cb(data));
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    socket.onclose = () => {
      console.log("Secure WS disconnected");
      wsRef.current = null;

      // 3. Auto-Reconnect logic: If the user is still authenticated but the socket dropped
      if (typeof window !== "undefined" && localStorage.getItem("token")) {
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    };
  }, []);

  useEffect(() => {
    connect();

    // Re-connect after login/logout without a full page reload
    const handleAuthChange = () => {
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      connect();
    };

    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendJson = useCallback((data: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket is not connected. Message dropped:", data);
    }
  }, []);

  const addListener = useCallback((cb: Listener) => {
    listenersRef.current.add(cb);
    return () => {
      listenersRef.current.delete(cb);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ sendJson, addListener }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider",
    );
  }
  return context;
}
