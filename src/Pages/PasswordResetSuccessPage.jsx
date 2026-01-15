/* eslint-disable no-unused-vars */
import React from "react";
import DonePassword from "../../public/DonePassword.jpeg";
import { useNavigate } from "react-router-dom";

function PasswordResetSuccessPage() {
  const navigate = useNavigate();
  const handleBackToLogin = () => {
    // Determine role: prefer stored `user.user_type`, fallback to
    // `provider_user` / `seeker_user` keys saved during flows.
    let role = null;
    try {
      const raw = localStorage.getItem("user");
      const parsed = raw ? JSON.parse(raw) : null;
      role = parsed?.user_type || parsed?.userType || null;
    } catch (e) {
      role = null;
    }

    if (!role) {
      if (localStorage.getItem("provider_user")) role = "provider";
      else if (localStorage.getItem("seeker_user")) role = "seeker";
    }

    const route =
      role === "provider" ? "/careproviders/login" : "/careseekers/login";
    navigate(route);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-4 sm:px-6 lg:px-8">
      {/* Content Container */}
      <div className="flex-1 flex flex-col items-center justify-center pb-8 max-w-md w-full mx-auto">
        {/* Success Illustration - Import your own image here */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <img
            src={DonePassword}
            alt="Password reset successful"
            className="h-32 sm:h-40 object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 text-center font-sfpro">
          Password reset successful!
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-500 mb-10 sm:mb-12 text-center leading-relaxed font-sfpro px-4">
          You can proceed to login with your new password credentials
        </p>

        {/* Back to Login Button */}
        <button
          onClick={handleBackToLogin}
          className="w-full max-w-sm bg-[#0093d1] text-white font-medium py-3 sm:py-3.5 rounded-lg hover:bg-[#007bb0] transition text-sm sm:text-base font-sfpro"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default PasswordResetSuccessPage;
