/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  saveStep,
  registerAndPublish,
  buildRegisterAndPublishPayload,
} from "../../../Redux/CareSeekerAuth";
import { useAuth } from "../../../Context/AuthContext";
import CareNestPro_Later from "../../../../public//CareNestPro_Later.jpeg";

// --- Sub-component: The "I'll do this later" Modal ---
const SignUpModal = ({ isOpen, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [signupForm, setSignupForm] = useState({
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

  // Validation functions
  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");

  const isStrongPassword = (pw) =>
    pw && /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pw);

  // Read onboarding data from localStorage
  const readOnboarding = () => {
    try {
      const raw = localStorage.getItem("seeker_onboarding");
      return raw ? JSON.parse(raw) : { steps: {}, preview: null };
    } catch (e) {
      console.error("Error reading onboarding data:", e);
      return { steps: {}, preview: null };
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !signupForm.firstName ||
      !signupForm.lastName ||
      !signupForm.email ||
      !signupForm.password ||
      signupForm.password !== signupForm.confirmPassword
    ) {
      alert(
        "Please provide first name, last name, valid email and matching passwords"
      );
      return;
    }

    if (!isValidEmail(signupForm.email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (!isStrongPassword(signupForm.password)) {
      alert("Password must be at least 8 characters and include a number");
      return;
    }

    setIsLoading(true);

    try {
      const onboarding = readOnboarding();

      const userCredentials = {
        firstName: signupForm.firstName,
        lastName: signupForm.lastName,
        email: signupForm.email,
        password: signupForm.password,
      };

      const payload = buildRegisterAndPublishPayload(
        onboarding.steps,
        userCredentials
      );

      const resAction = await dispatch(registerAndPublish(payload));

      if (!acceptedTerms) {
        alert("Please accept the Terms of Use and Privacy Policy to continue");
        return;
      }

      if (resAction.error) {
        alert(
          "Registration failed: " +
            (resAction.payload || resAction.error.message)
        );
        setIsLoading(false);
      } else {
        // Save registration result
        dispatch(saveStep({ stepName: "registered", data: resAction.payload }));

        // Set user in AuthContext
        if (resAction.payload?.user) {
          setUser({
            ...resAction.payload.user,
            user_type: "seeker",
            email: signupForm.email,
          });
        }

        // Close modal and redirect to dashboard
        onClose();
        navigate("/careseekers/dashboard/home");
      }
    } catch (e) {
      alert("Unexpected error: " + e.message);
      setIsLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid =
    signupForm.firstName &&
    signupForm.lastName &&
    isValidEmail(signupForm.email) &&
    isStrongPassword(signupForm.password) &&
    signupForm.password === signupForm.confirmPassword &&
    acceptedTerms;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Click outside to close handler */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-fadeIn font-sfpro">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
          aria-label="Close"
        >
          ×
        </button>

        {/* Header Image */}
        <div className="flex justify-center mb-4">
          <img
            src={CareNestPro_Later}
            alt="CareNest Illustration"
            className="h-24 md:h-32 object-contain"
          />
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            Sign Up to View Care Providers near you
          </h2>
          <p className="text-xs md:text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
            Kindly enter your details below to view care providers near you.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleRegister}>
          {/* Row 1: Names */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                placeholder="First name"
                value={signupForm.firstName}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, firstName: e.target.value })
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
                value={signupForm.lastName}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, lastName: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-3 border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm focus:border-transparent transition"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Input email address"
              value={signupForm.email}
              onChange={(e) =>
                setSignupForm({ ...signupForm, email: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-3 border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm focus:border-transparent transition"
              required
            />
            {signupForm.email && !isValidEmail(signupForm.email) && (
              <p className="text-xs text-red-500 mt-1">
                Please enter a valid email address
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Input password"
                value={signupForm.password}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, password: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-3 border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm focus:border-transparent transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 0 1 1.175-4.875M6.1 6.1A9.958 9.958 0 0 1 12 5c5.523 0 10 4.477 10 10 0 1.096-.18 2.15-.519 3.124M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {signupForm.password && !isStrongPassword(signupForm.password) && (
              <p className="text-xs text-red-500 mt-1">
                Password must be at least 8 characters and include a number
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={signupForm.confirmPassword}
                onChange={(e) =>
                  setSignupForm({
                    ...signupForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-3 border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm focus:border-transparent transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 0 1 1.175-4.875M6.1 6.1A9.958 9.958 0 0 1 12 5c5.523 0 10 4.477 10 10 0 1.096-.18 2.15-.519 3.124M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {signupForm.confirmPassword &&
              signupForm.password !== signupForm.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
          </div>

          {/* Terms and Conditions */}
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
                href="https://carenestpro.com/care-seeker-agreement/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0093d1] underline"
              >
                Agreement
              </a>{" "}
              and{" "}
              <a
                href="https://carenestpro.com/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0093d1] underline"
              >
                Privacy Policy
              </a>
              ,{" "}
              <a
                href="https://carenestpro.com/background-check-consent/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0093d1] underline"
              >
                Background Check Consent
              </a>
              .
            </label>
          </div>

          {/* Submit Button */}
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

        {/* Footer Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
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
    </div>
  );
};

// --- Main Component ---

function CareCategory({
  selectedCategory,
  setSelectedCategory,
  updateFormData,
  handleNext,
  currentStep = 1,
  totalSteps = 5,
}) {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categoryKeyMap = {
    Childcare: "childcare",
    "Elderly Care": "elderlycare",
    Tutoring: "tutoring",
    Housekeeping: "housekeeping",
  };

  const categories = [
    {
      name: "Childcare",
      desc: "Find the Right child Care Provider",
      img: "/box1.svg",
    },
    {
      name: "Elderly Care",
      desc: "Find Your Perfect Elderly Care Provider",
      img: "/box2.svg",
    },
    {
      name: "Tutoring",
      desc: "Find Expert Tutors For Every Subject Area",
      img: "/box3.svg",
    },
    {
      name: "Housekeeping",
      desc: "Find Reliable House Keepers",
      img: "/box4.svg",
    },
  ];

  const isNextEnabled = selectedCategory !== "";

  return (
    <>
      <div className="w-full max-w-2xl mx-auto bg-white p-4 lg:p-4 rounded-2xl shadow-lg border border-gray-100 font-sfpro">
        <div className="relative flex flex-col lg:flex-row lg:justify-between lg:items-center mb-3 gap-3 lg:gap-0">
          <h3 className="text-sm text-center w-full lg:text-base text-gray-700 mb-1 lg:mb-0 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
            What category of Care are you interested in
          </h3>
          <div className="flex items-center">
            <span className="text-base lg:text-lg text-[#0093d1] font-bold">
              Step {currentStep}
            </span>
            <span className="ml-2 text-base lg:text-lg text-gray-500">
              {" "}
              of {totalSteps}
            </span>
          </div>
        </div>
        <p className="text-xs lg:text-sm text-gray-500 mb-2 lg:mb-3 text-center">
          Kindly select options to help us understand your preferences
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-0 gap-y-2 lg:gap-x-0 lg:gap-y-3 mb-2 lg:mb-4 justify-items-center">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat.name);
                updateFormData("careCategory", cat.name);
                const key =
                  categoryKeyMap[cat.name] ||
                  cat.name.toLowerCase().replace(/\s+/g, "");
                dispatch(saveStep({ stepName: "careCategory", data: key }));
              }}
              className={`border rounded-2xl cursor-pointer transition shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center h-32 lg:h-40 p-3 w-full max-w-[220px] lg:max-w-[220px] ${
                selectedCategory === cat.name
                  ? "border-[#00b3a4] bg-[#f0fbf9]"
                  : "border-gray-200"
              }`}
            >
              <img src={cat.img} alt={cat.name} className="h-12 lg:h-16 mb-3" />
              <h4 className="text-sm lg:text-base font-medium text-gray-800">
                {cat.name}
              </h4>
              <p className="text-xs lg:text-sm text-gray-500 mt-1 max-w-[90%] lg:max-w-[80%]">
                {cat.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Primary Sign Up Button */}
        <button
          onClick={() => {
            const selectedKey =
              categoryKeyMap[selectedCategory] ||
              selectedCategory.toLowerCase().replace(/\s+/g, "");
            dispatch(saveStep({ stepName: "careCategory", data: selectedKey }));
            handleNext();
          }}
          disabled={!isNextEnabled}
          className={`w-full text-base lg:text-lg font-medium py-3 rounded-md transition ${
            isNextEnabled
              ? "bg-[#0093d1] text-white hover:bg-[#007bb0]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Sign Up
        </button>

        {/* Secondary "I'll do this later" Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full text-base lg:text-lg font-medium py-3 rounded-md border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 transition mt-3"
        >
          I'll do this later
        </button>
      </div>

      {/* Render the Modal */}
      <SignUpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

export default CareCategory;
