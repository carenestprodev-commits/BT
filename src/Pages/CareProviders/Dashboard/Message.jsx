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

const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem("access");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("JWT payload:", payload);
      const userId = payload.user_id || payload.id || payload.sub;
      console.log("Extracted user ID:", userId);
      return userId;
    }
  } catch (error) {
    console.error("Error getting user ID from token:", error);
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Conversations List Component
// ─────────────────────────────────────────────────────────────────────────────
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
      (conv.job_title || "").toLowerCase().includes(search.toLowerCase()),
  );

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
            const originalIndex = conversations.indexOf(conversation);
            return (
              <button
                key={conversation.id}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left mb-1 hover:bg-gray-100 focus:outline-none ${
                  selectedIndex === originalIndex ? "bg-gray-100" : ""
                }`}
                onClick={() => {
                  handleConversationSelect(originalIndex);
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
                  <div className="font-medium text-gray-800 text-base">
                    {conversation.other_participant?.full_name ||
                      conversation.other_participant?.email ||
                      "Unknown User"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {conversation.last_message?.content || "No messages yet"}
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
  bookingId,
  setShowPayment,
  showMenu,
}) => {
  return (
    // FIX: Added pt-16 so the chat header is not hidden behind the Sidebar mobile top bar
    <div className="flex flex-col bg-white h-full overflow-hidden pt-16">
      {/* FIX: Chat header now visible with Call + Video + three-dot icons */}
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
            {/* FIX: Call and Video icons added, followed by three-dot menu */}
            <div className="flex gap-3 items-center">
              <button className="text-[#0d99c9] p-1" aria-label="Call">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </button>
              <button className="text-[#0d99c9] p-1" aria-label="Video call">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
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
                          try {
                            await dispatch(endActivity(bookingId));
                            setShowPayment(true);
                          } catch {
                            alert("Failed to end activity");
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
              <div key={i} className="mb-4">
                {msg.type === "received" && (
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-500 font-semibold mb-1">
                      {msg.senderName ||
                        currentConversation.other_participant?.full_name ||
                        "Other User"}
                    </span>
                    {/* FIX: Use inline-block so bubble only expands to fit text content */}
                    <div className="max-w-[75%] bg-gray-100 rounded-lg px-4 py-2.5 text-gray-800 text-sm">
                      {msg.text}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                      {msg.time}
                    </span>
                  </div>
                )}
                {msg.type === "sent" && (
                  <div className="flex flex-col items-end ml-auto">
                    <span className="text-xs text-gray-500 font-semibold mb-1">
                      You
                    </span>
                    {/* FIX: inline-block + max-w so bubble hugs content, no wide empty space */}
                    <div className="max-w-[75%] bg-[#0d99c9] rounded-lg px-4 py-2.5 text-white text-sm inline-block">
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

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [totalHours, setTotalHours] = useState(1);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleConversationSelect = (index) => {
    setSelectedIndex(index);
  };

  const currentConversation = conversations[selectedIndex] || null;
  const currentMessages = currentConversation
    ? messagesByConversation[currentConversation.id] || []
    : [];

  const filteredConversations = conversations.filter(
    (conv) =>
      (conv.other_participant?.full_name || conv.other_participant?.email || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (conv.last_message?.content || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (conv.job_title || "").toLowerCase().includes(search.toLowerCase()),
  );

  const RATE_PER_HOUR = currentConversation?.hourly_rate || 1;
  const [perHourRate, setPerHourRate] = useState(RATE_PER_HOUR);
  const SERVICE_FEE = 7;
  const calculatedTotal = perHourRate * totalHours + SERVICE_FEE;

  const paymentDetails = {
    rate: perHourRate,
    hours: totalHours,
    fee: SERVICE_FEE,
    total: calculatedTotal,
  };

  const bookingId =
    currentConversation?.booking ||
    currentConversation?.booking_id ||
    currentConversation?.id ||
    12;

  useEffect(() => {
    setPerHourRate(currentConversation?.hourly_rate ?? RATE_PER_HOUR);
  }, [currentConversation, RATE_PER_HOUR]);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const { lastBookingId } = useSelector((state) => state.startActivity);
  useEffect(() => {
    if (!lastBookingId) return;
    const bid = String(lastBookingId);
    const idx = conversations.findIndex(
      (c) =>
        String(c.booking) === bid ||
        String(c.booking_id) === bid ||
        String(c.id) === bid,
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
            String(c.id) === bid,
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

  useEffect(() => {
    return () => {
      dispatch(disconnectWebSocket());
      dispatch(clearSendMessageError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (checkoutUrl) {
      try {
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      } catch {
        window.location.href = checkoutUrl;
      }
      try {
        setShowPayment(false);
      } catch {
        // ignore
      }
    }
  }, [checkoutUrl]);

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
      setTimeout(() => {
        dispatch(clearActivityEnded());
      }, 1000);
    }
  }, [activityEnded, currentConversation, dispatch]);

  useEffect(() => {
    if (wsConnected || !currentConversation) return;
    const pollInterval = setInterval(() => {
      dispatch(fetchMessages(currentConversation.id));
    }, 4000);
    return () => clearInterval(pollInterval);
  }, [wsConnected, currentConversation, dispatch]);

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
  }, [dispatch, currentConversation]);

  const convertMessageToDisplay = (message) => {
    const currentUserId = getCurrentUserId();
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
  }, [
    selectedIndex,
    currentConversation,
    currentConversation?.id,
    displayMessages,
  ]);

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

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sfpro">
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
                          conversation.other_participant?.profile_image_url,
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
        )}

        {/* Desktop: Chat Area */}
        {!isMobile && (
          <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden">
            <div className="flex items-center px-6 sm:px-8 py-4 sm:py-6 border-b border-gray-100 bg-[#f3fafc] relative flex-shrink-0">
              {currentConversation ? (
                <>
                  <div className="flex items-center flex-1 cursor-pointer hover:opacity-80 transition">
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
                  className="text-[#0d99c9] hover:text-[#007bb0]"
                  aria-label="Call"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </button>
                <button
                  className="text-[#0d99c9] hover:text-[#007bb0]"
                  aria-label="Video call"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
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
                    <div key={i} className="mb-4">
                      {msg.type === "received" && (
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-gray-500 font-semibold mb-1">
                            {msg.senderName ||
                              currentConversation.other_participant
                                ?.full_name ||
                              "Other User"}
                          </span>
                          {/* FIX: max-w-[60%] but inline so it only grows to fit text */}
                          <div className="max-w-[60%] bg-gray-100 rounded-lg px-4 py-2.5 text-gray-800 text-sm">
                            {msg.text}
                          </div>
                          <span className="text-xs text-gray-400 mt-1">
                            {msg.time}
                          </span>
                        </div>
                      )}
                      {msg.type === "sent" && (
                        <div className="flex flex-col items-end ml-auto">
                          <span className="text-xs text-gray-500 font-semibold mb-1">
                            You
                          </span>
                          {/* FIX: max-w-[60%] + w-fit removes the wide empty background */}
                          <div className="max-w-[60%] w-fit bg-[#0d99c9] rounded-lg px-4 py-2.5 text-white text-sm">
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
                bookingId={bookingId}
                setShowPayment={setShowPayment}
                showMenu={false}
              />
            ) : (
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
            )}
          </div>
        )}

        {/* Payment Modal - Positioned outside ternary to display on all screens */}
        {showPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-6 sm:p-8 relative">
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
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center mb-2">
                    Proceed to Payment
                  </h2>
                  <p className="text-center text-gray-500 mb-6 text-sm sm:text-base">
                    Enter total hours and confirm payment
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-3 text-sm sm:text-base">
                      <span className="text-gray-500">Rate per hour</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        className="bg-white border border-gray-300 rounded w-20 px-2 py-1 text-gray-800 font-semibold text-right text-sm"
                        value={perHourRate}
                        onChange={(e) =>
                          setPerHourRate(
                            Math.max(0, parseFloat(e.target.value) || 0),
                          )
                        }
                      />
                    </div>
                    <div className="flex justify-between items-center mb-3 text-sm sm:text-base">
                      <span className="text-gray-500">Total hours</span>
                      <input
                        className="bg-white border border-gray-300 rounded w-20 px-2 py-1 text-gray-800 font-semibold text-right text-sm"
                        type="number"
                        min="1"
                        value={totalHours}
                        onChange={(e) =>
                          setTotalHours(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                      />
                    </div>
                    <div className="flex justify-between items-center mb-3 text-sm sm:text-base">
                      <span className="text-gray-500">Service Fee</span>
                      <span className="text-gray-800 font-semibold">
                        ${paymentDetails.fee}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 my-3"></div>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Total Amount
                      </span>
                      <span className="text-[#0d99c9] text-lg sm:text-xl font-bold">
                        ${paymentDetails.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {paymentError && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-xs sm:text-sm">
                      {paymentError}
                    </div>
                  )}
                  <button
                    className="w-full bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition mb-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    onClick={handleProceedToPayment}
                    disabled={initiatingPayment || totalHours < 1}
                  >
                    {initiatingPayment
                      ? "Processing..."
                      : "Proceed to Payment for Activity"}
                  </button>
                  <button
                    className="w-full border border-[#0d99c9] text-[#0d99c9] py-3 rounded-md font-semibold bg-white hover:bg-[#f7fafd] transition disabled:opacity-50 text-sm sm:text-base"
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
      </div>
    </div>
  );
}

export default Message;
