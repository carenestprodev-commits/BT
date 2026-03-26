import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { RealtimeKitProvider, useRealtimeKitClient } from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import { BASE_URL, getAuthHeaders } from "../Redux/config";

const resolveStartPath = (pathname) =>
  pathname.startsWith("/careproviders/")
    ? "/careproviders/dashboard/message"
    : "/careseekers/dashboard/message";

function RealtimeKitCallRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode");
  const initialMode = modeParam === "audio" || modeParam === "video" ? modeParam : "video";
  const initialTitle = (searchParams.get("title") || "").trim();
  const backPath = `${resolveStartPath(location.pathname)}/${bookingId}`;

  const [meeting, initMeeting] = useRealtimeKitClient();
  const [title, setTitle] = useState(initialTitle);
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");
  const [activeMode, setActiveMode] = useState(initialMode);
  const [activeTitle, setActiveTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  const startCall = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Please enter a call title.");
      return;
    }
    try {
      setJoining(true);
      setError("");
      const res = await fetch(`${BASE_URL}/api/bookings/${bookingId}/realtimekit/join/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ mode: selectedMode, title: trimmedTitle }),
      });

      if (!res.ok) {
        let message = `Failed to join call (${res.status})`;
        try {
          const details = await res.json();
          message = details?.error || details?.details?.error?.message || message;
        } catch {
          // ignore parse failure
        }
        throw new Error(message);
      }

      const data = await res.json();
      const authToken = data.authToken;
      if (!authToken) {
        throw new Error("Missing RealtimeKit auth token");
      }

        await initMeeting({
          authToken,
          defaults: {
            audio: true,
            video: selectedMode === "video",
          },
        });
      setActiveMode(data.call_type || selectedMode);
      setActiveTitle(data.title || trimmedTitle);
      setJoined(true);
    } catch (err) {
      setError(err.message || "Failed to start call");
    } finally {
      setJoining(false);
    }
  };

  if (!joined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3fafc] px-4">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-gray-900">
            Start call
            </h1>
          <p className="mt-2 text-sm text-gray-600">
            Add a title before creating this call.
          </p>
          <div className="mt-4 flex w-full rounded-xl bg-gray-100 p-1">
            <button
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                selectedMode === "audio"
                  ? "bg-white text-[#0d99c9] shadow-sm"
                  : "text-gray-600"
              }`}
              onClick={() => setSelectedMode("audio")}
            >
              Audio
            </button>
            <button
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                selectedMode === "video"
                  ? "bg-white text-[#0d99c9] shadow-sm"
                  : "text-gray-600"
              }`}
              onClick={() => setSelectedMode("video")}
            >
              Video
            </button>
          </div>
          <label className="mt-5 block text-sm font-medium text-gray-700">
            Call title
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter call title"
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#0d99c9] focus:outline-none focus:ring-2 focus:ring-[#0d99c9]/20"
            maxLength={120}
          />
          {error ? (
            <p className="mt-3 text-sm text-[#dc2626]">{error}</p>
          ) : null}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              onClick={() => navigate(backPath)}
              disabled={joining}
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-[#0d99c9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#007bb0] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={startCall}
              disabled={joining || !title.trim()}
            >
              {joining ? "Joining..." : "Start call"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3fafc] px-4">
        <div className="max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">Call unavailable</h1>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <button
            className="mt-6 rounded-full bg-[#0d99c9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#007bb0]"
            onClick={() => navigate(backPath)}
          >
            Back to chat
          </button>
        </div>
      </div>
    );
  }

  const handleEndForEveryone = async () => {
    try {
      setEnding(true);
      const response = await fetch(
        `${BASE_URL}/api/bookings/${bookingId}/realtimekit/end/`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to end call (${response.status})`);
      }
      navigate(backPath);
    } catch (err) {
      setError(err.message || "Failed to end call");
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220]">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#08111f] px-4 py-3 text-white">
        <div>
          <div className="text-sm font-semibold">
            {activeMode === "audio" ? "Audio call" : "Video call"}
          </div>
          <div className="text-xs text-white/60">
            {activeTitle || `Booking #${bookingId}`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            onClick={() => navigate(backPath)}
          >
            Back to chat
          </button>
          <button
            className="rounded-full bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleEndForEveryone}
            disabled={ending}
          >
            {ending ? "Ending..." : "End for everyone"}
          </button>
        </div>
      </div>

      {meeting && (
        <RealtimeKitProvider value={meeting}>
          <div className="h-[calc(100vh-57px)]">
            <RtkMeeting mode="fill" meeting={meeting} />
          </div>
        </RealtimeKitProvider>
      )}
    </div>
  );
}

export default RealtimeKitCallRoom;
