/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  registerAndPublish,
  buildRegisterAndPublishPayload,
} from "../../../Redux/CareSeekerAuth";
import { useAuth } from "../../../Context/AuthContext";
import { useDispatch } from "react-redux";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");

  const isStrongPassword = (pw) =>
    pw && /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pw);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      alert("Please fill in all fields");
      return;
    }

    if (!isValidEmail(form.email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!isStrongPassword(form.password)) {
      alert("Password must be at least 8 characters and include a number");
      return;
    }

    if (!acceptedTerms) {
      alert("Please accept the Terms of Use and Privacy Policy to continue");
      return;
    }

    setIsLoading(true);

    try {
      const userCredentials = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      };

      const payload = buildRegisterAndPublishPayload({}, userCredentials);

      const resultAction = await dispatch(registerAndPublish(payload));

      if (resultAction.error) {
        alert(
          "Registration failed: " +
            (resultAction.payload || resultAction.error.message),
        );
        return;
      }

      if (resultAction.payload?.user) {
        setUser({
          ...resultAction.payload.user,
          user_type: "seeker",
          email: form.email,
        });
      }

      navigate("/careseekers/dashboard/home");
    } catch (err) {
      alert("Unexpected error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    form.firstName &&
    form.lastName &&
    isValidEmail(form.email) &&
    isStrongPassword(form.password) &&
    form.password === form.confirmPassword &&
    acceptedTerms;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sfpro">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/CareLogo.png"
            alt="CareNestPro"
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800">
            Create an account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign up to find the right care provider
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                placeholder="First name"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-3 border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm focus:border-transparent transition"
                required
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-3 border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm focus:border-transparent transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Input email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm focus:border-transparent transition"
              required
            />
            {form.email && !isValidEmail(form.email) && (
              <p className="text-xs text-red-500 mt-1">
                Please enter a valid email address
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Input password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-3 border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm focus:border-transparent transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 0 1 1.175-4.875M6.1 6.1A9.958 9.958 0 0 1 12 5c5.523 0 10 4.477 10 10 0 1.096-.18 2.15-.519 3.124M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {form.password && !isStrongPassword(form.password) && (
              <p className="text-xs text-red-500 mt-1">
                Password must be at least 8 characters and include a number
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-3 border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm focus:border-transparent transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 0 1 1.175-4.875M6.1 6.1A9.958 9.958 0 0 1 12 5c5.523 0 10 4.477 10 10 0 1.096-.18 2.15-.519 3.124M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              className="mr-3 mt-1"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I acknowledge that I have read and accepted{" "}
              <a
                href="https://carenestpro.com/terms-of-service/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0093d1] underline"
              >
                CareNestPro&apos;s Terms of Use
              </a>
              ,{" "}
              <a
                href="https://carenestpro.com/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0093d1] underline"
              >
                Privacy Policy
              </a>
              .
            </label>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full font-semibold py-3 rounded-lg mt-4 transition shadow-md ${
              isFormValid && !isLoading
                ? "bg-[#0093d1] hover:bg-[#007bb0] text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <a
            href="https://app.carenestpro.com/careseekers/login"
            className="text-[#0093d1] font-medium hover:underline"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
