/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DonePassword from "../../public/OtpSuccess.jpeg";

const DEFAULT_OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const baseUrl = "https://backend.app.carenestpro.com";

function OTPVerificationPage() {
  const [otp, setOtp] = useState(Array(DEFAULT_OTP_LENGTH).fill(""));
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(location.state?.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef([]);
  const abortControllerRef = useRef(null);

  const [resendCooldown, setResendCooldown] = useState(0);
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const setOtpAt = useCallback((index, value) => {
    setOtp((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleChange = (index, value) => {
    if (!value) {
      setOtpAt(index, "");
      return;
    }

    // If multiple characters (autofill/paste), take last numeric char
    const digits = value.replace(/\D/g, "");
    if (!digits) return;
    const char = digits[digits.length - 1];

    setOtpAt(index, char);
    setError("");
    setSuccess("");

    if (index < DEFAULT_OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // If last input filled, optionally submit or focus last
      inputRefs.current[index]?.blur();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      // If current has a value, clear it first
      if (otp[index]) {
        setOtpAt(index, "");
        setError("");
        e.preventDefault();
        return;
      }
      // If empty, move focus back
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        setOtpAt(index - 1, "");
        e.preventDefault();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < DEFAULT_OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    } else if (e.key === "Enter") {
      // Submit when Enter pressed
      handleSubmit();
    }
  };

  const handleContainerPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\s/g, "")
      .slice(0, DEFAULT_OTP_LENGTH);
    if (!/^\d+$/.test(pasted)) return;
    const newOtp = Array(DEFAULT_OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => {
      newOtp[i] = ch;
    });
    setOtp(newOtp);
    const lastIndex = Math.min(pasted.length - 1, DEFAULT_OTP_LENGTH - 1);
    inputRefs.current[lastIndex]?.focus();
    setError("");
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== DEFAULT_OTP_LENGTH || !/^\d+$/.test(otpCode)) {
      setError("Please enter the complete OTP code");
      setSuccess("");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${baseUrl}/api/auth/validate-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
        signal: controller.signal,
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        setError(
          "Server error. The API endpoint may not exist or is returning an error."
        );
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setSuccess("OTP verified. Redirecting...");
        // small delay for UX
        setTimeout(() => {
          navigate("/reset-password", {
            state: {
              email,
              token: data.token || data.reset_token || "",
              access: data.access || "",
            },
          });
        }, 800);
      } else {
        setError(
          data.message || data.error || "Invalid OTP. Please try again."
        );
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.warn("Request aborted");
      } else {
        console.error("Error verifying OTP:", err);
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${baseUrl}/api/auth/request-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        setError("Server error while resending OTP.");
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setOtp(Array(DEFAULT_OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        setSuccess("OTP resent. Check your email.");
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error resending OTP:", err);
        setError("Failed to resend OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-4 sm:px-6 lg:px-8">
      <div className="pt-6 sm:pt-8 lg:pt-10">
        <button
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-800 transition"
          disabled={isLoading}
          aria-label="Go back"
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

      <div className="flex-1 flex flex-col items-center justify-start pt-8 sm:pt-12 pb-8 max-w-md w-full mx-auto">
        <div className="flex justify-center mb-8 sm:mb-10">
          <img
            src={DonePassword}
            alt="OTP Verification"
            className="h-32 sm:h-40 object-contain"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3 text-center font-sfpro">
          OTP Verification
        </h1>

        <p className="text-sm sm:text-base text-gray-500 mb-8 text-center font-sfpro">
          Enter the OTP sent to {email}
        </p>

        {error && (
          <div
            className="w-full mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm text-red-800 font-sfpro text-center">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div
            className="w-full mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm text-green-800 font-sfpro text-center">
              {success}
            </p>
          </div>
        )}

        <div
          onPaste={handleContainerPaste}
          className="flex gap-2 sm:gap-4 mb-8 justify-center flex-nowrap overflow-x-auto"
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLoading}
              aria-label={`OTP digit ${index + 1}`}
              aria-invalid={!!error}
              className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 text-center text-base sm:text-lg md:text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0093d1] focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed font-sfpro"
            />
          ))}
        </div>

        <p className="text-sm text-gray-600 mb-8 text-center font-sfpro">
          Don't receive the OTP?{" "}
          <button
            onClick={handleResendOTP}
            disabled={isLoading || resendCooldown > 0}
            className="text-[#FFA500] font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            aria-disabled={isLoading || resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
          </button>
        </p>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-[#0093d1] text-white font-medium py-3 sm:py-3.5 rounded-lg hover:bg-[#007bb0] transition text-sm sm:text-base font-sfpro disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
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
              Verifying...
            </>
          ) : (
            "Submit Request"
          )}
        </button>
      </div>
    </div>
  );
}

export default OTPVerificationPage;
