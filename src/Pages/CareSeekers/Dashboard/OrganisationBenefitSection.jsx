import { useEffect, useRef, useState } from "react";
import { BASE_URL, getAuthHeaders } from "../../../Redux/config";
import { fetchWithAuth } from "../../../lib/fetchWithAuth";

const statusLabels = {
  pending: "Pending approval",
  approved: "Approved",
  rejected: "Not approved",
  suspended: "Suspended",
  ended: "Ended",
};

function OrganisationBenefitSection() {
  const [membership, setMembership] = useState(null);
  const [organisationCode, setOrganisationCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const lastSubmittedCode = useRef("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetchWithAuth(`${BASE_URL}/api/employer-credits/me/`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok && response.status !== 404) {
          throw new Error("Could not load organisation benefit.");
        }

        const data = response.ok ? await response.json() : null;
        if (active) {
          setMembership(data);
          setOrganisationCode(data?.organisation_code || "");
        }
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const joinOrganisation = async (valueOrEvent) => {
    if (valueOrEvent?.preventDefault) valueOrEvent.preventDefault();
    setError("");
    setSuccess("");

    const code = (typeof valueOrEvent === "string" ? valueOrEvent : organisationCode)
      .trim()
      .toUpperCase();
    if (code.length !== 6) {
      setError("Enter your 6-character organisation code.");
      return;
    }

    setJoining(true);
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/employer-credits/enrol/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ code }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.code || data.detail || "Could not add the organisation code.");
      }

      setMembership(data);
      setOrganisationCode(data.organisation_code || code);
      setSuccess(
        data.status === "pending"
          ? "Organisation code added. Your request is waiting for approval."
          : "Organisation code added.",
      );
    } catch (joinError) {
      setError(joinError.message);
    } finally {
      setJoining(false);
    }
  };

  const status = membership ? statusLabels[membership.status] || membership.status : "";

  return (
    <section className="border-t border-gray-100 pt-6">
      <h3 className="text-lg font-semibold text-gray-800">Organisation benefit (Optional)</h3>
      <p className="mt-1 text-sm text-gray-500">
        Add the code shared by your organisation to request access to its care credits.
      </p>

      <form className="mt-5" onSubmit={joinOrganisation}>
        <div className="relative">
          <input
            id="organisation-code"
            value={organisationCode}
            onChange={(event) => {
              const value = event.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
                .slice(0, 6);
              setOrganisationCode(value);
              if (
                value.length === 6 &&
                !membership &&
                !joining &&
                !loading &&
                lastSubmittedCode.current !== value
              ) {
                lastSubmittedCode.current = value;
                joinOrganisation(value);
              }
            }}
            disabled={Boolean(membership) || joining || loading}
            placeholder="e.g. ABC123"
            maxLength={6}
            aria-label="Organisation code"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 uppercase text-gray-800 outline-none focus:border-gray-400 disabled:bg-gray-50"
          />
          {joining && (
            <span
              className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-gray-200 border-t-[#1C4532]"
              role="status"
              aria-label="Adding organisation code"
            />
          )}
        </div>
      </form>

      {loading && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500" role="status">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
          Checking organisation benefit...
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-3 text-sm text-green-700">{success}</p>}

      {membership && (
        <div className="mt-5 space-y-3 rounded-lg bg-gray-50 p-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Organisation</div>
            <div className="mt-1 font-medium text-gray-800">{membership.organisation_name}</div>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-500">Status</span>
            <span className="font-medium text-gray-800">{status}</span>
          </div>
        </div>
      )}
    </section>
  );
}

export default OrganisationBenefitSection;
