export const getMessageKind = (message) =>
  message?.kind || message?.message_kind || "text";

export const getMessagePayload = (message) =>
  message?.payload || message?.data || {};

export const getMessageContent = (message) =>
  message?.content ?? message?.message ?? message?.text ?? "";

export const getMessageTimestamp = (message) =>
  message?.timestamp || message?.created_at || new Date().toISOString();

export const getMessageSender = (message) =>
  message?.sender ?? message?.sender_id ?? message?.user_id ?? null;

export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatMessageDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const getConversationPreviewText = (message) => {
  const kind = getMessageKind(message);
  if (kind === "recording") {
    return getMessagePayload(message)?.title || "Call recording";
  }
  if (kind === "info") {
    return getMessageContent(message) || "Info update";
  }
  if (kind === "system") {
    return getMessageContent(message) || "System update";
  }
  return getMessageContent(message) || "No messages yet";
};

export const normalizeRealtimeMessage = (message) => {
  const timestamp = getMessageTimestamp(message);
  const sender = getMessageSender(message) || "system";
  const kind = getMessageKind(message);
  return {
    id:
      message?.id ||
      `${kind}_${sender}_${timestamp}_${getMessageContent(message)}`,
    sender: getMessageSender(message),
    sender_name: message?.sender_name || "",
    content: getMessageContent(message),
    kind,
    payload: getMessagePayload(message),
    timestamp,
  };
};

export const toDisplayMessage = (message, currentUserId) => {
  const timestamp = getMessageTimestamp(message);
  const kind = getMessageKind(message);
  const sender = getMessageSender(message);
  const isOwnMessage =
    kind !== "system" &&
    kind !== "info" &&
    kind !== "recording" &&
    sender !== null &&
    String(sender) === String(currentUserId);

  return {
    id: message?.id || `${timestamp}_${sender || kind}`,
    kind,
    sender,
    senderName: message?.sender_name,
    text: getMessageContent(message),
    payload: getMessagePayload(message),
    timestamp,
    time: formatMessageTime(timestamp),
    date: formatMessageDate(timestamp),
    type:
      kind === "system" || kind === "recording" || kind === "info"
        ? kind
        : isOwnMessage
          ? "sent"
          : "received",
  };
};

export const getRecordingAccessUrl = (message) =>
  getMessagePayload(message)?.access_url ||
  getMessagePayload(message)?.playback_url ||
  getMessagePayload(message)?.recording_url ||
  getMessagePayload(message)?.url ||
  "";
