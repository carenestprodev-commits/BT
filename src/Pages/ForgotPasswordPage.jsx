/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const baseUrl = "https://backend.app.carenestpro.com"; // Replace with your actual base URL

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setError("");
    setSuccess(false);

    // Validate email
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/auth/request-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        console.log("OTP requested successfully:", data);
        // Navigate to OTP verification page after 1.5 seconds
        setTimeout(() => {
          navigate("/verify-otp", { state: { email: email.trim() } });
        }, 1500);
      } else {
        // Handle API error response
        setError(
          data.message || data.error || "Failed to send OTP. Please try again."
        );
      }
    } catch (err) {
      console.error("Error requesting OTP:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };
  return (
    <div className="flex flex-col min-h-screen bg-white px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="pt-6 sm:pt-8 lg:pt-10">
        <button
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-800 transition"
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
      </div>

      {/* Content Container */}
      <div className="flex-1 flex flex-col justify-start pt-8 sm:pt-12 pb-8 max-w-md w-full mx-auto sm:max-w-lg">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3 sm:mb-4 font-sfpro">
          Forgot Password
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-500 mb-8 sm:mb-10 leading-relaxed font-sfpro">
          We will send you a{" "}
          <span className="font-medium text-gray-700">One Time Password</span>{" "}
          to your email or phone number to reset your password
        </p>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-sfpro">
              ✓ OTP has been sent to your email address. Please check your
              inbox.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-sfpro">{error}</p>
          </div>
        )}

        {/* Email Input */}
        <div className="mb-6 font-sfpro">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Input email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-lg bg-white px-4 py-3 text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0093d1] focus:border-transparent transition font-sfpro disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Get OTP Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-[#0093d1] text-white font-medium py-3 sm:py-3.5 rounded-lg hover:bg-[#007bb0] transition text-sm sm:text-base font-sfpro disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending OTP...
            </>
          ) : (
            "Get OTP"
          )}
        </button>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
