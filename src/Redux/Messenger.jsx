import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL, getAuthHeaders } from "./config";
import { fetchWithAuth } from "../lib/fetchWithAuth.js";
import { normalizeRealtimeMessage } from "../lib/chatMessages";

const getWSHost = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  return apiUrl.replace("http://", "ws://").replace("https://", "wss://");
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true when a response body is a raw HTML page (e.g. Django 500 error).
 * These occur when the backend saves data successfully but crashes during serialisation.
 */
const isHtmlErrorPage = (text) =>
  typeof text === "string" &&
  (text.trimStart().startsWith("<!") ||
    text.includes("<html") ||
    text.includes("Server Error"));

/**
 * Converts a raw error body into a clean, user-facing string.
 * HTML 500 pages are replaced with an actionable message.
 */
const cleanApiError = (text, statusCode) => {
  if (isHtmlErrorPage(text)) {
    return `Server error (${statusCode ?? 500}). Your message may have been sent — it will appear shortly.`;
  }
  // Try to extract a message from JSON error bodies
  try {
    const parsed = JSON.parse(text);
    return (
      parsed.detail ||
      parsed.message ||
      parsed.error ||
      Object.values(parsed)[0] ||
      text
    );
  } catch {
    return text;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Fetch conversations list
// ─────────────────────────────────────────────────────────────────────────────
export const fetchConversations = createAsyncThunk(
  "messenger/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/conversations/`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(cleanApiError(text, res.status));
      }
      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Fetch messages for a specific conversation
// ─────────────────────────────────────────────────────────────────────────────
export const fetchMessages = createAsyncThunk(
  "messenger/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/messages/?conversation_id=${conversationId}`,
        { headers: getAuthHeaders() },
      );
      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(cleanApiError(text, res.status));
      }
      const data = await res.json();
      return { conversationId, messages: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Send a message
// ─────────────────────────────────────────────────────────────────────────────
export const sendMessage = createAsyncThunk(
  "messenger/sendMessage",
  async ({ conversationId, content }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/messages/?conversation_id=${conversationId}`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json", // ← THIS was missing, causing the 500
          },
          body: JSON.stringify({ content }),
        },
      );
      if (!res.ok) {
        const errorText = await res.text();
        const isHtml =
          errorText.trimStart().startsWith("<!") || errorText.includes("<html");
        return rejectWithValue(
          isHtml
            ? `Server error (${res.status}). Your message may have been sent — it will appear shortly.`
            : errorText,
        );
      }
      const data = await res.json();
      return { conversationId, message: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Mark conversation as read
// ─────────────────────────────────────────────────────────────────────────────
export const markAsRead = createAsyncThunk(
  "messenger/markAsRead",
  async (conversationId, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/conversations/${conversationId}/mark-as-read/`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(cleanApiError(text, res.status));
      }
      const data = await res.json();
      return { conversationId, response: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. Create a new conversation
// ─────────────────────────────────────────────────────────────────────────────
export const createConversation = createAsyncThunk(
  "messenger/createConversation",
  async (otherUserId, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/conversations/create/`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ other_user_id: otherUserId }),
      });
      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(cleanApiError(text, res.status));
      }
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// WebSocket Manager with automatic reconnect + exponential backoff
// ─────────────────────────────────────────────────────────────────────────────
class WebSocketManager {
  constructor() {
    this.socket = null;
    this.conversationId = null;
    this.token = null;
    this.onMessageCallback = null;
    this.onConnectionCallback = null;

    // Reconnect state
    this._reconnectTimer = null;
    this._reconnectAttempts = 0;
    this._maxReconnectAttempts = 8;
    this._baseDelay = 1000; // 1 s
    this._maxDelay = 30000; // 30 s
    this._intentionalDisconnect = false;
  }

  connect(conversationId, token, onMessage, onConnection) {
    this.conversationId = conversationId;
    this.token = token;
    this.onMessageCallback = onMessage;
    this.onConnectionCallback = onConnection;
    this._intentionalDisconnect = false;

    this._clearReconnectTimer();
    this._doConnect();
  }

  _doConnect() {
    // Close any existing socket cleanly before opening a new one
    if (this.socket) {
      this.socket.onclose = null; // prevent the close handler from scheduling a reconnect
      this.socket.close();
      this.socket = null;
    }

    const wsUrl = `${getWSHost()}/ws/chat/${this.conversationId}/?token=${this.token}`;
    console.log(
      `🔌 WebSocket connecting (attempt ${this._reconnectAttempts + 1}):`,
      wsUrl,
    );

    try {
      this.socket = new WebSocket(wsUrl);
    } catch (err) {
      console.error("WebSocket constructor error:", err);
      this._scheduleReconnect();
      return;
    }

    this.socket.onopen = () => {
      console.log("✅ WebSocket connected");
      this._reconnectAttempts = 0; // reset backoff on successful connection
      if (this.onConnectionCallback) {
        this.onConnectionCallback({ type: "connected" });
      }
    };

    this.socket.onmessage = (event) => {
      try {
        console.debug("WebSocket frame:", event.data);
        const data = JSON.parse(event.data);
        if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.socket.onclose = (event) => {
      console.log(`🔌 WebSocket closed (code ${event.code})`);
      if (this.onConnectionCallback) {
        this.onConnectionCallback({ type: "disconnected" });
      }
      // ✅ Auto-reconnect unless we deliberately disconnected
      if (!this._intentionalDisconnect) {
        this._scheduleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (this.onConnectionCallback) {
        this.onConnectionCallback({ type: "error", error });
      }
      // onclose will fire after onerror; reconnect is scheduled there
    };
  }

  /**
   * Schedules a reconnect attempt using exponential backoff with jitter.
   * Stops after _maxReconnectAttempts.
   */
  _scheduleReconnect() {
    if (this._intentionalDisconnect) return;
    if (this._reconnectAttempts >= this._maxReconnectAttempts) {
      console.warn("⚠️ WebSocket max reconnect attempts reached. Giving up.");
      return;
    }

    const delay = Math.min(
      this._baseDelay * Math.pow(2, this._reconnectAttempts),
      this._maxDelay,
    );
    // Add ±20% jitter to avoid thundering-herd
    const jitter = delay * 0.2 * (Math.random() * 2 - 1);
    const actualDelay = Math.max(500, Math.round(delay + jitter));

    this._reconnectAttempts += 1;
    console.log(
      `⏱️ WebSocket reconnecting in ${actualDelay}ms (attempt ${this._reconnectAttempts}/${this._maxReconnectAttempts})`,
    );

    this._clearReconnectTimer();
    this._reconnectTimer = setTimeout(() => {
      if (!this._intentionalDisconnect) {
        this._doConnect();
      }
    }, actualDelay);
  }

  _clearReconnectTimer() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ message }));
      return true;
    }
    return false;
  }

  disconnect() {
    this._intentionalDisconnect = true;
    this._clearReconnectTimer();
    this._reconnectAttempts = 0;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Singleton WebSocket manager
const wsManager = new WebSocketManager();

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────
const initialState = {
  conversations: [],
  conversationsLoading: false,
  conversationsError: null,

  messagesByConversation: {},
  messagesLoading: {},
  messagesError: {},

  activeConversationId: null,

  wsConnected: false,
  wsError: null,

  creatingConversation: false,
  createConversationError: null,
  lastCreatedConversationId: null,

  sendingMessage: false,
  sendMessageError: null,
};

const messengerSlice = createSlice({
  name: "messenger",
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },

    setWebSocketConnected: (state, action) => {
      state.wsConnected = action.payload;
    },

    setWebSocketError: (state, action) => {
      state.wsError = action.payload;
    },

    addRealtimeMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      const cid = String(conversationId);
      if (!state.messagesByConversation[cid]) {
        state.messagesByConversation[cid] = [];
      }

      const formattedMessage = normalizeRealtimeMessage({
        ...message,
        sender: message.sender_id,
        sender_name: message.sender_name,
        content: message.message,
      });

      const exists = state.messagesByConversation[cid].some(
        (entry) => String(entry.id) === String(formattedMessage.id),
      );
      if (exists) {
        return;
      }

      state.messagesByConversation[cid].push(formattedMessage);
      console.debug("addRealtimeMessage -> added", cid, formattedMessage);

      // Bubble conversation to top of list (WhatsApp-style)
      const idx = state.conversations.findIndex((c) => String(c.id) === cid);
      if (idx >= 0) {
        const conv = state.conversations[idx];
        conv.last_message = {
          content: formattedMessage.content,
          kind: formattedMessage.kind,
          payload: formattedMessage.payload,
          timestamp: formattedMessage.timestamp,
        };
        if (idx > 0) {
          state.conversations.splice(idx, 1);
          state.conversations.unshift(conv);
        }
      }
    },

    clearCreatedConversationId: (state) => {
      state.lastCreatedConversationId = null;
    },

    clearMessagesError: (state, action) => {
      const conversationId = action.payload;
      if (state.messagesError[conversationId]) {
        delete state.messagesError[conversationId];
      }
    },

    clearSendMessageError: (state) => {
      state.sendMessageError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // ── fetchConversations ──────────────────────────────────────────────
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsLoading = true;
        state.conversationsError = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;

        // Merge server list with any locally-created conversations
        const existing = [...state.conversations];
        const merged = action.payload.reduce((acc, conv) => {
          const idx = acc.findIndex((c) => String(c.id) === String(conv.id));
          if (idx >= 0) {
            acc[idx] = conv;
          } else {
            acc.push(conv);
          }
          return acc;
        }, existing);

        // Remove any remaining duplicates
        state.conversations = merged.filter(
          (conv, index, self) =>
            index === self.findIndex((c) => String(c.id) === String(conv.id)),
        );
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.conversationsError = action.payload;
      })

      // ── fetchMessages ───────────────────────────────────────────────────
      .addCase(fetchMessages.pending, (state, action) => {
        const cid = action.meta.arg;
        state.messagesLoading[cid] = true;
        delete state.messagesError[cid];
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        const cid = String(conversationId);
        state.messagesLoading[cid] = false;
        state.messagesByConversation[cid] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const cid = action.meta.arg;
        state.messagesLoading[cid] = false;
        state.messagesError[cid] = action.payload;
      })

      // ── sendMessage ─────────────────────────────────────────────────────
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.sendMessageError = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        const { conversationId, message } = action.payload;
        const cid = String(conversationId);

        if (!state.messagesByConversation[cid]) {
          state.messagesByConversation[cid] = [];
        }

        const exists = state.messagesByConversation[cid].some(
          (msg) => String(msg.id) === String(message.id),
        );

        if (!exists) {
          state.messagesByConversation[cid].push(message);

          // Bubble conversation to top
          const idx = state.conversations.findIndex(
            (c) => String(c.id) === cid,
          );
          if (idx >= 0) {
            const conv = state.conversations[idx];
            conv.last_message = {
              content: message.content,
              kind: message.kind,
              payload: message.payload,
              timestamp: message.timestamp,
            };
            if (idx > 0) {
              state.conversations.splice(idx, 1);
              state.conversations.unshift(conv);
            }
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        // ✅ action.payload is already a clean string (sanitised in the thunk)
        state.sendMessageError = action.payload ?? "Failed to send message.";
      })

      // ── markAsRead ──────────────────────────────────────────────────────
      .addCase(markAsRead.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (conv) conv.unread_count = 0;
      })

      // ── createConversation ──────────────────────────────────────────────
      .addCase(createConversation.pending, (state) => {
        state.creatingConversation = true;
        state.createConversationError = null;
        state.lastCreatedConversationId = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.creatingConversation = false;
        const conversation = action.payload;
        if (conversation?.id) {
          state.lastCreatedConversationId = String(conversation.id);
          const idx = state.conversations.findIndex(
            (c) => String(c.id) === String(conversation.id),
          );
          if (idx === -1) {
            state.conversations.unshift(conversation);
          } else {
            state.conversations[idx] = conversation;
          }
        }
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.creatingConversation = false;
        state.createConversationError = action.payload ?? action.error?.message;
      });
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Action exports
// ─────────────────────────────────────────────────────────────────────────────
export const {
  setActiveConversation,
  setWebSocketConnected,
  setWebSocketError,
  addRealtimeMessage,
  clearCreatedConversationId,
  clearMessagesError,
  clearSendMessageError,
} = messengerSlice.actions;

// ─────────────────────────────────────────────────────────────────────────────
// WebSocket thunks
// ─────────────────────────────────────────────────────────────────────────────
export const connectWebSocket = (conversationId) => (dispatch) => {
  const token = localStorage.getItem("access");
  if (!token) {
    dispatch(setWebSocketError("No authentication token found"));
    return;
  }

  const onMessage = (data) => {
    try {
      // Normalise different server payload shapes
      const payload =
        data && typeof data === "object" && (data.data || data.payload)
          ? data.data || data.payload
          : data;
      const kind = payload?.kind || payload?.message_kind || "text";
      const senderId =
        payload?.sender_id ?? payload?.sender ?? payload?.from ?? payload?.user_id;
      const senderName =
        payload?.sender_name ??
        payload?.username ??
        payload?.user_name ??
        payload?.sender_full_name;
      const timestamp =
        payload?.timestamp ??
        payload?.sent_at ??
        payload?.created_at ??
        new Date().toISOString();
      const messageText = payload?.message ?? payload?.content ?? payload?.text;

      if (messageText || kind === "system" || kind === "recording" || kind === "info") {
        dispatch(
          addRealtimeMessage({
            conversationId,
              message: {
                id: payload?.id,
                message: messageText,
                sender_id: senderId,
                sender_name: senderName,
                kind,
                payload: payload?.payload || payload?.meta || payload,
                timestamp,
              },
            }),
        );
      }
    } catch (err) {
      console.error("Error normalising WebSocket message:", err);
    }
  };

  const onConnection = (event) => {
    if (event.type === "connected") {
      dispatch(setWebSocketConnected(true));
      dispatch(setWebSocketError(null));
    } else if (event.type === "disconnected") {
      dispatch(setWebSocketConnected(false));
    } else if (event.type === "error") {
      dispatch(setWebSocketError("WebSocket connection failed"));
      dispatch(setWebSocketConnected(false));
    }
  };

  wsManager.connect(conversationId, token, onMessage, onConnection);
};

export const disconnectWebSocket = () => (dispatch) => {
  wsManager.disconnect();
  dispatch(setWebSocketConnected(false));
};

export const sendWebSocketMessage = (message) => (dispatch) => {
  const sent = wsManager.sendMessage(message);
  if (!sent) {
    dispatch(
      setWebSocketError("Failed to send message — WebSocket not connected"),
    );
  }
  return sent;
};

export { wsManager };

export default messengerSlice.reducer;
