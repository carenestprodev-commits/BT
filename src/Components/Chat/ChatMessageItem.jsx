import { BASE_URL } from "../../Redux/config";
import { getRecordingAccessUrl } from "../../lib/chatMessages";

const resolveHref = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!BASE_URL) return url;
  const base = BASE_URL.replace(/\/+$/, "");
  const path = url.replace(/^\/+/, "");
  return `${base}/${path}`;
};

const getJoinCallUrl = (payload = {}) => payload.join_url || payload.join_path || "";
const resolveJoinHref = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return url.startsWith("/") ? url : `/${url}`;
};

function ChatMessageItem({ message, currentConversation, currentUserId }) {
  if (message.kind === "system") {
    const payload = message.payload || {};
    const event = payload.event || "";
    const callType = payload.call_type === "audio" ? "audio" : "video";
    const startedById = payload.started_by_id || payload.initiator_id || null;
    const alignsToStarter =
      startedById !== null &&
      startedById !== undefined &&
      String(startedById) === String(currentUserId || "");
    const isCallEvent = event === "call_started" || event === "call_ended";

    if (isCallEvent) {
      const joinUrl = resolveJoinHref(getJoinCallUrl(payload));
      const recordingUrl = resolveHref(getRecordingAccessUrl(message));
      const recordingStatus = String(payload.recording_status || "").toLowerCase();
      const icon =
        callType === "audio" ? (
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      const title = (payload.title || "").trim();
      const label = event === "call_started" ? "Call started" : "Call ended";
      return (
        <div className={`mb-4 flex ${alignsToStarter ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
              alignsToStarter
                ? "bg-[#e7f7fd] text-[#0a6f97] rounded-tr-sm"
                : "bg-gray-100 text-gray-700 rounded-tl-sm"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {icon}
              <span>{label}</span>
            </div>
            {title ? <div className="mt-1 text-xs opacity-90">{title}</div> : null}
            {event === "call_started" && joinUrl ? (
              <div className="mt-3">
                <a
                  href={joinUrl}
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                    alignsToStarter
                      ? "bg-[#0d99c9] text-white hover:bg-[#007bb0]"
                      : "bg-white text-[#0a6f97] hover:bg-[#f5fbfe]"
                  }`}
                >
                  Join call
                </a>
              </div>
            ) : null}
            {event === "call_ended" ? (
              <div className="mt-3">
                {recordingUrl && recordingStatus !== "errored" ? (
                  <a
                    href={recordingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                      alignsToStarter
                        ? "bg-[#0d99c9] text-white hover:bg-[#007bb0]"
                        : "bg-white text-[#0a6f97] hover:bg-[#f5fbfe]"
                    }`}
                  >
                    View recording
                  </a>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-current opacity-80">
                    {recordingStatus === "errored" ? "Recording unavailable" : "Recording processing"}
                  </span>
                )}
              </div>
            ) : null}
            <span className="mt-1 block text-right text-xs opacity-70">{message.time}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-center my-4">
        <div className="max-w-[85%] rounded-full border border-[#dceff8] bg-[#f4fbfe] px-4 py-2 text-center text-sm font-medium text-[#0d99c9]">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.kind === "info") {
    return (
      <div className="flex justify-center my-4">
        <div className="max-w-[85%] rounded-2xl border border-[#dbeafe] bg-[#eff6ff] px-4 py-3 text-center text-sm text-[#1d4ed8] shadow-sm">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
            Info
          </div>
          <div>{message.text}</div>
        </div>
      </div>
    );
  }

  const isOwnMessage = message.type === "sent";
  const participantName =
    message.senderName ||
    currentConversation?.other_participant?.full_name ||
    currentConversation?.other_participant?.email ||
    "Other User";

  return (
    <div
      className={`mb-4 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div className="max-w-[75%]">
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isOwnMessage
              ? "bg-[#0d99c9] text-white rounded-tr-sm"
              : "bg-gray-100 text-gray-900 rounded-tl-sm"
          }`}
        >
          {!isOwnMessage && (
            <div className="mb-1 text-xs font-semibold text-gray-500">
              {participantName}
            </div>
          )}
          {message.text}
        </div>
        <span
          className={`mt-1 block text-xs text-gray-400 ${
            isOwnMessage ? "text-right pr-1" : "pl-1"
          }`}
        >
          {message.time}
        </span>
      </div>
    </div>
  );
}

export default ChatMessageItem;
