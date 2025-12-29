/* eslint-disable no-unused-vars */
import React, { useState } from "react";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle OTP request logic here
    console.log("Requesting OTP for:", email);
  };

  const handleBack = () => {
    // In your actual app, this would navigate back
    console.log("Navigate back to login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="pt-6 sm:pt-8 lg:pt-10">
        <button
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-800 transition"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Content Container */}
      <div className="flex-1 flex flex-col justify-start pt-8 sm:pt-12 pb-8 max-w-md w-full mx-auto sm:max-w-lg">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3 sm:mb-4">
          Forgot Password
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-500 mb-8 sm:mb-10 leading-relaxed">
          We will send you a{" "}
          <span className="font-medium text-gray-700">One Time Password</span>{" "}
          to your email or phone number to reset your password
        </p>

        {/* Email Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Input email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg bg-white px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#0093d1] focus:border-transparent transition"
          />
        </div>

        {/* Get OTP Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#0093d1] text-white font-medium py-3 sm:py-3.5 rounded-lg hover:bg-[#007bb0] transition text-sm sm:text-base"
        >
          Get OTP
        </button>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
