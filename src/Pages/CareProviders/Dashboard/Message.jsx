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
import { endActivity } from "../../../Redux/StartActivity";
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
  const RATE_PER_HOUR = currentConversation?.hourly_rate || 13; // Default $13/hr
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
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    }
  }, [checkoutUrl]);

  // Stripe return handling is performed by the PaymentSuccessRedirect route component

  // Send "Activity has started" message when activity is confirmed
  useEffect(() => {
    if (activityStarted && currentConversation) {
      // Send system message to chat
      const activityMessage = "Activity has started";
      dispatch(
        sendMessage({
          conversationId: currentConversation.id,
          content: activityMessage,
        })
      );

      // Clear the activity started flag after sending message
      setTimeout(() => {
        dispatch(clearPaymentState());
        dispatch(clearActivityStarted());
      }, 1000);
    }
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
      <div className="flex-1 font-sfpro md:ml-64 flex h-screen">
        {/* Left: Messages List (hidden on mobile when chat is open) */}
        {(!isMobile || !showChatOnMobile) && (
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
                      onClick={() => {
                        handleConversationSelect(originalIndex);
                        // On mobile, open the chat pane after selecting a conversation
                        if (isMobile) setShowChatOnMobile(true);
                      }}
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
        )}
        {/* Right: Chat Area (hidden on mobile until a conversation is selected) */}
        <div
          className={`flex-1 flex flex-col bg-white h-screen overflow-hidden ${
            isMobile && !showChatOnMobile ? "hidden" : ""
          }`}
        >
          {/* Chat Header - Fixed at top */}
          <div className="flex items-center px-6 sm:px-8 py-4 sm:py-6 border-b border-gray-100 bg-[#f3fafc] relative flex-shrink-0">
            {/* Back to list on mobile */}
            {isMobile && (
              <button
                className="-ml-2 mr-3 text-gray-600 hover:text-gray-800 text-xl"
                onClick={() => setShowChatOnMobile(false)}
                aria-label="Back to conversations"
              >
                &#8592;
              </button>
            )}
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
                <button
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setMenuOpen((v) => !v)}
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
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm"
                      onClick={() => {
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
                          const res = await dispatch(endActivity(bookingId));
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
                          ${paymentDetails.rate}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-500">Total hours</span>
                        <input
                          type="number"
                          min="1"
                          value={totalHours}
                          onChange={(e) =>
                            setTotalHours(
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-gray-800 font-semibold text-right"
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
                {/* Date */}
                {displayMessages.length > 0 && (
                  <div className="flex justify-center mb-6">
                    <span className="text-xs text-gray-400 bg-[#f5f5f5] px-4 py-1 rounded-full">
                      {displayMessages[0]?.date || ""}
                    </span>
                  </div>
                )}
                {/* Messages */}
                {displayMessages.map((msg, i) => (
                  <div key={i} className="mb-4">
                    {msg.type === "received" && (
                      <div className="flex flex-col max-w-[60%] items-start">
                        <span className="text-xs text-gray-500 font-semibold mb-1">
                          {msg.senderName ||
                            currentConversation.other_participant?.full_name ||
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
                {/* end marker for smooth scrolling */}
                <div ref={chatEndRef} />
                {/* Show error if message sending failed */}
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
              disabled={!currentConversation || sendingMessage || !input.trim()}
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
      </div>
    </div>
  );
}

export default Message;
