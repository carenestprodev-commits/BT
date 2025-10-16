import { } from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar active="Setting" />
      <div className="flex-1 font-sfpro px-8 py-8 ml-64">
        <div className="mb-8 flex items-center">
          <button className="mr-4 text-gray-500 hover:text-gray-700 text-2xl font-bold" onClick={() => navigate(-1)}>
            ←
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>
        </div>
        <div className="max-w-xl">
          <div className="space-y-4">
            <button onClick={() => navigate("/careproviders/dashboard/verify_identity")} className="w-full flex items-center justify-between bg-white border border-gray-100 rounded-lg px-6 py-4 text-gray-800 text-base font-medium hover:bg-gray-50">
              <span>Verify my Identity</span>
              <span className="bg-[#fff7e6] text-[#e6a23c] text-xs font-semibold px-3 py-1 rounded">Pending</span>
            </button>
            <button onClick={() => navigate("/careproviders/dashboard/personal_information")} className="w-full flex items-center justify-between bg-white border border-gray-100 rounded-lg px-6 py-4 text-gray-800 text-base font-medium hover:bg-gray-50">
              <span>Personal Information</span>
              <span className="text-gray-400 text-xl">&gt;</span>
            </button>
            <button onClick={() => navigate("/careproviders/dashboard/password")} className="w-full flex items-center justify-between bg-white border border-gray-100 rounded-lg px-6 py-4 text-gray-800 text-base font-medium hover:bg-gray-50">
              <span>Password</span>
              <span className="text-gray-400 text-xl">&gt;</span>
            </button>
            <button
              onClick={() => {
                // Clear local storage to remove tokens and onboarding state
                try {
                  localStorage.clear()
                } catch (e) {
                  console.warn('Failed to clear localStorage', e)
                }
                // Redirect to login and reload to ensure protected routes don't use stale state
                navigate('/careproviders/login/', { replace: true })
                // Force reload to reset any in-memory auth state
                window.location.reload()
              }}
              className="w-full flex items-center justify-between bg-white border border-gray-100 rounded-lg px-6 py-4 text-[#f56c6c] text-base font-medium hover:bg-gray-50"
            >
              <span>Log out</span>
              <span className="text-gray-400 text-xl">&gt;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
