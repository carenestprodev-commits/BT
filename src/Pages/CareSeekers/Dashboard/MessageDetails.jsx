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
} from "../../../Redux/Messenger";
import {
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
import VerificationCheckModal from "../../../Components/VerificationCheckModal";

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
  try {
    const token = localStorage.getItem("access");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id || payload.id || payload.sub;
    }
  } catch (error) {
    console.error("Error getting user ID from token:", error);
  }
  return null;
};

function MessageDetails() {
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
  } = useSelector((state) => state.messenger);

  const { details: providerDetails } = useSelector(
    (s) => s.providersDetails || { details: null },
  );

  const {
    initiatingPayment,
    paymentError,
    checkoutUrl,
    activityStarted,
    activityEnded,
  } = useSelector((state) => state.startActivity);

  // Local state
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [totalHours, setTotalHours] = useState(1);
  const [messageCount, setMessageCount] = useState(0);
  const [showVerification, setShowVerification] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const chatBodyRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const activityStartedSentForRef = useRef(null);

  // Get current conversation (find by provider_id or other_participant id)
  const currentConversation = conversations.find(
    (c) =>
      c.other_participant?.id === parseInt(providerId) ||
      c.provider_id === parseInt(providerId) ||
      c.other_user_id === parseInt(providerId),
  );

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
  const serviceFeePercentage = 15; // 15%
  const subtotal = perHourRate * totalHours;
  const serviceFee = (subtotal * serviceFeePercentage) / 100;
  const calculatedTotal = subtotal + serviceFee;

  const bookingId =
    currentConversation?.booking ||
    currentConversation?.booking_id ||
    currentConversation?.id;

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

  // Load/update messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      dispatch(fetchMessages(currentConversation.id));
      dispatch(setActiveConversation(currentConversation.id));
      dispatch(connectWebSocket(currentConversation.id));
    }

    return () => {
      dispatch(disconnectWebSocket());
    };
  }, [dispatch, currentConversation]);

  // Update message count when messages arrive
  useEffect(() => {
    setMessageCount(currentMessages.length);
  }, [currentMessages]);

  // Redirect to Stripe checkout
  useEffect(() => {
    if (checkoutUrl) {
      try {
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      } catch {
        window.location.href = checkoutUrl;
      }
      setShowPayment(false);
    }
  }, [checkoutUrl]);

  // Handle activity started
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

  // Handle activity ended
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
  const displayMessages = currentMessages.map((message) => {
    const currentUserId = getCurrentUserId();
    const messageSenderId = String(message.sender);
    const type =
      String(messageSenderId) === String(currentUserId) ? "sent" : "received";

    return {
      id: message.id,
      text: message.content || message.message || "",
      type,
      time: formatTime(message.timestamp || message.created_at || new Date()),
      date: formatDate(message.timestamp || message.created_at || new Date()),
      senderName: message.sender_name,
    };
  });

  const handleSendMessage = async () => {
    if (!currentConversation || !input.trim()) return;

    // If first message, show activity modal
    if (messageCount === 0) {
      setShowActivityModal(true);
      return;
    }

    // Send the message normally
    dispatch(
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
  };

  const handleFirstMessageAction = (action) => {
    if (action === "start") {
      // Send message first
      dispatch(
        sendMessage({
          conversationId: currentConversation.id,
          content: input.trim(),
        }),
      );
      setInput("");
      setMessageCount(messageCount + 1);

      // Then start activity
      try {
        if (bookingId) {
          dispatch(startActivity(String(bookingId)));
        }
      } catch (e) {
        console.error("Failed to start activity:", e);
      }

      setShowActivityModal(false);
    } else if (action === "end") {
      // Send message first
      dispatch(
        sendMessage({
          conversationId: currentConversation.id,
          content: input.trim(),
        }),
      );
      setInput("");
      setMessageCount(messageCount + 1);

      // End the activity
      try {
        if (bookingId) {
          dispatch(endActivity(bookingId));
        }
      } catch (e) {
        console.error("Failed to end activity:", e);
      }

      setShowActivityModal(false);

      // Show payment for ending activity
      setShowPayment(true);
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
          perHourRate: perHourRate,
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

  const handleMenuAction = async (action) => {
    if (action === "start") {
      try {
        if (bookingId) {
          dispatch(startActivity(String(bookingId)));
        }
      } catch (e) {
        console.error("Failed to start activity:", e);
      }
      setMenuOpen(false);
    } else if (action === "end") {
      setMenuOpen(false);
      try {
        const res = await dispatch(endActivity(bookingId));
        setShowPayment(true);
      } catch {
        alert("Failed to end activity");
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
      <div className="flex-1 font-sfpro md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="flex items-center px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 border-b border-gray-100 bg-[#f3fafc] relative flex-shrink-0 gap-2 sm:gap-4">
          <button
            className="mr-4 text-gray-500 hover:text-gray-700 text-xl"
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
                  alt="avatar"
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
          <div className="flex gap-4 items-center mr-4">
            <button className="text-[#0d99c9] hover:text-[#007bb0] text-xl">
              <i className="fas fa-phone"></i>
            </button>
            <button className="text-[#0d99c9] hover:text-[#007bb0] text-xl">
              <i className="fas fa-video"></i>
            </button>
          </div>

          {/* Three-dot menu */}
          {currentConversation?.booking && (
            <div className="relative">
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
                    onClick={() => handleMenuAction("start")}
                  >
                    Start Activity
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm"
                    onClick={() => handleMenuAction("end")}
                  >
                    End Activity
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
              {displayMessages.map((msg, i) => (
                <div key={i} className="mb-3 sm:mb-4">
                  {msg.type === "received" && (
                    <div className="flex flex-col max-w-[85%] sm:max-w-[70%] md:max-w-[60%] items-start">
                      <span className="text-xs text-gray-500 font-semibold mb-1">
                        {currentConversation.other_participant?.full_name ||
                          "Other User"}
                      </span>
                      <div className="bg-gray-100 rounded-lg px-3 sm:px-4 md:px-5 py-2 sm:py-3 text-gray-800 text-xs sm:text-sm break-words">
                        {msg.text}
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        {msg.time}
                      </span>
                    </div>
                  )}
                  {msg.type === "sent" && (
                    <div className="flex flex-col max-w-[85%] sm:max-w-[70%] md:max-w-[60%] items-end ml-auto">
                      <span className="text-xs text-gray-500 font-semibold mb-1">
                        You
                      </span>
                      <div className="bg-[#0d99c9] rounded-lg px-3 sm:px-4 md:px-5 py-2 sm:py-3 text-white text-xs sm:text-sm break-words">
                        {msg.text}
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        {msg.time}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
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
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-md border border-gray-200 bg-[#f7fafd] text-gray-700 text-xs sm:text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentConversation || sendingMessage || !input.trim()}
            className="bg-[#0d99c9] hover:bg-[#007bb0] rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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

        {/* First Message Activity Modal */}
        {showActivityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full sm:w-[400px] max-w-full p-6 sm:p-8 relative">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Initiate Activity
              </h2>
              <p className="text-gray-600 mb-6">
                How would you like to proceed with this conversation?
              </p>

              <button
                className="w-full bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition mb-3"
                onClick={() => handleFirstMessageAction("start")}
              >
                Start Activity
              </button>
              <button
                className="w-full border border-[#0d99c9] text-[#0d99c9] py-3 rounded-md font-semibold bg-white hover:bg-[#f7fafd] transition"
                onClick={() => handleFirstMessageAction("end")}
              >
                End Activity
              </button>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full sm:w-[400px] max-w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
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
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-500">Rate per hour</span>
                      <span className="text-gray-800 font-semibold">
                        ₦{perHourRate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-500">Total hours</span>
                      <input
                        className="bg-white border border-gray-300 rounded w-16 sm:w-20 px-2 py-1 text-gray-800 font-semibold text-right text-sm"
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
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-800 font-semibold">
                        ₦{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-500">Service Fee (15%)</span>
                      <span className="text-gray-800 font-semibold">
                        ₦{serviceFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium text-sm">
                        Total Amount
                      </span>
                      <span className="text-[#0d99c9] text-lg sm:text-xl font-bold">
                        ₦{calculatedTotal.toFixed(2)}
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
                    {initiatingPayment ? "Processing..." : "Proceed to Payment"}
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
      </div>
    </div>
  );
}

export default MessageDetails;
