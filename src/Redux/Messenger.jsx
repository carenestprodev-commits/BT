import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL, getAuthHeaders } from "./config";

// 1. Fetch conversations list
export const fetchConversations = createAsyncThunk(
  "messenger/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/conversations/`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const errorText = await res.text();
        return rejectWithValue(errorText);
      }
      const data = await res.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. Fetch messages for a specific conversation
export const fetchMessages = createAsyncThunk(
  "messenger/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/messages/?conversation_id=${conversationId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        return rejectWithValue(errorText);
      }
      const data = await res.json();
      return { conversationId, messages: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 3. Send a message
export const sendMessage = createAsyncThunk(
  "messenger/sendMessage",
  async ({ conversationId, content }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/messages/?conversation_id=${conversationId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ content }),
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        return rejectWithValue(errorText);
      }
      const data = await res.json();
      return { conversationId, message: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 4. Mark conversation as read
export const markAsRead = createAsyncThunk(
  "messenger/markAsRead",
  async (conversationId, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/conversations/${conversationId}/mark-as-read/`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        return rejectWithValue(errorText);
      }
      const data = await res.json();
      return { conversationId, response: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new conversation with another user
export const createConversation = createAsyncThunk(
  "messenger/createConversation",
  async (otherUserId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/conversations/create/`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ other_user_id: otherUserId }),
      });
      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(text);
      }
      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// WebSocket connection management
class WebSocketManager {
  constructor() {
    this.socket = null;
    this.conversationId = null;
    this.token = null;
    this.onMessageCallback = null;
    this.onConnectionCallback = null;
  }

  connect(conversationId, token, onMessage, onConnection) {
    this.conversationId = conversationId;
    this.token = token;
    this.onMessageCallback = onMessage;
    this.onConnectionCallback = onConnection;

    if (this.socket) {
      this.disconnect();
    }

    const wsUrl = `wss://backend.staging.bristones.com/ws/chat/${conversationId}/?token=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      if (this.onConnectionCallback) {
        this.onConnectionCallback({ type: "connected" });
      }
    };

    this.socket.onmessage = (event) => {
      try {
        // Log raw frame for debugging
        console.debug("WebSocket frame:", event.data);
        const data = JSON.parse(event.data);
        if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
      if (this.onConnectionCallback) {
        this.onConnectionCallback({ type: "disconnected" });
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (this.onConnectionCallback) {
        this.onConnectionCallback({ type: "error", error });
      }
    };
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ message }));
      return true;
    }
    return false;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create WebSocket manager instance
const wsManager = new WebSocketManager();

const initialState = {
  // Conversations
  conversations: [],
  conversationsLoading: false,
  conversationsError: null,

  // Messages
  messagesByConversation: {}, // { conversationId: [messages] }
  messagesLoading: {},
  messagesError: {},

  // Current conversation
  activeConversationId: null,

  // WebSocket
  wsConnected: false,
  wsError: null,
  // Conversation creation
  creatingConversation: false,
  createConversationError: null,
  lastCreatedConversationId: null,

  // UI state
  sendingMessage: false,
  sendMessageError: null,
};

const messengerSlice = createSlice({
  name: "messenger",
  initialState,
  reducers: {
    // Set active conversation
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },

    // WebSocket actions
    setWebSocketConnected: (state, action) => {
      state.wsConnected = action.payload;
    },

    setWebSocketError: (state, action) => {
      state.wsError = action.payload;
    },

    // Add real-time message from WebSocket
    addRealtimeMessage: (state, action) => {
      let { conversationId, message } = action.payload;
      const cid = String(conversationId);
      if (!state.messagesByConversation[cid]) {
        state.messagesByConversation[cid] = [];
      }

      // Convert WebSocket message format to API message format
      const formattedMessage = {
        id: `ws_${Date.now()}_${message.sender_id}`, // Unique ID for WebSocket messages
        sender: message.sender_id,
        sender_name: message.sender_name,
        content: message.message,
        timestamp: message.timestamp,
      };

      // Check if message already exists (prevent duplicates)
      const exists = state.messagesByConversation[cid].some(
        (msg) =>
          msg.content === formattedMessage.content &&
          String(msg.sender) === String(formattedMessage.sender) &&
          Math.abs(
            new Date(msg.timestamp) - new Date(formattedMessage.timestamp)
          ) < 5000 // Within 5 seconds
      );

      if (!exists) {
        state.messagesByConversation[cid].push(formattedMessage);
        // Debug: log that reducer added a real-time message
        console.debug("addRealtimeMessage -> added", cid, formattedMessage);

        // Update last message in conversations list and move to top
        const conversationIndex = state.conversations.findIndex(
          (c) => String(c.id) === cid
        );
        if (conversationIndex >= 0) {
          const conversation = state.conversations[conversationIndex];
          conversation.last_message = {
            content: message.message,
            timestamp: message.timestamp,
          };

          // Move conversation to top of list for real-time sorting (like WhatsApp)
          if (conversationIndex > 0) {
            state.conversations.splice(conversationIndex, 1);
            state.conversations.unshift(conversation);
          }
        }
      }
    },

    // Clear created conversation ID
    clearCreatedConversationId: (state) => {
      state.lastCreatedConversationId = null;
    },

    // Clear messages error
    clearMessagesError: (state, action) => {
      const conversationId = action.payload;
      if (state.messagesError[conversationId]) {
        delete state.messagesError[conversationId];
      }
    },

    // Clear send message error
    clearSendMessageError: (state) => {
      state.sendMessageError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsLoading = true;
        state.conversationsError = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;

        // Start with current conversations to preserve locally created ones
        const existingConversations = [...state.conversations];

        // Ensure unique conversations based on ID, preserving local conversations
        const uniqueConversations = action.payload.reduce(
          (acc, conversation) => {
            const existingIndex = acc.findIndex(
              (c) => String(c.id) === String(conversation.id)
            );
            if (existingIndex >= 0) {
              // Update existing conversation with latest data from server
              acc[existingIndex] = conversation;
            } else {
              acc.push(conversation);
            }
            return acc;
          },
          existingConversations
        );

        // Remove duplicates that might have been created
        const finalConversations = uniqueConversations.reduce(
          (acc, conversation) => {
            const exists = acc.some(
              (c) => String(c.id) === String(conversation.id)
            );
            if (!exists) {
              acc.push(conversation);
            }
            return acc;
          },
          []
        );

        state.conversations = finalConversations;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.conversationsError = action.payload;
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state, action) => {
        const conversationId = action.meta.arg;
        state.messagesLoading[conversationId] = true;
        if (state.messagesError[conversationId]) {
          delete state.messagesError[conversationId];
        }
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        const cid = String(conversationId);
        state.messagesLoading[cid] = false;
        state.messagesByConversation[cid] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const conversationId = action.meta.arg;
        state.messagesLoading[conversationId] = false;
        state.messagesError[conversationId] = action.payload;
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.sendMessageError = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        const { conversationId, message } = action.payload;

        const cid = String(conversationId);
        // Add message to conversation only if not already added via WebSocket
        if (!state.messagesByConversation[cid]) {
          state.messagesByConversation[cid] = [];
        }

        // Check if message already exists (could have been added via WebSocket)
        const exists = state.messagesByConversation[cid].some(
          (msg) =>
            msg.content === message.content &&
            String(msg.sender) === String(message.sender) &&
            Math.abs(new Date(msg.timestamp) - new Date(message.timestamp)) <
              5000
        );

        if (!exists) {
          state.messagesByConversation[cid].push(message);

          // Update last message in conversations list and move to top
          const conversationIndex = state.conversations.findIndex(
            (c) => String(c.id) === cid
          );
          if (conversationIndex >= 0) {
            const conversation = state.conversations[conversationIndex];
            conversation.last_message = {
              content: message.content,
              timestamp: message.timestamp,
            };

            // Move conversation to top of list when you send a message
            if (conversationIndex > 0) {
              state.conversations.splice(conversationIndex, 1);
              state.conversations.unshift(conversation);
            }
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.sendMessageError = action.payload;
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        // Update unread count in conversations list
        const conversation = state.conversations.find(
          (c) => c.id === conversationId
        );
        if (conversation) {
          conversation.unread_count = 0;
        }
      })
      // Create conversation
      .addCase(createConversation.pending, (state) => {
        state.creatingConversation = true;
        state.createConversationError = null;
        state.lastCreatedConversationId = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.creatingConversation = false;
        // API returns full conversation object
        const conversation = action.payload;
        if (conversation && conversation.id) {
          state.lastCreatedConversationId = String(conversation.id);

          // Add the new conversation to the conversations array if not already present
          const existingIndex = state.conversations.findIndex(
            (c) => String(c.id) === String(conversation.id)
          );
          if (existingIndex === -1) {
            // Add to the beginning of the list (most recent)
            state.conversations.unshift(conversation);
          } else {
            // Update existing conversation
            state.conversations[existingIndex] = conversation;
          }
        }
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.creatingConversation = false;
        state.createConversationError = action.payload || action.error?.message;
      });
  },
});

// Export actions
export const {
  setActiveConversation,
  setWebSocketConnected,
  setWebSocketError,
  addRealtimeMessage,
  clearCreatedConversationId,
  clearMessagesError,
  clearSendMessageError,
} = messengerSlice.actions;

// WebSocket action creators
export const connectWebSocket = (conversationId) => (dispatch) => {
  const token = localStorage.getItem("access");
  if (!token) {
    dispatch(setWebSocketError("No authentication token found"));
    return;
  }

  const onMessage = (data) => {
    // Normalize and handle received message for different server payload shapes
    try {
      let payload = data;
      // Some servers wrap actual payload under 'data' or 'payload'
      if (data && typeof data === "object" && (data.data || data.payload)) {
        payload = data.data || data.payload;
      }

      const messageText = payload.message ?? payload.content ?? payload.text;
      const senderId =
        payload.sender_id ?? payload.sender ?? payload.from ?? payload.user_id;
      const senderName =
        payload.sender_name ??
        payload.sender_name ??
        payload.username ??
        payload.user_name ??
        payload.sender_full_name;
      const timestamp =
        payload.timestamp ??
        payload.sent_at ??
        payload.created_at ??
        new Date().toISOString();

      if (messageText && senderId) {
        dispatch(
          addRealtimeMessage({
            conversationId,
            message: {
              message: messageText,
              sender_id: senderId,
              sender_name: senderName,
              timestamp,
            },
          })
        );
      }
    } catch (err) {
      console.error("Error normalizing websocket message:", err);
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
      setWebSocketError("Failed to send message - WebSocket not connected")
    );
  }
  return sent;
};

// Export WebSocket manager for direct access if needed
export { wsManager };

export default messengerSlice.reducer;
