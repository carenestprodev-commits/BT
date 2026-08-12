/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import UserProfileModal from "../../../Components/UserProfileModal";
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
  clearActivityStarted,
  clearActivityEnded,
  startActivity,
} from "../../../Redux/StartActivity";
import { BASE_URL } from "../../../Redux/config";
import ChatMessageItem from "../../../Components/Chat/ChatMessageItem";
import {
  getConversationPreviewText,
  toDisplayMessage,
} from "../../../lib/chatMessages";
import { getCurrentUserIdFromProfile } from "../../../lib/currentUser";
import { useNotifications } from "../../../Context/NotificationContext";
import VerificationCheckModal from "../../../Components/VerificationCheckModal";
import { containsPhoneNumber } from "../../../utils/phoneUtils";

// Helper functions
const resolveImage = (url) => {
  if (!url)
    return "https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151&size=64";
  if (url.startsWith("http") || url.startsWith("https")) return url;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return url;
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const isServerHtmlError = (err) =>
  typeof err === "string" &&
  (err.includes("<!doctype") ||
    err.includes("<html") ||
    err.includes("Server Error"));

const cleanErrorMessage = (err) => {
  if (!err) return null;
  if (isServerHtmlError(err))
    return "Message delivery confirmation failed. The message may have been sent — please wait or refresh.";
  return err;
};

const buildCallRoute = (bookingId, mode, title) => {
  if (!bookingId) return "";
  const params = new URLSearchParams({ mode: mode === "audio" ? "audio" : "video" });
  if ((title || "").trim()) {
    params.set("title", title.trim());
  }
  return `/careproviders/dashboard/message/${bookingId}/call?${params.toString()}`;
};

const getConversationBookingId = (conversation) =>
  conversation?.booking || conversation?.booking_id || conversation?.id;

const getActiveCallSession = (conversation) => {
  const session = conversation?.call_session;
  return session?.status === "active" ? session : null;
};

const getConversationCallRoute = (conversation, mode) => {
  const bookingId = getConversationBookingId(conversation);
  if (!bookingId) return "";
  const activeSession = getActiveCallSession(conversation);
  const resolvedMode =
    mode || (activeSession?.call_type === "audio" ? "audio" : "video");
  const title = activeSession?.call_title || conversation?.job_title || "";
  return buildCallRoute(bookingId, resolvedMode, title);
};

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Conversations List Component
// ─────────────────────────────────────────────────────────────────────────────
const MobileConversationsList = ({
  conversations,
  search,
  setSearch,
  selectedConversationId,
  handleConversationSelect,
  setShowChatOnMobile,
  conversationsLoading,
  conversationsError,
  navigate,
  handleCallPress,
  resolveImage,
  formatTime,
}) => {
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return conversations.filter(
      (conv) =>
        (conv.other_participant?.full_name || conv.other_participant?.email || "")
          .toLowerCase()
          .includes(query) ||
        getConversationPreviewText(conv.last_message || {})
          .toLowerCase()
          .includes(query) ||
        (conv.job_title || "").toLowerCase().includes(query),
    );
  }, [conversations, search]);

  return (
    <div className="w-full bg-white flex flex-col h-full pt-16">
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
            const activeCall = getActiveCallSession(conversation);
            const callRoute = getConversationCallRoute(conversation);
            return (
              <button
                key={conversation.id}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left mb-1 hover:bg-gray-100 focus:outline-none ${
                  String(selectedConversationId) === String(conversation.id)
                    ? "bg-gray-100"
                    : ""
                }`}
                onClick={() => {
                  handleConversationSelect(conversation.id);
                  setShowChatOnMobile(true);
                }}
              >
                <img
                  src={resolveImage(
                    conversation.other_participant?.profile_image_url,
                  )}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-800 text-base">
                      {conversation.other_participant?.full_name ||
                        conversation.other_participant?.email ||
                        "Unknown User"}
                    </div>
                    {activeCall ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live call
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {activeCall
                      ? `Tap to join ${activeCall.call_type === "audio" ? "audio" : "video"} call`
                      : getConversationPreviewText(conversation.last_message || {})}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400">
                    {conversation.last_message?.timestamp
                      ? formatTime(conversation.last_message.timestamp)
                      : ""}
                  </span>
                  {activeCall && callRoute ? (
                    <span
                      className="mt-1 inline-flex cursor-pointer items-center rounded-full bg-[#0d99c9] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#007bb0]"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCallPress(callRoute);
                      }}
                    >
                      Join
                    </span>
                  ) : null}
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
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Chat View Component
// ─────────────────────────────────────────────────────────────────────────────
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
  menuOpen,
  setMenuOpen,
  dispatch,
  navigate,
  bookingId,
  showMenu,
  currentUserId,
  audioCallRoute,
  videoCallRoute,
  isCallLive,
  handleCallPress,
}) => {
  return (
    <div className="flex flex-col bg-white h-full overflow-hidden pt-16">
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
                currentConversation.other_participant?.profile_image_url,
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
            </div>
            <div className="flex gap-3 items-center">
              <button
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isCallLive
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "bg-[#e6f7fd] text-[#0d99c9] hover:bg-[#d7f0fa]"
                }`}
                aria-label="Start audio call"
                onClick={() => handleCallPress(audioCallRoute)}
                disabled={!audioCallRoute}
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>Call</span>
              </button>
              <button
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isCallLive
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "bg-[#e6f7fd] text-[#0d99c9] hover:bg-[#d7f0fa]"
                }`}
                aria-label="Start video call"
                onClick={() => handleCallPress(videoCallRoute)}
                disabled={!videoCallRoute}
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <span>Video</span>
              </button>
            </div>
            {/* Three-dot menu for mobile */}
            {showMenu && currentConversation?.booking && (
              <div className="relative">
                <button
                  className="text-gray-400 hover:text-gray-600 p-1"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="More options"
                  aria-expanded={menuOpen}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="6" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="18" r="2" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <button
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm border-b border-gray-100"
                      onClick={() => {
                        try {
                          if (bookingId) dispatch(startActivity(String(bookingId)));
                        } catch (e) {
                          console.error("Failed to start activity:", e);
                        }
                        setMenuOpen(false);
                      }}
                    >
                      Start Activity
                    </button>
                    <div className="px-4 py-3 text-xs leading-5 text-gray-500">
                      Give the six-digit code in your job details to the care seeker when you agree to end the activity.
                    </div>
                  </div>
                )}
              </div>
            )}
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
            {displayMessages.map((msg, i) => (
              <div key={msg.id || `${msg.timestamp || "msg"}-${i}`} className="mb-4">
                <ChatMessageItem
                  message={msg}
                  currentConversation={currentConversation}
                  currentUserId={currentUserId}
                />
              </div>
            ))}
            <div ref={chatEndRef} />
            {sendMessageError &&
              !sendMessageError.includes("may have been sent") && (
                <div className="flex justify-center mt-2">
                  <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
                    {cleanErrorMessage(sendMessageError)}
                  </div>
                </div>
              )}
          </>
        )}
      </div>

      <div className="px-2 sm:px-4 py-2 sm:py-3 border-t border-gray-100 bg-white flex items-end gap-2 sm:gap-3 flex-shrink-0 z-60 safe-area-inset-bottom">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Write your message"
          disabled={!currentConversation || sendingMessage}
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-full bg-gray-50 text-gray-700 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#0d99c9] focus:ring-opacity-50 disabled:opacity-50 transition"
        />
        <button
          onClick={handleSendMessage}
          disabled={!currentConversation || sendingMessage || !input.trim()}
          className="bg-[#0d99c9] rounded-full w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center disabled:opacity-50 hover:bg-[#0c87b0] transition-colors flex-shrink-0 touch-target"
          aria-label="Send message"
        >
          {sendingMessage ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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

// ─────────────────────────────────────────────────────────────────────────────
// Main Message Component
// ─────────────────────────────────────────────────────────────────────────────
function Message() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth?.user || null);

  const {
    conversations,
    conversationsLoading,
    conversationsError,
    messagesByConversation,
    messagesLoading,
    messagesError,
    wsConnected,
    wsFallbackActive,
    sendingMessage,
    sendMessageError,
  } = useSelector((state) => state.messenger);

  const { activityStarted } = useSelector((state) => state.startActivity);
  const { notifications, isDegraded } = useNotifications();

  const [input, setInput] = useState("");
  const [profileUser, setProfileUser] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const lastBookingHandledRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleConversationSelect = (conversationId) => {
    setSelectedConversationId(String(conversationId));
  };

  const currentConversation = useMemo(
    () =>
      conversations.find(
        (conversation) =>
          String(conversation.id) === String(selectedConversationId),
      ) || conversations[0] || null,
    [conversations, selectedConversationId],
  );
  const currentMessages = useMemo(
    () =>
      currentConversation
        ? messagesByConversation[currentConversation.id] || []
        : [],
    [currentConversation, messagesByConversation],
  );
  const currentBookingId =
    currentConversation?.booking ||
    currentConversation?.booking_id ||
    currentConversation?.id;
  const currentConversationId = currentConversation?.id || null;

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return conversations.filter(
      (conv) =>
        (conv.other_participant?.full_name || conv.other_participant?.email || "")
          .toLowerCase()
          .includes(query) ||
        getConversationPreviewText(conv.last_message || {})
          .toLowerCase()
          .includes(query) ||
        (conv.job_title || "").toLowerCase().includes(query),
    );
  }, [conversations, search]);

  const bookingId = currentBookingId;
  const activeCallSession = getActiveCallSession(currentConversation);
  const audioCallRoute = getConversationCallRoute(currentConversation, "audio");
  const videoCallRoute = getConversationCallRoute(currentConversation, "video");

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(String(conversations[0].id));
    }
  }, [conversations, selectedConversationId]);

  const { lastBookingId } = useSelector((state) => state.startActivity);
  useEffect(() => {
    if (!lastBookingId) return;
    const bid = String(lastBookingId);
    if (lastBookingHandledRef.current === bid) return;
    const idx = conversations.findIndex(
      (c) =>
        String(c.booking) === bid ||
        String(c.booking_id) === bid ||
        String(c.id) === bid,
    );
    if (idx >= 0) {
      const conv = conversations[idx];
      lastBookingHandledRef.current = bid;
      setSelectedConversationId(String(conv.id));
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
            String(c.id) === bid,
        );
        if (idx2 >= 0) {
          const conv = convs[idx2];
          lastBookingHandledRef.current = bid;
          setSelectedConversationId(String(conv.id));
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

  useEffect(() => {
    return () => {
      dispatch(disconnectWebSocket());
      dispatch(clearSendMessageError());
    };
  }, [dispatch]);

  const activityStartedSentForRef = useRef(null);

  useEffect(() => {
    if (!activityStarted || !currentConversation) return;
    const convId = String(currentConversation.id);
    if (activityStartedSentForRef.current === convId) return;
    activityStartedSentForRef.current = convId;
    dispatch(fetchMessages(currentConversation.id));
    dispatch(fetchConversations());
    dispatch(clearActivityStarted());
  }, [activityStarted, currentConversation, dispatch]);

  const { activityEnded } = useSelector((state) => state.startActivity);
  useEffect(() => {
    if (activityEnded && currentConversation) {
      dispatch(fetchMessages(currentConversation.id));
      dispatch(fetchConversations());
      setTimeout(() => {
        dispatch(clearActivityEnded());
      }, 1000);
    }
  }, [activityEnded, currentConversation, dispatch]);

  const latestNotificationId = notifications[0]?.id || null;
  const latestNotificationType = notifications[0]?.type || "";
  useEffect(() => {
    if (!latestNotificationId) return;
    if (
      ![
        "new_message",
        "call_started",
        "call_ended",
        "activity_started",
        "activity_ended",
        "payment_ready",
        "payment_confirmed",
        "payment_failed",
        "provider_fee_pending",
        "booking_completed",
        "booking_cancelled",
        "booking_rejected",
        "wallet_credit",
      ].includes(latestNotificationType)
    ) {
      return;
    }
    dispatch(fetchConversations());
  }, [dispatch, latestNotificationId, latestNotificationType]);

  useEffect(() => {
    if (currentConversation) {
      dispatch(fetchMessages(currentConversation.id));
      dispatch(setActiveConversation(currentConversation.id));
      dispatch(connectWebSocket(currentConversation.id));
      if (currentConversation.unread_count > 0) {
        dispatch(markAsRead(currentConversation.id));
      }
    }
    return () => {
      dispatch(disconnectWebSocket());
    };
  }, [
    dispatch,
    currentConversation,
    currentConversation?.unread_count,
    currentConversationId,
  ]);

  const notificationFallbackActive = useMemo(
    () => isDegraded || wsFallbackActive,
    [isDegraded, wsFallbackActive],
  );

  useEffect(() => {
    if (!notificationFallbackActive) return;
    const intervalId = setInterval(() => {
      dispatch(fetchConversations());
      if (currentConversationId) {
        dispatch(fetchMessages(currentConversationId));
      }
    }, 4000);
    return () => clearInterval(intervalId);
  }, [dispatch, notificationFallbackActive, currentConversationId]);

  const currentUserId = getCurrentUserIdFromProfile(authUser);
  const hasUsedFreeCall = useMemo(
    () =>
      !authUser?.is_verified &&
      currentMessages.some(
        (message) =>
          message.kind === "system" &&
          (message.payload?.event || "").toLowerCase() === "call_started",
      ),
    [authUser?.is_verified, currentMessages],
  );

  const handleCallPress = (route) => {
    if (!route) return;
    if (!authUser?.is_verified && hasUsedFreeCall) {
      setShowVerification(true);
      return;
    }
    navigate(route);
  };

  const displayMessages = useMemo(
    () =>
      currentMessages.map((message) =>
        toDisplayMessage(message, currentUserId),
      ),
    [currentMessages, currentUserId],
  );

  const chatBodyRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const prevLastMessageIdRef = useRef(null);

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

  useEffect(() => {
    if (!currentConversation) return;
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
  }, [currentConversation, currentConversationId, displayMessages]);

  useEffect(() => {
    const lastMessageId =
      displayMessages[displayMessages.length - 1]?.id ?? null;
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
    prevLastMessageIdRef.current = lastMessageId;
  }, [currentConversation, displayMessages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !currentConversation || sendingMessage) return;
    const messageContent = input.trim();
    if (containsPhoneNumber(messageContent)) {
      alert("Phone numbers and email addresses are not allowed in chat.");
      return;
    }
    setInput("");
    scrollToBottom({ behavior: "auto" });
    try {
      const resultAction = await dispatch(
        sendMessage({
          conversationId: currentConversation.id,
          content: messageContent,
        }),
      );
      requestAnimationFrame(() => scrollToBottom({ behavior: "smooth" }));
      if (sendMessage.rejected.match(resultAction)) {
        dispatch(fetchMessages(currentConversation.id));
        setTimeout(() => dispatch(clearSendMessageError()), 2000);
      }
      return resultAction;
    } catch {
      requestAnimationFrame(() => scrollToBottom({ behavior: "smooth" }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sfpro">
      <UserProfileModal user={profileUser} onClose={() => setProfileUser(null)} />
      <Sidebar active="Message" />
      <div className="flex-1 font-sfpro md:ml-64 flex h-screen min-h-0">
        {/* ══════════════ DESKTOP VIEW ══════════════ */}
        {!isMobile && (
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
                  const activeCall = getActiveCallSession(conversation);
                  const callRoute = getConversationCallRoute(conversation);
                  return (
                    <button
                      key={conversation.id}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left mb-1 hover:bg-[#c5c7ca] focus:outline-none ${
                        String(currentConversationId) ===
                        String(conversation.id)
                          ? "bg-[#c5c7ca]"
                          : ""
                      }`}
                      onClick={() => handleConversationSelect(conversation.id)}
                    >
                      <img
                        src={resolveImage(
                          conversation.other_participant?.profile_image_url,
                        )}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-800 text-base">
                            {conversation.other_participant?.full_name ||
                              conversation.other_participant?.email ||
                              "Unknown User"}
                          </div>
                          {activeCall ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Live call
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {activeCall
                            ? `Tap to join ${activeCall.call_type === "audio" ? "audio" : "video"} call`
                            : getConversationPreviewText(
                                conversation.last_message || {},
                              )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400">
                          {conversation.last_message?.timestamp
                            ? formatTime(conversation.last_message.timestamp)
                            : ""}
                        </span>
                          {activeCall && callRoute ? (
                            <span
                              className="mt-1 inline-flex cursor-pointer items-center rounded-full bg-[#0d99c9] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#007bb0]"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCallPress(callRoute);
                              }}
                            >
                              Join
                            </span>
                        ) : null}
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
        )}

        {/* Desktop: Chat Area */}
        {!isMobile && (
          <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden">
            <div className="flex items-center px-6 sm:px-8 py-4 sm:py-6 border-b border-gray-100 bg-[#f3fafc] relative flex-shrink-0">
              {currentConversation ? (
                <>
                  <button
                    type="button"
                    className="flex items-center flex-1 cursor-pointer hover:opacity-80 transition text-left"
                    onClick={() => setProfileUser(currentConversation.other_participant)}
                  >
                    <img
                      src={resolveImage(
                        currentConversation.other_participant
                          ?.profile_image_url,
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
                        <span className="ml-2 text-xs text-green-500"></span>
                      )}
                    </div>
                  </button>
                </>
              ) : (
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-lg">
                    Select a conversation
                  </div>
                </div>
              )}
              <div className="flex gap-4 items-center">
                <button
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
                    activeCallSession
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-[#e6f7fd] text-[#0d99c9] hover:bg-[#d7f0fa]"
                  }`}
                  aria-label="Start audio call"
                  onClick={() => handleCallPress(audioCallRoute)}
                  disabled={!audioCallRoute}
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>Call</span>
                </button>
                <button
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
                    activeCallSession
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-[#e6f7fd] text-[#0d99c9] hover:bg-[#d7f0fa]"
                  }`}
                  aria-label="Start video call"
                  onClick={() => handleCallPress(videoCallRoute)}
                  disabled={!videoCallRoute}
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <span>Video</span>
                </button>
              </div>
            </div>

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
                    <div key={msg.id || `${msg.timestamp || "msg"}-${i}`} className="mb-4">
                      <ChatMessageItem
                        message={msg}
                        currentConversation={currentConversation}
                        currentUserId={currentUserId}
                      />
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                  {sendMessageError && (
                    <div className="flex justify-center">
                      <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
                        {cleanErrorMessage(sendMessageError)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Chat Input */}
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
                  <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
                    <path d="M2 21l21-9-21-9v7l15 2-15 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════ MOBILE VIEW ══════════════ */}
        {isMobile && (
          <div className="flex-1 w-full min-w-0">
            {showChatOnMobile ? (
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
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                dispatch={dispatch}
                navigate={navigate}
                bookingId={bookingId}
                showMenu={false}
                currentUserId={currentUserId}
                audioCallRoute={audioCallRoute}
                videoCallRoute={videoCallRoute}
                isCallLive={Boolean(activeCallSession)}
                handleCallPress={handleCallPress}
              />
            ) : (
              <MobileConversationsList
                conversations={conversations}
                search={search}
                setSearch={setSearch}
                selectedConversationId={selectedConversationId}
                handleConversationSelect={handleConversationSelect}
                setShowChatOnMobile={setShowChatOnMobile}
                conversationsLoading={conversationsLoading}
                conversationsError={conversationsError}
                navigate={navigate}
                handleCallPress={handleCallPress}
                resolveImage={resolveImage}
                formatTime={formatTime}
              />
            )}
          </div>
        )}

        <VerificationCheckModal
          isOpen={showVerification}
          user={authUser}
          userType="provider"
          actionType="call"
          onCancel={() => setShowVerification(false)}
          isVerified={authUser?.is_verified || false}
        />
      </div>
    </div>
  );
}

export default Message;
