import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { fetchWithAuth } from "../../../lib/fetchWithAuth";
import { BASE_URL, getAuthHeaders } from "../../../Redux/config";
import OrganisationBenefitSection from "./OrganisationBenefitSection";

function PersonalInformation() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetchWithAuth(`${BASE_URL}/api/seeker/profile/personal-info/`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Could not load personal information.");

        const data = await response.json();
        if (active) setProfile(data.user_data || data);
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

  return (
    <div className="flex min-h-screen bg-white font-sfpro">
      <Sidebar active="Setting" />
      <div className="flex-1 px-4 py-8 md:ml-64 md:px-8">
        <div className="mb-8 flex items-center">
          <button
            className="mr-4 text-2xl font-bold text-gray-500 hover:text-gray-700"
            onClick={() => window.history.back()}
            aria-label="Go back"
          >
            ←
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Personal Information</h2>
        </div>

        <div className="max-w-xl space-y-6">
          {loading && <div className="text-sm text-gray-500">Loading...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}

          <div>
            <div className="mb-2 text-gray-500">Email address</div>
            <input
              type="text"
              value={profile?.email || ""}
              readOnly
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-800"
            />
          </div>

          <div>
            <div className="mb-2 text-gray-500">Country</div>
            <input
              type="text"
              value={profile?.country || ""}
              readOnly
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-800"
            />
          </div>

          <OrganisationBenefitSection />
        </div>
      </div>
    </div>
  );
}

export default PersonalInformation;
