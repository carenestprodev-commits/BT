/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useMemo } from "react";
import Sidebar from "./Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  setActiveConversation,
  connectWebSocket,
  disconnectWebSocket,
  clearSendMessageError,
} from "../../../Redux/Messenger";
import {
  fetchActivityPaymentPreview,
  initiateActivityPayment,
  startActivity,
  endActivity,
  clearPaymentState,
  clearActivityStarted,
  clearActivityEnded,
} from "../../../Redux/StartActivity";
import {
  fetchProviderDetails,
  clearProviderDetails,
} from "../../../Redux/ProvidersDetails";
import { BASE_URL } from "../../../Redux/config";
import ChatMessageItem from "../../../Components/Chat/ChatMessageItem";
import { toDisplayMessage } from "../../../lib/chatMessages";
import { getCurrentUserIdFromProfile } from "../../../lib/currentUser";
import {
  formatCurrencyAmount,
  getUserCurrencyInfo,
} from "../../../utils/countryHelper";
import VerificationCheckModal from "../../../Components/VerificationCheckModal";
import { containsPhoneNumber } from "../../../utils/phoneUtils";

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

/**
 * Detects whether an error string is a raw HTML server error response (e.g. Django 500 page).
 * These occur when the backend saves the message but the HTTP response serialisation fails.
 */
const isServerHtmlError = (err) =>
  typeof err === "string" &&
  (err.includes("<!doctype") ||
    err.includes("<html") ||
    err.includes("Server Error"));

/**
 * Returns a human-readable version of an error.
 * Converts raw 500 HTML pages into a friendly message.
 */
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
  return `/careseekers/dashboard/message/${bookingId}/call?${params.toString()}`;
};

function MessageDetails() {
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
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const providerId = params?.id;

  // Redux state
  const {
    conversations,
    conversationsLoading,
    messagesByConversation,
    messagesLoading,
    sendingMessage,
    wsFallbackActive,
    sendMessageError,
  } = useSelector((state) => state.messenger);

  const { details: providerDetails } = useSelector(
    (s) => s.providersDetails || { details: null },
  );

  const {
    loadingPaymentPreview,
    paymentPreviewError,
    initiatingPayment,
    paymentError,
    checkoutUrl,
    activityStarted,
    activityEnded,
    currencyCode,
    currencySymbol,
    countryUsed,
    localizedPerHourRate,
    localizedSubtotal,
    localizedServiceFee,
    localizedTotalAmount,
    isFallbackPrice,
  } = useSelector((state) => state.startActivity);

  // Local state
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [totalHours, setTotalHours] = useState("1");
  const [messageCount, setMessageCount] = useState(0);
  const [showVerification, setShowVerification] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const defaultCurrency = getUserCurrencyInfo();

  const chatBodyRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const activityStartedSentForRef = useRef(null);

  // Get current conversation (find by provider_id or other_participant id)
  const currentConversation = useMemo(
    () =>
      conversations.find(
        (c) =>
          c.other_participant?.id === parseInt(providerId) ||
          c.provider_id === parseInt(providerId) ||
          c.other_user_id === parseInt(providerId),
      ),
    // ✅ Only recompute when the conversation list length changes or providerId changes
    // Using conversations.length + the actual IDs prevents new-reference churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversations.length, providerId],
  );
  const currentBookingId =
    currentConversation?.booking ||
    currentConversation?.booking_id ||
    currentConversation?.id;

  const currentMessages = useMemo(
    () =>
      currentConversation
        ? messagesByConversation[currentConversation.id] || []
        : [],
    [currentConversation, messagesByConversation],
  );

  // Service fee is 15% of total
  const perHourRate =
    currentConversation?.hourly_rate || providerDetails?.hourly_rate || 0;
  const serviceFeeFlat = 7;
  const displayHours = totalHours === "" ? 0 : Number(totalHours);
  const subtotal = perHourRate * displayHours;
  const serviceFee = serviceFeeFlat;
  const calculatedTotal = subtotal + serviceFee;
  const uiCurrencyCode = currencyCode || defaultCurrency.currencyCode;
  const uiCurrencySymbol = currencySymbol || defaultCurrency.currencySymbol;
  const displayPerHourRate = localizedPerHourRate ?? perHourRate;
  const displaySubtotal = localizedSubtotal ?? subtotal;
  const displayServiceFee = localizedServiceFee ?? serviceFee;
  const displayTotal = localizedTotalAmount ?? calculatedTotal;

  const bookingId =
    currentConversation?.booking ||
    currentConversation?.booking_id ||
    currentConversation?.id;
  const currentUserId = getCurrentUserIdFromProfile(currentUser);
  const startActivityIfVerified = () => {
    if (!currentUser?.is_verified) {
      setShowVerification(true);
      return;
    }
    if (bookingId) {
      dispatch(startActivity(String(bookingId)));
    }
  };

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

  // Initialize user and load data
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }

    if (providerId) {
      dispatch(fetchProviderDetails(providerId));
      dispatch(fetchConversations());
    }

    return () => {
      dispatch(clearProviderDetails());
      dispatch(disconnectWebSocket());
    };
  }, [dispatch, providerId]);

  // ✅ Use the stable ID as dependency, not the whole object
  const currentConversationId = currentConversation?.id;

  // Load/update messages when conversation changes
  useEffect(() => {
    if (!currentConversationId) return;
    dispatch(fetchMessages(currentConversationId));
    dispatch(setActiveConversation(currentConversationId));
    dispatch(connectWebSocket(currentConversationId));

    return () => {
      dispatch(disconnectWebSocket());
    };
  }, [dispatch, currentConversationId]);

  useEffect(() => {
    if (!wsFallbackActive || !currentConversationId) return;
    const intervalId = setInterval(() => {
      dispatch(fetchMessages(currentConversationId));
    }, 4000);
    return () => clearInterval(intervalId);
  }, [dispatch, wsFallbackActive, currentConversationId]);

  // Update message count when messages arrive
  // ✅ Depend on length, not the array reference
  useEffect(() => {
    setMessageCount(currentMessages.length);
  }, [currentMessages.length]);

  // Redirect to Stripe checkout
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

  // Handle activity started — send system message, then clear flags
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

    // ✅ Clear payment + activity state so no payment modal leaks in from this effect
    dispatch(clearPaymentState());
    dispatch(clearActivityStarted());
  }, [activityStarted, currentConversation, dispatch]);

  // Handle activity ended — send system message (payment modal is shown by the handler, not here)
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

  // Message display processing
  const displayMessages = useMemo(() => {
    return currentMessages.map((message) =>
      toDisplayMessage(message, currentUserId),
    );
    // ✅ Only recompute when the actual messages change, not on every render
  }, [currentMessages, currentUser]);

  const handleSendMessage = async () => {
    if (!currentConversation || !input.trim()) return;
    if (containsPhoneNumber(input)) {
      alert("Phone numbers and email addresses are not allowed in chat.");
      return;
    }

    if (messageCount === 0) {
      setShowActivityModal(true);
      return;
    }

    const resultAction = await dispatch(
      sendMessage({
        conversationId: currentConversation.id,
        content: input.trim(),
      }),
    );

    setInput("");
    setMessageCount(messageCount + 1);
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    // ✅ If backend returned 500, message was still saved.
    // Refetch to confirm delivery, then silently clear the error.
    if (sendMessage.rejected.match(resultAction)) {
      dispatch(fetchMessages(currentConversation.id));
      setTimeout(() => dispatch(clearSendMessageError()), 2000);
    }
  };
  /**
   * Called when the Careseeker picks an action from the "Initiate Activity" modal
   * that appears on their very first message.
   *
   * ✅ "start" → send the message + call startActivity API. NO payment modal.
   * ✅ "end"   → send the message + call endActivity API + show payment modal.
   */
  const handleFirstMessageAction = async (action) => {
    if (action === "start") {
      // Send the queued message
      dispatch(
        sendMessage({
          conversationId: currentConversation.id,
          content: input.trim(),
        }),
      );
      setInput("");
      setMessageCount(messageCount + 1);

      // Start the activity via API
      try {
        startActivityIfVerified();
      } catch (e) {
        console.error("Failed to start activity:", e);
      }

      // ✅ Close the modal — do NOT open the payment modal here
      setShowActivityModal(false);
    } else if (action === "end") {
      // Send the queued message
      dispatch(
        sendMessage({
          conversationId: currentConversation.id,
          content: input.trim(),
        }),
      );
      setInput("");
      setMessageCount(messageCount + 1);

      // End the activity via API
      let endResult = null;
      if (bookingId) {
        endResult = await dispatch(endActivity(bookingId));
      }

      setShowActivityModal(false);

      if (endResult && endActivity.fulfilled.match(endResult)) {
        // ✅ Only successful End Activity opens the payment modal
        setShowPayment(true);
      } else {
        const message = extractErrorMessage(
          endResult?.payload || endResult?.error?.message,
          "Failed to end activity.",
        );
        alert(message);
      }
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

      if (initiateActivityPayment.fulfilled.match(result)) {
        // Checkout URL will trigger redirect via useEffect
      } else {
        alert("Failed to initiate payment. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  /**
   * Called from the three-dot menu in the chat header.
   *
   * ✅ "start" → only dispatches startActivity, no payment modal.
   * ✅ "end"   → dispatches endActivity, then opens payment modal.
   */
  const handleMenuAction = async (action) => {
    if (action === "start") {
      try {
        startActivityIfVerified();
      } catch (e) {
        console.error("Failed to start activity:", e);
      }
      // ✅ Close menu only — no payment modal for Start Activity
      setMenuOpen(false);
    } else if (action === "end") {
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
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentConversation && !conversationsLoading) {
    return (
      <div className="flex min-h-screen bg-white font-sfpro">
        <Sidebar active="Message" />
        <div className="flex-1 font-sfpro px-8 py-8 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No conversation found</p>
            <button
              className="text-[#0d99c9] hover:text-[#007bb0]"
              onClick={() => navigate("/careseekers/dashboard/message")}
            >
              Back to Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sfpro">
      <Sidebar active="Message" />
      <div className="flex-1 font-sfpro md:ml-64 flex flex-col h-[calc(100vh-3.5rem)] md:h-screen mt-14 md:mt-0 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-20 md:z-40 flex items-center px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 border-b border-gray-100 bg-[#f3fafc] relative flex-shrink-0 gap-2 sm:gap-4">
          <button
            className="mr-4 text-gray-500 hover:text-gray-700 text-xl focus:outline-none focus:ring-2 focus:ring-[#0d99c9] focus:ring-offset-2 rounded transition"
            onClick={() => navigate("/careseekers/dashboard/message")}
            aria-label="Back to messages"
          >
            ←
          </button>

          {currentConversation ? (
            <>
              <div className="flex items-center flex-1 cursor-pointer hover:opacity-80 transition">
                <img
                  src={resolveImage(
                    currentConversation.other_participant?.profile_image_url,
                  )}
                  alt={
                    currentConversation.other_participant?.full_name ||
                    "Provider avatar"
                  }
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div className="font-semibold text-gray-800 text-lg">
                  {currentConversation.other_participant?.full_name ||
                    currentConversation.other_participant?.email ||
                    "Unknown User"}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1">
              <div className="font-semibold text-gray-800 text-lg">
                Loading...
              </div>
            </div>
          )}

          {/* Call and Video icons */}
          <div className="flex gap-3 sm:gap-4 items-center mr-2 sm:mr-4">
            <button
              className="text-[#0d99c9] hover:text-[#007bb0] text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-[#0d99c9] focus:ring-offset-2 rounded transition"
              aria-label="Call provider"
              title="Call provider"
              onClick={() =>
                currentConversation &&
                navigate(buildCallRoute(currentBookingId, "audio", currentConversation?.job_title))
              }
            >
              <i className="fas fa-phone"></i>
            </button>
            <button
              className="text-[#0d99c9] hover:text-[#007bb0] text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-[#0d99c9] focus:ring-offset-2 rounded transition"
              aria-label="Video call with provider"
              title="Video call with provider"
              onClick={() =>
                currentConversation &&
                navigate(buildCallRoute(currentBookingId, "video", currentConversation?.job_title))
              }
            >
              <i className="fas fa-video"></i>
            </button>
          </div>

          {/* Three-dot menu */}
          {currentConversation?.booking && (
            <div className="relative">
              <button
                className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0d99c9] focus:ring-offset-2 rounded p-1 transition"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Open activity menu"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                title="Activity options"
              >
                <svg
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="6" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="18" r="2" />
                </svg>
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* ✅ Start Activity: only starts the activity, no payment modal */}
                  <button
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-[#f7fafd] focus:bg-[#f7fafd] focus:outline-none text-sm font-medium transition border-b border-gray-100"
                    onClick={() => handleMenuAction("start")}
                    role="menuitem"
                    aria-label="Start activity with provider"
                  >
                    <span className="flex items-center">
                      <svg
                        width="18"
                        height="18"
                        fill="#0d99c9"
                        viewBox="0 0 24 24"
                        className="mr-2"
                        aria-hidden="true"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      Start Activity
                    </span>
                  </button>
                  {/* ✅ End Activity: ends the activity and opens payment modal */}
                  <button
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-[#f7fafd] focus:bg-[#f7fafd] focus:outline-none text-sm font-medium transition"
                    onClick={() => handleMenuAction("end")}
                    role="menuitem"
                    aria-label="End activity and proceed to payment"
                  >
                    <span className="flex items-center">
                      <svg
                        width="18"
                        height="18"
                        fill="#0d99c9"
                        viewBox="0 0 24 24"
                        className="mr-2"
                        aria-hidden="true"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                      </svg>
                      End Activity
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Body */}
        <div
          ref={chatBodyRef}
          className="flex-1 px-3 sm:px-4 md:px-8 py-4 sm:py-6 overflow-y-auto bg-white"
        >
          {conversationsLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Loading conversation...
            </div>
          ) : !currentConversation ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              No conversation found
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
              {displayMessages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  currentConversation={currentConversation}
                  currentUserId={currentUserId}
                />
              ))}
              <div ref={chatEndRef} />
              {/* ✅ Show a clean error if message sending fails */}
              {sendMessageError && (
                <div className="flex justify-center mt-2">
                  <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm max-w-[90%] text-center">
                    {cleanErrorMessage(sendMessageError)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Chat Input */}
        <div className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 md:py-6 border-t border-gray-100 bg-white flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              currentConversation
                ? "Write your message"
                : "Select a conversation first"
            }
            disabled={!currentConversation || sendingMessage}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-gray-200 bg-[#f7fafd] text-gray-700 text-sm sm:text-base focus:outline-none focus:border-[#0d99c9] focus:ring-2 focus:ring-[#0d99c9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Message input field"
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentConversation || sendingMessage || !input.trim()}
            className="bg-[#0d99c9] hover:bg-[#007bb0] rounded-full w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#0d99c9] focus:ring-offset-2 transition"
            aria-label="Send message"
            title="Send message (Enter)"
          >
            {sendingMessage ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                width="20"
                height="20"
                fill="white"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M2 21l21-9-21-9v7l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>

        {/**
         * "Initiate Activity" modal — appears only on the first message send.
         *
         * ✅ "Start Activity" → starts conversation/activity, NO payment
         * ✅ "End Activity"   → ends activity and opens payment modal
         */}
        {showActivityModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-modal-title"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-[420px] max-w-full p-6 sm:p-8 relative">
              <h2
                id="activity-modal-title"
                className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2"
              >
                Initiate Activity
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-6">
                How would you like to proceed with this conversation with{" "}
                <span className="font-medium">
                  {currentConversation?.other_participant?.full_name}
                </span>
                ?
              </p>

              <div className="space-y-3">
                {/* ✅ Start Activity — lets Careseeker begin the conversation/job. No payment. */}
                <button
                  className="w-full bg-[#0d99c9] text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-[#007bb0] focus:outline-none focus:ring-2 focus:ring-[#0d99c9] focus:ring-offset-2 transition text-sm sm:text-base"
                  onClick={() => handleFirstMessageAction("start")}
                  aria-label="Start activity - begin conversation with care provider"
                >
                  <span className="flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      fill="white"
                      viewBox="0 0 24 24"
                      className="mr-2"
                      aria-hidden="true"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Start Activity
                  </span>
                </button>

                {/* ✅ End Activity — ends the activity and proceeds to payment */}
                <button
                  className="w-full border-2 border-[#0d99c9] text-[#0d99c9] py-3 sm:py-4 rounded-lg font-semibold bg-white hover:bg-[#f7fafd] focus:outline-none focus:ring-2 focus:ring-[#0d99c9] focus:ring-offset-2 transition text-sm sm:text-base"
                  onClick={() => handleFirstMessageAction("end")}
                  aria-label="End activity - proceed to payment"
                >
                  <span className="flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      fill="#0d99c9"
                      viewBox="0 0 24 24"
                      className="mr-2"
                      aria-hidden="true"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                    End Activity
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal — only shown when End Activity is triggered */}
        {showPayment && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-[480px] max-w-full p-6 sm:p-8 relative max-h-[95vh] overflow-y-auto">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0d99c9] rounded p-1 transition"
                onClick={() => {
                  dispatch(clearPaymentState());
                  setShowPayment(false);
                  setPaymentSuccess(false);
                  setTotalHours("1");
                }}
                aria-label="Close payment modal"
              >
                <svg
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                </svg>
              </button>
              {!paymentSuccess ? (
                <>
                  <h2
                    id="payment-modal-title"
                    className="text-xl sm:text-2xl font-semibold text-gray-800 text-center mb-2"
                  >
                    Proceed to Payment
                  </h2>
                  <p className="text-center text-gray-500 text-sm sm:text-base mb-6">
                    Enter total hours and confirm payment
                  </p>
                  <div className="bg-gradient-to-br from-[#f7fafd] to-[#f0f8fc] rounded-xl p-4 sm:p-6 mb-6 border border-gray-200">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm font-medium">
                          Rate per hour
                        </span>
                        <span className="text-gray-800 font-semibold text-lg">
                          {formatCurrencyAmount(
                            displayPerHourRate,
                            uiCurrencyCode,
                            uiCurrencySymbol,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor="total-hours"
                          className="text-gray-600 text-sm font-medium"
                        >
                          Total hours
                        </label>
                        <input
                          id="total-hours"
                          className="bg-white border-2 border-gray-300 rounded-lg w-20 px-3 py-2 text-gray-800 font-semibold text-right text-sm focus:outline-none focus:border-[#0d99c9] focus:ring-2 focus:ring-[#0d99c9] focus:ring-offset-2 transition"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={totalHours}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) =>
                            setTotalHours(e.target.value.replace(/\D/g, ""))
                          }
                          aria-label="Total hours for service"
                        />
                      </div>
                      <div className="border-t border-gray-300 my-3"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm font-medium">
                          Subtotal
                        </span>
                        <span className="text-gray-800 font-semibold">
                          {formatCurrencyAmount(
                            displaySubtotal,
                            uiCurrencyCode,
                            uiCurrencySymbol,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm font-medium">
                          Service Fee
                        </span>
                        <span className="text-[#0d99c9] font-semibold">
                          {formatCurrencyAmount(
                            displayServiceFee,
                            uiCurrencyCode,
                            uiCurrencySymbol,
                          )}
                        </span>
                      </div>
                      <div className="border-t-2 border-gray-300 my-3"></div>
                      <div className="flex justify-between items-center bg-white rounded-lg p-3">
                        <span className="text-gray-700 font-semibold text-base">
                          Total Amount
                        </span>
                        <span className="text-[#0d99c9] text-2xl font-bold">
                          {formatCurrencyAmount(
                            displayTotal,
                            uiCurrencyCode,
                            uiCurrencySymbol,
                          )}
                        </span>
                      </div>
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
                    <div
                      className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm"
                      role="status"
                    >
                      Loading payment breakdown...
                    </div>
                  )}
                  {paymentPreviewError && (
                    <div
                      className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm"
                      role="alert"
                    >
                      Could not load server preview. Final charge will still use
                      server-calculated totals.
                      <div className="mt-1">{paymentPreviewError}</div>
                    </div>
                  )}
                  {paymentError && (
                    <div
                      className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded text-red-700 text-sm"
                      role="alert"
                    >
                      <p className="font-semibold">Payment Error</p>
                      <p>{paymentError}</p>
                    </div>
                  )}
                  <div className="space-y-3">
                    <button
                      className="w-full bg-[#0d99c9] text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-[#007bb0] focus:outline-none focus:ring-2 focus:ring-[#0d99c9] focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      onClick={handleProceedToPayment}
                      disabled={initiatingPayment || loadingPaymentPreview}
                      aria-label="Proceed to payment"
                    >
                      {initiatingPayment ? (
                        <span className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </span>
                      ) : (
                        "Proceed to Payment"
                      )}
                    </button>
                    <button
                      className="w-full border-2 border-[#0d99c9] text-[#0d99c9] py-3 sm:py-4 rounded-lg font-semibold bg-white hover:bg-[#f7fafd] focus:outline-none focus:ring-2 focus:ring-[#0d99c9] focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      onClick={() => {
                        dispatch(clearPaymentState());
                        setShowPayment(false);
                        setPaymentSuccess(false);
                        setTotalHours("1");
                      }}
                      disabled={initiatingPayment}
                      aria-label="Cancel payment"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 p-4 bg-green-100 rounded-full">
                    <svg
                      width="48"
                      height="48"
                      fill="#10b981"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M20.285 6.709l-11.285 11.285-5.285-5.285 1.415-1.415 3.87 3.87 9.87-9.87z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-6">
                    Your payment of{" "}
                    <span className="font-semibold">
                      {formatCurrencyAmount(
                        displayTotal,
                        uiCurrencyCode,
                        uiCurrencySymbol,
                      )}
                    </span>{" "}
                    has been processed.
                  </p>
                  <button
                    className="w-full bg-[#0d99c9] text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-[#007bb0] focus:outline-none focus:ring-2 focus:ring-[#0d99c9] focus:ring-offset-2 transition text-sm sm:text-base"
                    onClick={() => {
                      dispatch(clearPaymentState());
                      setShowPayment(false);
                      setPaymentSuccess(false);
                      setTotalHours("1");
                    }}
                    aria-label="Close payment success modal"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        <VerificationCheckModal
          isOpen={showVerification}
          user={currentUser}
          userType="seeker"
          actionType="hire"
          onCancel={() => setShowVerification(false)}
          isVerified={currentUser?.is_verified || false}
        />
      </div>
    </div>
  );
}

export default MessageDetails;
