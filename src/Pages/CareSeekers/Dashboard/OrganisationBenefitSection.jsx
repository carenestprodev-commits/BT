import { useEffect, useState } from "react";
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

  const joinOrganisation = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const code = organisationCode.trim().toUpperCase();
    if (!code) {
      setError("Enter your organisation code.");
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
      <h3 className="text-lg font-semibold text-gray-800">Organisation benefit</h3>
      <p className="mt-1 text-sm text-gray-500">
        Add the code shared by your organisation to request access to its care credits.
      </p>

      <form className="mt-5" onSubmit={joinOrganisation}>
        <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="organisation-code">
          Organisation code
        </label>
        <div className="flex gap-3">
          <input
            id="organisation-code"
            value={organisationCode}
            onChange={(event) => setOrganisationCode(event.target.value.toUpperCase())}
            disabled={Boolean(membership) || joining || loading}
            placeholder="e.g. ABC123"
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-3 uppercase text-gray-800 outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            disabled={Boolean(membership) || joining || loading}
            className="rounded-lg bg-[#1C4532] px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {joining ? "Adding..." : "Add code"}
          </button>
        </div>
      </form>

      {loading && <p className="mt-3 text-sm text-gray-500">Checking organisation benefit...</p>}
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
