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
  const mode = searchParams.get("mode") === "audio" ? "audio" : "video";
  const backPath = `${resolveStartPath(location.pathname)}/${bookingId}`;

  const [meeting, initMeeting] = useRealtimeKitClient();
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const start = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/bookings/${bookingId}/realtimekit/join/`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ mode }),
          },
        );

        if (!res.ok) {
          throw new Error(`Failed to join call (${res.status})`);
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
            video: mode === "video",
          },
        });

        if (active) {
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to start call");
          setLoading(false);
        }
      }
    };

    start();

    return () => {
      active = false;
    };
  }, [bookingId, initMeeting, mode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3fafc] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#0d99c9] border-t-transparent" />
          <p className="text-sm text-gray-600">Joining call...</p>
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
            {mode === "audio" ? "Audio call" : "Video call"}
          </div>
          <div className="text-xs text-white/60">Booking #{bookingId}</div>
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
