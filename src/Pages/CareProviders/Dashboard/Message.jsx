/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  markAsRead,
  setActiveConversation,
  connectWebSocket,
  disconnectWebSocket,
  clearSendMessageError,
} from "../../../Redux/Messenger";
import {
  initiateActivityPayment,
  clearPaymentState,
  clearActivityStarted,
  clearActivityEnded,
} from "../../../Redux/StartActivity";
import { endActivity, startActivity } from "../../../Redux/StartActivity";
import { BASE_URL } from "../../../Redux/config";

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Helper to resolve image URLs (absolute, relative or missing)
const resolveImage = (url) => {
  if (!url)
    return "https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151&size=64";
  if (url.startsWith("http") || url.startsWith("https")) return url;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return url;
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const getCurrentUserId = () => {
  // You might want to store this in Redux auth state
  // For now, we'll try to get it from token or localStorage
  try {
    const token = localStorage.getItem("access");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("JWT payload:", payload); // Debug log
      const userId = payload.user_id || payload.id || payload.sub;
      console.log("Extracted user ID:", userId); // Debug log
      return userId;
    }
  } catch (error) {
    console.error("Error getting user ID from token:", error);
  }
  return null;
};

// ============================================
// ADD THESE TWO COMPONENTS RIGHT AFTER getCurrentUserId()
// AND BEFORE function Message() {
// Location: Around line 100
// ============================================

// Mobile Conversations List Component
const MobileConversationsList = ({
  conversations,
  search,
  setSearch,
  selectedIndex,
  handleConversationSelect,
  setShowChatOnMobile,
  conversationsLoading,
  conversationsError,
  navigate,
  resolveImage,
  formatTime,
}) => {
  const filteredConversations = conversations.filter(
    (conv) =>
      (conv.other_participant?.full_name || conv.other_participant?.email || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (conv.last_message?.content || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (conv.job_title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full bg-white flex flex-col h-full">
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center mb-4">
          <button
            className="mr-3 text-gray-600 hover:text-gray-800 text-xl"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h2 className="text-xl font-semibold text-gray-900">Message</h2>
        </div>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search for message"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversationsLoading ? (
          <div className="text-center text-gray-400 py-8">
            Loading conversations...
          </div>
        ) : conversationsError ? (
          <div className="text-center text-red-400 py-8">
            Error loading conversations
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const originalIndex = conversations.indexOf(conversation);
            return (
              <button
                key={conversation.id}
                className="w-full flex items-center gap-3 px-4 py-4 transition text-left border-b border-gray-50 hover:bg-gray-50"
                onClick={() => {
                  handleConversationSelect(originalIndex);
                  setShowChatOnMobile(true);
                }}
              >
                <img
                  src={resolveImage(
                    conversation.other_participant?.profile_image_url
                  )}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-medium text-gray-900 text-sm truncate">
                      {conversation.other_participant?.full_name ||
                        conversation.other_participant?.email ||
                        "Unknown User"}
                    </span>
                    <svg
                      className="w-4 h-4 text-blue-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conversation.last_message?.content || "No messages yet"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">
                    {conversation.last_message?.timestamp
                      ? formatTime(conversation.last_message.timestamp)
                      : ""}
                  </span>
                  {conversation.unread_count > 0 && (
                    <span className="bg-[#00A8E8] text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

// Mobile Chat View Component
const MobileChatView = ({
  currentConversation,
  setShowChatOnMobile,
  resolveImage,
  displayMessages,
  messagesLoading,
  messagesError,
  sendMessageError,
  chatBodyRef,
  chatEndRef,
  input,
  setInput,
  handleKeyPress,
  sendingMessage,
  handleSendMessage,
  inputRef,
}) => {
  return (
    <div className="flex flex-col bg-white h-full overflow-hidden">
      <div className="flex items-center px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <button
          className="mr-3 text-gray-600 hover:text-gray-800 text-xl"
          onClick={() => setShowChatOnMobile(false)}
        >
          ←
        </button>
        {currentConversation && (
          <>
            <img
              src={resolveImage(
                currentConversation.other_participant?.profile_image_url
              )}
              alt="avatar"
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <div className="flex-1 flex items-center gap-1">
              <span className="font-semibold text-gray-900 text-base">
                {currentConversation.other_participant?.full_name ||
                  currentConversation.other_participant?.email ||
                  "Unknown User"}
              </span>
              <svg
                className="w-4 h-4 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex gap-3 items-center">
              <button className="text-[#00A8E8] p-1">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </button>
              <button className="text-[#00A8E8] p-1">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </button>
              <button className="text-gray-600 p-1">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <circle cx="10" cy="4" r="1.5" />
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="10" cy="16" r="1.5" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      <div
        ref={chatBodyRef}
        className="flex-1 px-4 py-6 overflow-y-auto bg-white pb-24"
      >
        {!currentConversation ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a conversation
          </div>
        ) : messagesLoading[currentConversation.id] ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Loading messages...
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No messages yet
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <span className="text-xs text-gray-500 px-3 py-1">
                {displayMessages[0]?.date || ""}
              </span>
            </div>
            {displayMessages.map((msg, i) => {
              const showDateSeparator =
                i > 0 &&
                displayMessages[i].date !== displayMessages[i - 1].date;
              return (
                <div key={i}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-6">
                      <span className="text-xs text-gray-500 px-3 py-1">
                        {msg.date}
                      </span>
                    </div>
                  )}
                  {msg.type === "received" && (
                    <div className="mb-4 flex justify-start">
                      <div className="max-w-[75%]">
                        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                          <p className="text-gray-900 text-sm">{msg.text}</p>
                        </div>
                        <span className="text-xs text-gray-400 mt-1 block pl-1">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  )}
                  {msg.type === "sent" && (
                    <div className="mb-4 flex justify-end">
                      <div className="max-w-[75%]">
                        <div className="bg-[#00A8E8] rounded-2xl rounded-tr-sm px-4 py-3">
                          <p className="text-white text-sm">{msg.text}</p>
                        </div>
                        <span className="text-xs text-gray-400 mt-1 block text-right pr-1">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  )}
                  {msg.type === "info" && (
                    <div className="mb-4 flex justify-end">
                      <div className="max-w-[75%]">
                        <div className="bg-blue-50 rounded-2xl rounded-tr-sm px-4 py-3">
                          <p className="text-[#00A8E8] text-sm font-medium">
                            {msg.text}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 mt-1 block text-right pr-1">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
            {sendMessageError && (
              <div className="flex justify-center">
                <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
                  Failed to send: {sendMessageError}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-white flex items-center gap-3 flex-shrink-0 z-60">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Write your message"
          disabled={!currentConversation || sendingMessage}
          className="flex-1 px-4 py-3 rounded-full bg-gray-50 text-gray-700 text-sm focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={!currentConversation || sendingMessage || !input.trim()}
          className="bg-[#00A8E8] rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50"
        >
          {sendingMessage ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

function Message() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const {
    conversations,
    conversationsLoading,
    conversationsError,
    messagesByConversation,
    messagesLoading,
    messagesError,
    wsConnected,
    sendingMessage,
    sendMessageError,
  } = useSelector((state) => state.messenger);

  const { initiatingPayment, paymentError, checkoutUrl, activityStarted } =
    useSelector((state) => state.startActivity);

  // Local state
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [totalHours, setTotalHours] = useState(1);
  // Mobile messenger toggle: when true on mobile we show the chat full-screen,
  // otherwise show the conversations list. Also track whether viewport is mobile.
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Handle conversation selection
  const handleConversationSelect = (index) => {
    setSelectedIndex(index);
  };

  // Get current conversation
  const currentConversation = conversations[selectedIndex] || null;
  const currentMessages = currentConversation
    ? messagesByConversation[currentConversation.id] || []
    : [];

  // Filter conversations by search
  const filteredConversations = conversations.filter(
    (conv) =>
      (conv.other_participant?.full_name || conv.other_participant?.email || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (conv.last_message?.content || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (conv.job_title || "").toLowerCase().includes(search.toLowerCase())
  );

  // Payment calculation (using current conversation's hourly rate or default)
  const RATE_PER_HOUR = currentConversation?.hourly_rate || 1; // Default $13/hr
  const SERVICE_FEE = 7; // Fixed service fee
  const calculatedTotal = RATE_PER_HOUR * totalHours + SERVICE_FEE;

  const paymentDetails = {
    rate: RATE_PER_HOUR,
    hours: totalHours,
    fee: SERVICE_FEE,
    total: calculatedTotal,
  };

  // Booking ID - try to get from conversation.booking, then booking_id, then fallback
  const bookingId =
    currentConversation?.booking ||
    currentConversation?.booking_id ||
    currentConversation?.id ||
    12;

  // Load conversations on component mount
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // When returning from Stripe, lastBookingId will be set in the store via setActivityStarted.
  const { lastBookingId } = useSelector((state) => state.startActivity);
  useEffect(() => {
    if (!lastBookingId) return;
    const bid = String(lastBookingId);
    const idx = conversations.findIndex(
      (c) =>
        String(c.booking) === bid ||
        String(c.booking_id) === bid ||
        String(c.id) === bid
    );
    if (idx >= 0) {
      const conv = conversations[idx];
      setSelectedIndex(idx);
      dispatch(setActiveConversation(String(conv.id)));
      dispatch(fetchMessages(String(conv.id)));
      dispatch(connectWebSocket(String(conv.id)));
      setTimeout(() => {
        if (inputRef.current && typeof inputRef.current.focus === "function")
          inputRef.current.focus();
      }, 100);
    } else if (conversations.length > 0) {
      (async () => {
        const convRes = await dispatch(fetchConversations());
        const convs = convRes.payload || [];
        const idx2 = convs.findIndex(
          (c) =>
            String(c.booking) === bid ||
            String(c.booking_id) === bid ||
            String(c.id) === bid
        );
        if (idx2 >= 0) {
          const conv = convs[idx2];
          setSelectedIndex(idx2);
          dispatch(setActiveConversation(String(conv.id)));
          dispatch(fetchMessages(String(conv.id)));
          dispatch(connectWebSocket(String(conv.id)));
          setTimeout(() => {
            if (
              inputRef.current &&
              typeof inputRef.current.focus === "function"
            )
              inputRef.current.focus();
          }, 100);
        }
      })();
    }
  }, [lastBookingId, conversations, dispatch]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      dispatch(disconnectWebSocket());
      dispatch(clearSendMessageError());
    };
  }, [dispatch]);

  // Redirect to Stripe checkout when URL is received
  useEffect(() => {
    if (checkoutUrl) {
      // Open Stripe checkout in a new tab/window to keep app open
      try {
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      } catch {
        // fallback to same-tab redirect
        window.location.href = checkoutUrl;
      }
      // Close the payment modal since checkout opened in a new tab
      try {
        setShowPayment(false);
      } catch {
        // ignore if state setter not available (shouldn't happen)
      }
    }
  }, [checkoutUrl]);

  // Stripe return handling is performed by the PaymentSuccessRedirect route component

  // Send "Activity has started" message when activity is confirmed
  const activityStartedSentForRef = useRef(null);

  useEffect(() => {
    if (!activityStarted || !currentConversation) return;

    const convId = String(currentConversation.id);

    if (activityStartedSentForRef.current === convId) return;

    activityStartedSentForRef.current = convId;

    const activityMessage = "Activity has started";
    dispatch(
      sendMessage({
        conversationId: currentConversation.id,
        content: activityMessage,
      })
    );

    // Clear flags immediately to avoid re-triggering
    dispatch(clearPaymentState());
    dispatch(clearActivityStarted());
  }, [activityStarted, currentConversation, dispatch]);

  // Watch for activityEnded flag and send system message
  const { activityEnded } = useSelector((state) => state.startActivity);
  useEffect(() => {
    if (activityEnded && currentConversation) {
      const endMessage = "Activity has ended";
      dispatch(
        sendMessage({
          conversationId: currentConversation.id,
          content: endMessage,
        })
      );
      setTimeout(() => {
        dispatch(clearActivityEnded());
      }, 1000);
    }
  }, [activityEnded, currentConversation, dispatch]);

  // Handle conversation selection
  useEffect(() => {
    if (currentConversation) {
      // Load messages for the selected conversation
      dispatch(fetchMessages(currentConversation.id));
      dispatch(setActiveConversation(currentConversation.id));

      // Connect WebSocket for real-time messaging
      dispatch(connectWebSocket(currentConversation.id));

      // Mark conversation as read
      if (currentConversation.unread_count > 0) {
        dispatch(markAsRead(currentConversation.id));
      }
    }

    // Cleanup WebSocket on conversation change
    return () => {
      dispatch(disconnectWebSocket());
    };
  }, [dispatch, currentConversation]);

  // Message display processing (moved up before useEffect hooks)
  const convertMessageToDisplay = (message) => {
    const currentUserId = getCurrentUserId();
    // Handle both string and number comparison for sender IDs
    const messageSenderId = String(message.sender);
    const currentUserIdStr = String(currentUserId);
    const isSentByCurrentUser = messageSenderId === currentUserIdStr;

    return {
      id: message.id || `${message.timestamp}_${message.sender}`,
      type: isSentByCurrentUser ? "sent" : "received",
      text: message.content,
      timestamp: message.timestamp,
      time: formatTime(message.timestamp),
      date: formatDate(message.timestamp),
      senderName: message.sender_name,
    };
  };

  const displayMessages = currentMessages.map(convertMessageToDisplay);

  // Auto-scroll refs
  const chatBodyRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  // Track previous last message id to only scroll when the last message actually changes
  const prevLastMessageIdRef = useRef(null);

  // When a conversation is selected, scroll to the bottom to show latest messages
  useEffect(() => {
    if (!currentConversation) return;

    // Reset previous last message id when switching conversations
    prevLastMessageIdRef.current =
      displayMessages[displayMessages.length - 1]?.id ?? null;

    const end = chatEndRef.current;
    if (end && typeof end.scrollIntoView === "function") {
      requestAnimationFrame(() => {
        try {
          end.scrollIntoView({ behavior: "auto", block: "end" });
        } catch (err) {
          console.error(err);
        }
      });
      return;
    }
    const el = chatBodyRef.current;
    if (el) {
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 50);
    }
  }, [
    selectedIndex,
    currentConversation,
    currentConversation?.id,
    displayMessages,
  ]);

  // Handle sending message
  // Scroll helper
  const scrollToBottom = (opts = { behavior: "smooth" }) => {
    const end = chatEndRef.current;
    if (end && typeof end.scrollIntoView === "function") {
      try {
        end.scrollIntoView({ behavior: opts.behavior, block: "end" });
      } catch {
        /* ignore */
      }
      return;
    }
    const el = chatBodyRef.current;
    if (el) {
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 50);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !currentConversation || sendingMessage) return;

    const messageContent = input.trim();
    // Clear input immediately for optimistic UX
    setInput("");

    // Optimistically scroll to show the user's new message
    scrollToBottom({ behavior: "auto" });

    try {
      // Always use HTTP API for reliability, WebSocket will handle real-time updates
      const resultAction = await dispatch(
        sendMessage({
          conversationId: currentConversation.id,
          content: messageContent,
        })
      );

      // After the send completes, scroll to bottom again to ensure server-rendered message is visible
      requestAnimationFrame(() => scrollToBottom({ behavior: "smooth" }));
      return resultAction;
    } catch {
      // still try to ensure scroll in case of optimistic UI
      requestAnimationFrame(() => scrollToBottom({ behavior: "smooth" }));
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle payment initiation
  const handleProceedToPayment = async () => {
    if (!currentConversation || totalHours < 1) {
      alert("Please enter valid hours");
      return;
    }

    try {
      const result = await dispatch(
        initiateActivityPayment({
          bookingId,
          totalHours,
          paymentGateway: "stripe",
          perHourRate: RATE_PER_HOUR,
        })
      );

      if (initiateActivityPayment.fulfilled.match(result)) {
        // Checkout URL will trigger redirect via useEffect
        // No need to do anything here
      } else {
        alert("Failed to initiate payment. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  // Variables are now declared above in the useEffect section

  useEffect(() => {
    // Determine the id of the last message
    const lastMessageId =
      displayMessages[displayMessages.length - 1]?.id ?? null;

    // Only scroll if the last message id changed
    const isNewLastMessage =
      lastMessageId && lastMessageId !== prevLastMessageIdRef.current;

    if (isNewLastMessage) {
      const end = chatEndRef.current;
      if (end && typeof end.scrollIntoView === "function") {
        requestAnimationFrame(() => {
          try {
            end.scrollIntoView({ behavior: "smooth", block: "end" });
          } catch {
            /* ignore */
          }
        });
      } else {
        const el = chatBodyRef.current;
        if (el) {
          setTimeout(() => {
            el.scrollTop = el.scrollHeight;
          }, 50);
        }
      }
    }

    // Update previous last message id
    prevLastMessageIdRef.current = lastMessageId;
  }, [displayMessages]);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sfpro">
      <Sidebar active="Message" />
      <div className="flex-1 font-sfpro md:ml-64 flex h-screen min-h-0">
        {/* ========== MOBILE VIEW (New Figma Design) ========== */}
        {isMobile ? (
          <>
            {!showChatOnMobile ? (
              // Mobile: Show Conversations List
              <MobileConversationsList
                conversations={conversations}
                search={search}
                setSearch={setSearch}
                selectedIndex={selectedIndex}
                handleConversationSelect={handleConversationSelect}
                setShowChatOnMobile={setShowChatOnMobile}
                conversationsLoading={conversationsLoading}
                conversationsError={conversationsError}
                navigate={navigate}
                resolveImage={resolveImage}
                formatTime={formatTime}
              />
            ) : (
              // Mobile: Show Chat View
              <MobileChatView
                currentConversation={currentConversation}
                setShowChatOnMobile={setShowChatOnMobile}
                resolveImage={resolveImage}
                displayMessages={displayMessages}
                messagesLoading={messagesLoading}
                messagesError={messagesError}
                sendMessageError={sendMessageError}
                chatBodyRef={chatBodyRef}
                chatEndRef={chatEndRef}
                input={input}
                setInput={setInput}
                handleKeyPress={handleKeyPress}
                sendingMessage={sendingMessage}
                handleSendMessage={handleSendMessage}
                inputRef={inputRef}
              />
            )}
          </>
        ) : (
          /* ========== DESKTOP/TABLET VIEW (Existing Design) ========== */
          <>
            {/* Left: Messages List */}
            <div className="w-[340px] border-r border-gray-100 bg-[#f3fafc] flex flex-col h-screen">
              <div className="px-6 py-6 border-b border-gray-100">
                <div className="flex text-left">
                  <button
                    className="-mt-4 mr-4 text-gray-500 hover:text-[#0d99c9] text-xl"
                    onClick={() => navigate(-1)}
                  >
                    &#8592;
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Messages
                  </h2>
                </div>
                <input
                  type="text"
                  placeholder="Search messages"
                  className="w-full px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex-1 overflow-y-auto px-2 pt-2 pb-2">
                {conversationsLoading ? (
                  <div className="text-center text-gray-400 py-8">
                    Loading conversations...
                  </div>
                ) : conversationsError ? (
                  <div className="text-center text-red-400 py-8">
                    Error loading conversations
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    No conversations found
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const originalIndex = conversations.indexOf(conversation);
                    return (
                      <button
                        key={conversation.id}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left mb-1 hover:bg-[#c5c7ca] focus:outline-none ${
                          selectedIndex === originalIndex ? "bg-[#c5c7ca]" : ""
                        }`}
                        onClick={() => handleConversationSelect(originalIndex)}
                      >
                        <img
                          src={resolveImage(
                            conversation.other_participant?.profile_image_url
                          )}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 text-base">
                            {conversation.other_participant?.full_name ||
                              conversation.other_participant?.email ||
                              "Unknown User"}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {conversation.last_message?.content ||
                              "No messages yet"}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-400">
                            {conversation.last_message?.timestamp
                              ? formatTime(conversation.last_message.timestamp)
                              : ""}
                          </span>
                          {conversation.unread_count > 0 && (
                            <span className="bg-[#0d99c9] text-white text-xs rounded-full px-2 py-1 mt-1">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Chat Area */}
            <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden">
              {/* Chat Header - Fixed at top */}
              <div className="flex items-center px-6 sm:px-8 py-4 sm:py-6 border-b border-gray-100 bg-[#f3fafc] relative flex-shrink-0">
                {currentConversation ? (
                  <>
                    <img
                      src={resolveImage(
                        currentConversation.other_participant?.profile_image_url
                      )}
                      alt="avatar"
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div className="flex-1 flex items-center">
                      <div className="font-semibold text-gray-800 text-lg">
                        {currentConversation.other_participant?.full_name ||
                          currentConversation.other_participant?.email ||
                          "Unknown User"}
                      </div>
                      {wsConnected && (
                        <span className="ml-2 text-xs text-green-500">
                          {/* ● Online */}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 text-lg">
                      Select a conversation
                    </div>
                  </div>
                )}
                <div className="flex gap-4 items-center">
                  <button className="text-[#0d99c9] hover:text-[#007bb0] text-xl">
                    <i className="fas fa-phone"></i>
                  </button>
                  <button className="text-[#0d99c9] hover:text-[#007bb0] text-xl">
                    <i className="fas fa-video"></i>
                  </button>
                </div>
                {currentConversation?.booking ? (
                  <div className="ml-4 relative">
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <button
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm"
                          onClick={() => {
                            try {
                              if (bookingId)
                                dispatch(startActivity(String(bookingId)));
                            } catch (e) {
                              console.error("Failed to start activity:", e);
                            }
                            setMenuOpen(false);
                            setShowPayment(true);
                          }}
                        >
                          Start a new activity
                        </button>
                        <button
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm"
                          onClick={async () => {
                            setMenuOpen(false);
                            try {
                              const res = await dispatch(
                                endActivity(bookingId)
                              );
                              const payload = res.payload || res.error || null;
                              alert(
                                `End activity response:\n${JSON.stringify(
                                  payload,
                                  null,
                                  2
                                )}`
                              );
                            } catch {
                              alert("Failed to end activity");
                            }
                          }}
                        >
                          End activity
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Payment Popup */}
              {showPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                  <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-full p-8 relative">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
                      onClick={() => {
                        setShowPayment(false);
                        setPaymentSuccess(false);
                        setTotalHours(1);
                      }}
                    >
                      &times;
                    </button>
                    {!paymentSuccess ? (
                      <>
                        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
                          Proceed to Payment
                        </h2>
                        <p className="text-center text-gray-500 mb-6">
                          Enter total hours and confirm payment
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-500">Rate per hour</span>
                            <span className="text-gray-800 font-semibold">
                              <input
                                type="number"
                                className="bg-white border border-gray-300 rounded w-20 px-2 py-1 text-gray-800 font-semibold text-right"
                                min="1"
                                value={paymentDetails.rate}
                                onChange={() => {}}
                              />
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-500">Total hours</span>
                            <input
                              className="bg-white border border-gray-300 rounded w-20 px-2 py-1 text-gray-800 font-semibold text-right"
                              type="number"
                              min="1"
                              value={totalHours}
                              onChange={(e) =>
                                setTotalHours(
                                  Math.max(1, parseInt(e.target.value) || 1)
                                )
                              }
                            />
                          </div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-500">Service Fee</span>
                            <span className="text-gray-800 font-semibold">
                              ${paymentDetails.fee}
                            </span>
                          </div>
                          <div className="border-t border-gray-200 my-3"></div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">
                              Total Amount
                            </span>
                            <span className="text-[#0d99c9] text-xl font-bold">
                              ${paymentDetails.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        {paymentError && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                            {paymentError}
                          </div>
                        )}
                        <button
                          className="w-full bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleProceedToPayment}
                          disabled={initiatingPayment || totalHours < 1}
                        >
                          {initiatingPayment
                            ? "Processing..."
                            : "Proceed to Payment"}
                        </button>
                        <button
                          className="w-full border border-[#0d99c9] text-[#0d99c9] py-3 rounded-md font-semibold bg-white hover:bg-[#f7fafd] transition"
                          onClick={() => {
                            setShowPayment(false);
                            setPaymentSuccess(false);
                            setTotalHours(1);
                          }}
                          disabled={initiatingPayment}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64">
                        <svg
                          width="48"
                          height="48"
                          fill="#0d99c9"
                          viewBox="0 0 24 24"
                          className="mb-4"
                        >
                          <path d="M20.285 6.709l-11.285 11.285-5.285-5.285 1.415-1.415 3.87 3.87 9.87-9.87z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          Payment Successful!
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Your payment has been processed.
                        </p>
                        <button
                          className="w-full bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition"
                          onClick={() => {
                            setShowPayment(false);
                            setPaymentSuccess(false);
                            setTotalHours(1);
                          }}
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chat Body */}
              <div
                ref={chatBodyRef}
                className="flex-1 px-8 py-6 overflow-y-auto bg-white"
              >
                {!currentConversation ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Select a conversation to start messaging
                  </div>
                ) : messagesLoading[currentConversation.id] ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Loading messages...
                  </div>
                ) : messagesError[currentConversation.id] ? (
                  <div className="flex items-center justify-center h-full text-red-400">
                    Error loading messages
                  </div>
                ) : displayMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <>
                    {displayMessages.length > 0 && (
                      <div className="flex justify-center mb-6">
                        <span className="text-xs text-gray-400 bg-[#f5f5f5] px-4 py-1 rounded-full">
                          {displayMessages[0]?.date || ""}
                        </span>
                      </div>
                    )}
                    {displayMessages.map((msg, i) => (
                      <div key={i} className="mb-4">
                        {msg.type === "received" && (
                          <div className="flex flex-col max-w-[60%] items-start">
                            <span className="text-xs text-gray-500 font-semibold mb-1">
                              {msg.senderName ||
                                currentConversation.other_participant
                                  ?.full_name ||
                                "Other User"}
                            </span>
                            <div className="bg-gray-100 rounded-lg px-5 py-3 text-gray-800 text-sm">
                              {msg.text}
                            </div>
                            <span className="text-xs text-gray-400 mt-1">
                              {msg.time}
                            </span>
                          </div>
                        )}
                        {msg.type === "sent" && (
                          <div className="flex flex-col max-w-[60%] items-end ml-auto">
                            <span className="text-xs text-gray-500 font-semibold mb-1">
                              You
                            </span>
                            <div className="bg-[#0d99c9] rounded-lg px-5 py-3 text-white text-sm">
                              {msg.text}
                            </div>
                            <span className="text-xs text-gray-400 mt-1">
                              {msg.time}
                            </span>
                          </div>
                        )}
                        {msg.type === "info" && (
                          <div className="flex justify-end">
                            <div className="bg-[#f5f5f5] rounded-2xl px-6 py-4 min-w-[220px] max-w-[320px] flex flex-col items-start shadow-sm">
                              <span className="text-[#0d99c9] text-md font-medium mb-2">
                                {msg.text}
                              </span>
                              <span className="text-[#0d99c9] text-sm font-normal ml-auto self-end">
                                {msg.time}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                    {sendMessageError && (
                      <div className="flex justify-center">
                        <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
                          Failed to send message: {sendMessageError}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Chat Input - Fixed at bottom */}
              <div className="px-8 py-6 border-t border-gray-100 bg-white flex items-center flex-shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    currentConversation
                      ? "Start message"
                      : "Select a conversation first"
                  }
                  disabled={!currentConversation || sendingMessage}
                  className="flex-1 px-4 py-3 rounded-md border border-gray-200 bg-[#f7fafd] text-gray-700 text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={
                    !currentConversation || sendingMessage || !input.trim()
                  }
                  className="ml-4 bg-[#0d99c9] hover:bg-[#007bb0] rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      width="22"
                      height="22"
                      fill="white"
                      viewBox="0 0 24 24"
                    >
                      <path d="M2 21l21-9-21-9v7l15 2-15 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Message;
