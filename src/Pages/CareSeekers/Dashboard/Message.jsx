/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useMemo } from "react";
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
  fetchActivityPaymentPreview,
  initiateActivityPayment,
  clearPaymentState,
  clearActivityStarted,
  clearActivityEnded,
} from "../../../Redux/StartActivity";
import { endActivity, startActivity } from "../../../Redux/StartActivity";
import { BASE_URL } from "../../../Redux/config";
import ChatMessageItem from "../../../Components/Chat/ChatMessageItem";
import {
  getConversationPreviewText,
  toDisplayMessage,
} from "../../../lib/chatMessages";
import { getCurrentUserIdFromProfile } from "../../../lib/currentUser";
import { formatCurrencyAmount } from "../../../utils/countryHelper";
import { useNotifications } from "../../../Context/NotificationContext";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

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

const extractErrorMessage = (value, fallback = "Request failed.") => {
  if (!value) return fallback;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed?.error) return parsed.error;
      if (parsed?.detail) return parsed.detail;
      if (parsed?.message) return parsed.message;
      const first = Object.values(parsed).find((entry) =>
        Array.isArray(entry) ? typeof entry[0] === "string" : typeof entry === "string",
      );
      if (Array.isArray(first)) return first[0] || fallback;
      return first || value;
    } catch {
      return value;
    }
  }
  if (typeof value === "object") {
    return value.error || value.detail || value.message || fallback;
  }
  return fallback;
};

const buildCallRoute = (bookingId, mode, title) => {
  if (!bookingId) return "";
  const params = new URLSearchParams({ mode: mode === "audio" ? "audio" : "video" });
  if ((title || "").trim()) {
    params.set("title", title.trim());
  }
  return `/careseekers/dashboard/message/${bookingId}/call?${params.toString()}`;
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
// Mobile Conversations List
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
    // FIX: Added pt-16 to push content below the Sidebar mobile top bar
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
                className={`w-full flex items-center gap-3 px-4 py-4 transition text-left border-b border-gray-50 hover:bg-gray-50 ${
                  String(selectedConversationId) === String(conversation.id)
                    ? "bg-gray-50"
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
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-medium text-gray-900 text-sm truncate">
                      {conversation.other_participant?.full_name ||
                        conversation.other_participant?.email ||
                        "Unknown User"}
                    </span>
                    {activeCall ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live call
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {activeCall
                      ? `Tap to join ${activeCall.call_type === "audio" ? "audio" : "video"} call`
                      : getConversationPreviewText(conversation.last_message || {})}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">
                    {conversation.last_message?.timestamp
                      ? formatTime(conversation.last_message.timestamp)
                      : ""}
                  </span>
                  {activeCall && callRoute ? (
                    <span
                      className="inline-flex cursor-pointer items-center rounded-full bg-[#0d99c9] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#007bb0]"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(callRoute);
                      }}
                    >
                      Join
                    </span>
                  ) : null}
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

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Chat View
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
  setShowPayment,
  showMenu,
  currentUserId,
  audioCallRoute,
  videoCallRoute,
  isCallLive,
}) => {
  return (
    // FIX: Added pt-16 so the chat header is not hidden behind the Sidebar mobile top bar
    <div className="flex flex-col bg-white h-full overflow-hidden pt-16">
      {/* FIX: Chat header now visible with Call + Video icons added */}
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
                onClick={() => audioCallRoute && navigate(audioCallRoute)}
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
                onClick={() => videoCallRoute && navigate(videoCallRoute)}
                disabled={!videoCallRoute}
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <span>Video</span>
              </button>
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
                            if (bookingId)
                              dispatch(startActivity(String(bookingId)));
                          } catch (e) {
                            console.error("Failed to start activity:", e);
                          }
                          setMenuOpen(false);
                        }}
                      >
                        Start Activity
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm"
                        onClick={async () => {
                          setMenuOpen(false);
                          const result = await dispatch(endActivity(bookingId));
                          if (endActivity.fulfilled.match(result)) {
                            setShowPayment(true);
                          } else {
                            const message = extractErrorMessage(
                              result?.payload || result?.error?.message,
                              "Failed to end activity.",
                            );
                            alert(message);
                          }
                        }}
                      >
                        End Activity
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* FIX: Removed sm:mt-40 that was pushing body content down incorrectly */}
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
                <div key={msg.id || `${msg.timestamp || "msg"}-${i}`}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-6">
                      <span className="text-xs text-gray-500 px-3 py-1">
                        {msg.date}
                      </span>
                    </div>
                  )}
                  <ChatMessageItem
                    message={msg}
                    currentConversation={currentConversation}
                    currentUserId={currentUserId}
                  />
                </div>
              );
            })}
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

      <div className="px-2 sm:px-4 py-2 sm:py-3 border-t border-gray-100 bg-white flex items-end gap-2 sm:gap-3 flex-shrink-0 safe-area-inset-bottom">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Write your message"
          disabled={!currentConversation || sendingMessage}
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-full bg-gray-50 text-gray-700 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00A8E8] focus:ring-opacity-50 disabled:opacity-50 transition"
        />
        <button
          onClick={handleSendMessage}
          disabled={!currentConversation || sendingMessage || !input.trim()}
          className="bg-[#00A8E8] rounded-full w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center disabled:opacity-50 hover:bg-[#0091cc] transition-colors flex-shrink-0"
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
    sendingMessage,
    sendMessageError,
  } = useSelector((state) => state.messenger);

  const {
    loadingPaymentPreview,
    paymentPreviewError,
    initiatingPayment,
    paymentError,
    checkoutUrl,
    activityStarted,
    currencyCode,
    currencySymbol,
    countryUsed,
    localizedPerHourRate,
    localizedSubtotal,
    localizedServiceFee,
    localizedTotalAmount,
    isFallbackPrice,
  } = useSelector((state) => state.startActivity);
  const { notifications } = useNotifications();

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [totalHours, setTotalHours] = useState("1");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
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

  const handleConversationSelect = (conversationId) =>
    setSelectedConversationId(String(conversationId));

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

  const RATE_PER_HOUR = currentConversation?.hourly_rate || 1;
  const SERVICE_FEE = 7;
  const displayHours = totalHours === "" ? 0 : Number(totalHours);
  const calculatedSubtotal = RATE_PER_HOUR * displayHours;
  const calculatedTotal = calculatedSubtotal + SERVICE_FEE;
  const uiCurrencyCode = currencyCode || "USD";
  const uiCurrencySymbol = currencySymbol || "$";
  const displayPerHourRate = localizedPerHourRate ?? RATE_PER_HOUR;
  const displaySubtotal =
    localizedSubtotal ?? displayPerHourRate * displayHours;
  const displayServiceFee = localizedServiceFee ?? SERVICE_FEE;
  const displayTotal = localizedTotalAmount ?? calculatedTotal;
  const paymentDetails = {
    rate: displayPerHourRate,
    hours: displayHours,
    subtotal: displaySubtotal,
    fee: displayServiceFee,
    total: displayTotal,
  };

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
      setTimeout(() => inputRef.current?.focus(), 100);
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
          setTimeout(() => inputRef.current?.focus(), 100);
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

  useEffect(() => {
    if (!showPayment || !bookingId) return;
    const parsedHours = Number.parseInt(totalHours, 10);
    if (!Number.isFinite(parsedHours) || parsedHours < 1) return;
    const timeout = setTimeout(() => {
      dispatch(
        fetchActivityPaymentPreview({ bookingId, totalHours: parsedHours }),
      );
    }, 250);
    return () => clearTimeout(timeout);
  }, [showPayment, bookingId, totalHours, dispatch]);

  useEffect(() => {
    if (checkoutUrl) {
      try {
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      } catch {
        window.location.href = checkoutUrl;
      }
      setShowPayment(false);
      dispatch(clearPaymentState());
    }
  }, [checkoutUrl, dispatch]);

  const activityStartedSentForRef = useRef(null);
  useEffect(() => {
    if (!activityStarted || !currentConversation) return;
    const convId = String(currentConversation.id);
    if (activityStartedSentForRef.current === convId) return;
    activityStartedSentForRef.current = convId;
    dispatch(
      sendMessage({
        conversationId: currentConversation.id,
        content: "Activity has started",
      }),
    );
    dispatch(clearPaymentState());
    dispatch(clearActivityStarted());
  }, [activityStarted, currentConversation, dispatch]);

  const { activityEnded } = useSelector((state) => state.startActivity);
  useEffect(() => {
    if (activityEnded && currentConversation) {
      dispatch(
        sendMessage({
          conversationId: currentConversation.id,
          content: "Activity has ended",
        }),
      );
      setTimeout(() => dispatch(clearActivityEnded()), 1000);
    }
  }, [activityEnded, currentConversation, dispatch]);

  useEffect(() => {
    if (currentConversationId) {
      dispatch(fetchMessages(currentConversationId));
      dispatch(setActiveConversation(currentConversationId));
      dispatch(connectWebSocket(currentConversationId));
      if (currentConversation?.unread_count > 0) {
        dispatch(markAsRead(currentConversationId));
      }
    }
    return () => dispatch(disconnectWebSocket());
  }, [dispatch, currentConversationId]);

  const latestNotificationId = notifications[0]?.id || null;
  const latestNotificationType = notifications[0]?.type || "";
  useEffect(() => {
    if (!latestNotificationId) return;
    if (
      ![
        "new_message",
        "call_started",
        "call_ended",
        "recording_processing",
        "recording_uploaded",
        "recording_errored",
      ].includes(latestNotificationType)
    ) {
      return;
    }
    dispatch(fetchConversations());
  }, [dispatch, latestNotificationId, latestNotificationType]);

  const currentUserId = getCurrentUserIdFromProfile(authUser);

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
    if (end?.scrollIntoView) {
      try {
        end.scrollIntoView({ behavior: opts.behavior, block: "end" });
      } catch {
        /* ignore */
      }
      return;
    }
    const el = chatBodyRef.current;
    if (el)
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 50);
  };

  useEffect(() => {
    if (!currentConversation) return;
    prevLastMessageIdRef.current =
      displayMessages[displayMessages.length - 1]?.id ?? null;
    const end = chatEndRef.current;
    if (end?.scrollIntoView) {
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
    if (el)
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 50);
  }, [currentConversationId, displayMessages]);

  useEffect(() => {
    const lastMessageId =
      displayMessages[displayMessages.length - 1]?.id ?? null;
    if (lastMessageId && lastMessageId !== prevLastMessageIdRef.current) {
      const end = chatEndRef.current;
      if (end?.scrollIntoView) {
        requestAnimationFrame(() => {
          try {
            end.scrollIntoView({ behavior: "smooth", block: "end" });
          } catch {
            /* ignore */
          }
        });
      } else {
        const el = chatBodyRef.current;
        if (el)
          setTimeout(() => {
            el.scrollTop = el.scrollHeight;
          }, 50);
      }
    }
    prevLastMessageIdRef.current = lastMessageId;
  }, [displayMessages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !currentConversation || sendingMessage) return;

    const messageContent = input.trim();
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

  const handleProceedToPayment = async () => {
    if (!currentConversation) {
      alert("No active conversation selected");
      return;
    }
    const parsedHours = Number.parseInt(totalHours, 10);
    if (!Number.isFinite(parsedHours) || parsedHours < 1) {
      alert("Total hours must be at least 1.");
      return;
    }
    try {
      const result = await dispatch(
        initiateActivityPayment({
          bookingId,
          totalHours: parsedHours,
          paymentGateway: "stripe",
        }),
      );
      if (!initiateActivityPayment.fulfilled.match(result)) {
        alert("Failed to initiate payment. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sfpro">
      <Sidebar active="Message" />
      <div className="flex-1 font-sfpro md:ml-64 flex h-screen min-h-0">
        {/* ══════════════ MOBILE VIEW ══════════════ */}
        {isMobile ? (
          <div className="flex-1 w-full min-w-0">
            {!showChatOnMobile ? (
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
                resolveImage={resolveImage}
                formatTime={formatTime}
              />
            ) : (
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
                setShowPayment={setShowPayment}
                showMenu={true}
                currentUserId={currentUserId}
                audioCallRoute={audioCallRoute}
                videoCallRoute={videoCallRoute}
                isCallLive={Boolean(activeCallSession)}
              />
            )}
          </div>
        ) : (
          /* ══════════════ DESKTOP VIEW ══════════════ */
          <>
            {/* Left: Conversations list */}
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
                                navigate(callRoute);
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

            {/* Right: Chat area */}
            <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center px-6 sm:px-8 py-4 sm:py-6 border-b border-gray-100 bg-[#f3fafc] relative flex-shrink-0">
                {currentConversation ? (
                  <>
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
                        <span
                          className="ml-2 w-2 h-2 rounded-full bg-green-400 inline-block"
                          title="Online"
                        />
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
                  <button
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
                      activeCallSession
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-[#e6f7fd] text-[#0d99c9] hover:bg-[#d7f0fa]"
                    }`}
                    aria-label="Start audio call"
                    onClick={() => audioCallRoute && navigate(audioCallRoute)}
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
                    onClick={() => videoCallRoute && navigate(videoCallRoute)}
                    disabled={!videoCallRoute}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    <span>Video</span>
                  </button>
                </div>

                {currentConversation?.booking ? (
                  <div className="ml-4 relative" ref={menuRef}>
                    <button
                      className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded"
                      onClick={() => setMenuOpen((v) => !v)}
                      aria-label="Activity options"
                      aria-expanded={menuOpen}
                    >
                      <svg
                        width="22"
                        height="22"
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
                              if (bookingId)
                                dispatch(startActivity(String(bookingId)));
                            } catch (e) {
                              console.error("Failed to start activity:", e);
                            }
                            setMenuOpen(false);
                          }}
                        >
                          Start Activity
                        </button>
                        <button
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm"
                          onClick={async () => {
                            setMenuOpen(false);
                            const result = await dispatch(endActivity(bookingId));
                            if (endActivity.fulfilled.match(result)) {
                              setShowPayment(true);
                            } else {
                              const message = extractErrorMessage(
                                result?.payload || result?.error?.message,
                                "Failed to end activity.",
                              );
                              alert(message);
                            }
                          }}
                        >
                          End Activity
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
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
                    <div className="flex justify-center mb-6">
                      <span className="text-xs text-gray-400 bg-[#f5f5f5] px-4 py-1 rounded-full">
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
                    {sendMessageError && (
                      <div className="flex justify-center mt-2">
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
                  ref={inputRef}
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

        {/* Payment Modal - Positioned outside ternary to display on all screens */}
        {showPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-6 sm:p-8 relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
                onClick={() => {
                  dispatch(clearPaymentState());
                  setShowPayment(false);
                  setPaymentSuccess(false);
                  setTotalHours("1");
                }}
              >
                &times;
              </button>
              {!paymentSuccess ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center mb-2">
                    Proceed to Payment
                  </h2>
                  <p className="text-center text-gray-500 mb-6 text-sm sm:text-base">
                    Enter total hours and confirm payment
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-3 text-sm sm:text-base">
                      <span className="text-gray-500">Rate per hour</span>
                      <span className="text-gray-800 font-semibold">
                        {formatCurrencyAmount(
                          paymentDetails.rate,
                          uiCurrencyCode,
                          uiCurrencySymbol,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-3 text-sm sm:text-base">
                      <span className="text-gray-500">Total hours</span>
                      <input
                        className="bg-white border border-gray-300 rounded w-20 px-2 py-1 text-gray-800 font-semibold text-right text-sm"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={totalHours}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          setTotalHours(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                    <div className="flex justify-between items-center mb-3 text-sm sm:text-base">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-800 font-semibold">
                        {formatCurrencyAmount(
                          paymentDetails.subtotal,
                          uiCurrencyCode,
                          uiCurrencySymbol,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-3 text-sm sm:text-base">
                      <span className="text-gray-500">Service Fee</span>
                      <span className="text-gray-800 font-semibold">
                        {formatCurrencyAmount(
                          paymentDetails.fee,
                          uiCurrencyCode,
                          uiCurrencySymbol,
                        )}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 my-3"></div>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Total Amount
                      </span>
                      <span className="text-[#0d99c9] text-lg sm:text-xl font-bold">
                        {formatCurrencyAmount(
                          paymentDetails.total,
                          uiCurrencyCode,
                          uiCurrencySymbol,
                        )}
                      </span>
                    </div>
                  </div>
                  {countryUsed && (
                    <p className="text-xs text-gray-500 mb-4">
                      Localized for {countryUsed}
                      {isFallbackPrice ? " (fallback pricing)" : ""}
                    </p>
                  )}
                  {!countryUsed && (
                    <p className="text-xs text-gray-500 mb-4">
                      Calculated from completed activity logs
                    </p>
                  )}
                  {loadingPaymentPreview && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs sm:text-sm">
                      Loading payment breakdown...
                    </div>
                  )}
                  {paymentPreviewError && (
                    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded text-amber-700 text-xs sm:text-sm">
                      Could not load server preview. Final charge will still use
                      server-calculated totals.
                      <div className="mt-1">{paymentPreviewError}</div>
                    </div>
                  )}
                  {paymentError && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-xs sm:text-sm">
                      {paymentError}
                    </div>
                  )}
                  <button
                    className="w-full bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition mb-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    onClick={handleProceedToPayment}
                    disabled={initiatingPayment || loadingPaymentPreview}
                  >
                    {initiatingPayment ? "Processing..." : "Proceed to Payment"}
                  </button>
                  <button
                    className="w-full border border-[#0d99c9] text-[#0d99c9] py-3 rounded-md font-semibold bg-white hover:bg-[#f7fafd] transition disabled:opacity-50 text-sm sm:text-base"
                    onClick={() => {
                      dispatch(clearPaymentState());
                      setShowPayment(false);
                      setPaymentSuccess(false);
                      setTotalHours("1");
                    }}
                    disabled={initiatingPayment}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <svg
                    width="48"
                    height="48"
                    fill="#0d99c9"
                    viewBox="0 0 24 24"
                    className="mb-4"
                  >
                    <path d="M20.285 6.709l-11.285 11.285-5.285-5.285 1.415-1.415 3.87 3.87 9.87-9.87z" />
                  </svg>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-gray-500 mb-4 text-center text-sm sm:text-base">
                    Your payment has been processed.
                  </p>
                  <button
                    className="w-full bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition text-sm sm:text-base"
                    onClick={() => {
                      dispatch(clearPaymentState());
                      setShowPayment(false);
                      setPaymentSuccess(false);
                      setTotalHours("1");
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;
