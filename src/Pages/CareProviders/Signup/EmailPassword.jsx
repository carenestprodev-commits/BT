/* eslint-disable no-unused-vars */
import { useState } from "react";
import CareLogo from "../../../../public/CareLogo.png";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  registerAndCreateProfile,
  saveStep,
} from "../../../Redux/CareProviderAuth";
import { useAuth } from "../../../Context/AuthContext";

function EmailPassword({ formData, updateFormData, handleBack }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const dispatch = useDispatch();
  const providerState = useSelector((state) => state.careProvider) || null;
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
  const isStrongPassword = (pw) =>
    pw && /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pw);

  const handleSignUp = async (e) => {
    e.preventDefault();

    /// validate again before submit
    if (!isValidEmail(email)) {
      alert("Please provide a valid email address");
      return;
    }
    if (!phone) {
      alert("Please provide a phone number");
      return;
    }
    if (!isStrongPassword(password)) {
      alert("Password must be at least 8 characters and include a number");
      return;
    }
    if (password !== password2) {
      alert("Passwords do not match");
      return;
    }
    // NEW: Add terms acceptance check
    if (!acceptedTerms) {
      alert("Please accept the Terms of Use and Privacy Policy to continue");
      return;
    }

    // Read provider onboarding steps from Redux (preferred) and fall back to localStorage
    let steps = (providerState && providerState.steps) || {};
    if (!steps || Object.keys(steps).length === 0) {
      const raw = localStorage.getItem("provider_onboarding");
      const stored = raw ? JSON.parse(raw) : { steps: {} };
      steps = stored.steps || {};
    }

    // Merge existing user_data (if any) so we don't overwrite first/last name saved earlier
    const existingUserData = steps.user_data || {};
    const mergedUserData = {
      ...existingUserData,
      full_name:
        existingUserData.full_name ||
        (steps.child_profile &&
          steps.child_profile.user_data &&
          steps.child_profile.user_data.full_name) ||
        existingUserData.full_name ||
        "",
      email,
      password,
      password2,
      user_type: "provider",
    };
    // Persist merged user_data
    dispatch(saveStep({ stepName: "user_data", data: mergedUserData }));

    // We'll merge steps below into `mergedProfile`

    // Simpler approach: merge everything found in local steps and all profile sub-steps
    // so we don't accidentally miss keys saved by any page. Then override a few
    // canonical fields the backend expects (service_category, work_reason).
    const mergedProfile = {
      ...(steps || {}),
      ...(steps.child_profile || {}),
      ...(steps.elderly_profile || {}),
      ...(steps.housekeeping_profile || {}),
      ...(steps.tutoring_profile || {}),
    };

    // Ensure some canonical fields are present and normalized
    mergedProfile.service_category = (
      steps.careCategory ||
      mergedProfile.service_category ||
      ""
    ).toLowerCase();
    mergedProfile.work_reason =
      steps.whyWantWork || mergedProfile.work_reason || "";

    // Normalize some common arrays/fields to match expected backend naming
    if (mergedProfile.nativeLanguage && !mergedProfile.languages)
      mergedProfile.languages = [mergedProfile.nativeLanguage];
    if (mergedProfile.servicesProvided && !mergedProfile.skills)
      mergedProfile.skills = mergedProfile.servicesProvided;
    if (mergedProfile.otherServices && !mergedProfile.additional_services)
      mergedProfile.additional_services = mergedProfile.otherServices;

    // Helper to ensure array values
    const ensureArray = (v) => {
      if (!v && v !== 0) return [];
      if (Array.isArray(v)) return v;
      return [v];
    };

    // Build canonical profile_data shape expected by backend (snake_case keys)
    const profileData = {
      service_category:
        mergedProfile.service_category || mergedProfile.serviceCategory || "",
      work_reason: mergedProfile.work_reason || mergedProfile.workReason || "",
      profile_title:
        mergedProfile.title ||
        mergedProfile.profileTitle ||
        mergedProfile.profile_title ||
        "",
      about_me:
        mergedProfile.aboutYou ||
        mergedProfile.about_me ||
        mergedProfile.about ||
        "",
      country: mergedProfile.country || "",
      city: mergedProfile.city || "",
      state:
        mergedProfile.state ||
        mergedProfile.region ||
        mergedProfile.state ||
        "",
      zip_code:
        mergedProfile.zipCode ||
        mergedProfile.zip_code ||
        mergedProfile.zip ||
        "",
      nationality:
        mergedProfile.nationality || mergedProfile.nationality_country || "",
      native_language:
        mergedProfile.nativeLanguage || mergedProfile.native_language || "",
      experience_level:
        mergedProfile.experienceLevel || mergedProfile.experience_level || "",
      years_of_experience:
        parseInt(
          mergedProfile.yearsOfExperience ||
            mergedProfile.years_of_experience ||
            mergedProfile.years ||
            0,
        ) || 0,
      hourly_rate:
        parseFloat(
          mergedProfile.hourlyRate || mergedProfile.hourly_rate || 0,
        ) || 0,
      languages: ensureArray(
        mergedProfile.languages ||
          mergedProfile.nativeLanguage ||
          mergedProfile.otherLanguage,
      ),
      additional_services: ensureArray(
        mergedProfile.additional_services ||
          mergedProfile.otherServices ||
          mergedProfile.other_services,
      ),
      skills: ensureArray(
        mergedProfile.skills ||
          mergedProfile.servicesProvided ||
          mergedProfile.careQualities ||
          mergedProfile.subjects,
      ),
      category_specific_details: {},
    };

    const cat = (profileData.service_category || "").toLowerCase();
    if (cat === "childcare") {
      profileData.category_specific_details = {
        type_of_care_provider: Array.isArray(mergedProfile.providerType)
          ? mergedProfile.providerType[0]
          : mergedProfile.providerType ||
            mergedProfile.type_of_care_provider ||
            "",
        preferred_option: Array.isArray(mergedProfile.housekeepingPreference)
          ? mergedProfile.housekeepingPreference[0]
          : mergedProfile.preferredWorkOption ||
            mergedProfile.preferred_option ||
            (mergedProfile.housekeepingPreference &&
              mergedProfile.housekeepingPreference[0]) ||
            "",
        special_preferences: ensureArray(
          mergedProfile.specialPreferences ||
            mergedProfile.special_preferences ||
            mergedProfile.servicesProvided ||
            mergedProfile.careQualities,
        ),
        communication_language:
          mergedProfile.communicationLanguage ||
          mergedProfile.nativeLanguage ||
          mergedProfile.native_language ||
          "",
      };
    } else if (cat === "tutoring") {
      profileData.category_specific_details = {
        tutoring_services: ensureArray(
          mergedProfile.tutoringServices ||
            mergedProfile.tutoring_services ||
            [],
        ),
        experience_level_taught: ensureArray(
          mergedProfile.tutoringExperienceLevel ||
            mergedProfile.tutoring_experience_level ||
            mergedProfile.tutoringExperienceLevel,
        ),
        subjects_experienced_in: ensureArray(
          mergedProfile.subjects ||
            mergedProfile.subjects_experienced_in ||
            mergedProfile.subjects,
        ),
      };
    } else if (cat === "elderlycare") {
      profileData.category_specific_details = {
        personality_and_interpersonal_skills: ensureArray(
          mergedProfile.careQualities ||
            mergedProfile.personality_and_interpersonal_skills,
        ),
        special_preferences: ensureArray(
          mergedProfile.specialPreferences ||
            mergedProfile.special_preferences ||
            mergedProfile.careQualities,
        ),
        communication_language:
          mergedProfile.communicationLanguage ||
          mergedProfile.nativeLanguage ||
          mergedProfile.native_language ||
          "",
        preferred_option: Array.isArray(mergedProfile.housekeepingPreference)
          ? mergedProfile.housekeepingPreference[0]
          : mergedProfile.preferred_option ||
            mergedProfile.preferredWorkOption ||
            "",
      };
    } else if (cat === "housekeeping") {
      profileData.category_specific_details = {
        housekeeping_preference: Array.isArray(
          mergedProfile.housekeepingPreference,
        )
          ? mergedProfile.housekeepingPreference[0]
          : mergedProfile.housekeepingPreference ||
            mergedProfile.housekeeping_preference ||
            "",
        services_offered: ensureArray(
          mergedProfile.servicesProvided || mergedProfile.skills || [],
        ),
      };
    }

    const userFirst =
      (steps.user_data && steps.user_data.first_name) ||
      mergedProfile.firstName ||
      mergedProfile.first_name ||
      "";
    const userLast =
      (steps.user_data && steps.user_data.last_name) ||
      mergedProfile.lastName ||
      mergedProfile.last_name ||
      "";

    const payload = {
      user_data: {
        first_name: userFirst,
        last_name: userLast,
        phone_number: phone,
        email,
        password,
        user_type: "provider",
      },
      profile_data: profileData,
    };

    // Debug log so you can inspect the full payload in browser console
    console.log("OUTGOING PAYLOAD (canonical)", payload);

    try {
      const resultAction = await dispatch(registerAndCreateProfile(payload));
      if (resultAction.error) {
        alert(
          "Registration failed: " +
            (resultAction.payload ||
              resultAction.error.message ||
              JSON.stringify(resultAction.error)),
        );
      } else {
        const res = resultAction.payload;
        alert(res.message || "Account created");

        // Set user in AuthContext
        if (res?.user) {
          setUser({
            ...res.user,
            user_type: "provider",
            email: email,
          });
        }

        navigate("/careproviders/dashboard");
        // Optionally clear onboarding
        // dispatch(clearOnboarding())
      }
    } catch (err) {
      alert("Registration failed: " + err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-white font-sfpro pt-8">
      {/* Logo + Title */}
      <div className="flex items-center mb-0 space-x-2">
        <img src={CareLogo} alt="CareNestPro Logo" className="h-14" />
        <h1 className="text-2xl font-semibold text-[#024a68]">
          CareNest<span className="text-[#00b3a4]">Pro</span>
        </h1>
      </div>

      {/* Login Box */}
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-3xl">
        <div className="flex justify-end mb-4 lg:mb-6">
          <Link to="/">
            <button
              onClick={handleBack}
              className="border border-gray-300 rounded-md py-2 px-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition"
            >
              ←
            </button>
          </Link>
        </div>

        <h2 className="text-lg lg:text-xl font-semibold text-gray-800 font-tomato">
          Sign Up
        </h2>
        <p className="text-gray-500 text-sm mt-1 mb-4 lg:mb-6">
          Welcome back, Please enter your signup details
        </p>

        {/* Form */}
        <form className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium  mb-1 text-gray-700">
              Email Address
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Input email address"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-white dark:text-gray-700"
            />
            {!isValidEmail(email) && email && (
              <p className="text-red-500 text-sm mt-1">
                Please enter a valid email address
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="Input phone number"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-white dark:text-gray-700"
            />
          </div>

          {/* Password with Eye Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Input password"
                className="dark:bg-white dark:text-gray-700 w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {/* Eye Icon */}
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.263.235-2.465.662-3.575M3.515 3.515l16.97 16.97M9.88 9.88A3 3 0 0012 15a3 3 0 002.121-5.121"
                    />
                  </svg>
                ) : (
                  // Eye icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {password && !isStrongPassword(password) && (
              <p className="text-red-500 text-sm mt-1">
                Password must be at least 8 characters and include a number
              </p>
            )}
          </div>

          {/* Confirm Password with Eye Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Input password"
                className="dark:bg-white dark:text-gray-700 w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {/* Eye Icon */}
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.263.235-2.465.662-3.575M3.515 3.515l16.97 16.97M9.88 9.88A3 3 0 0012 15a3 3 0 002.121-5.121"
                    />
                  </svg>
                ) : (
                  // Eye icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Sign Up */}
            <p className="text-center text-sm text-gray-500 mt-6 mb-5">
              Already have an account?{" "}
              <Link to="/careproviders/login">
                <span className="text-[#0093d1] hover:underline">Log In</span>
              </Link>
            </p>
          </div>
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
              className="text-[#0093d1] underline"
            >
              CareNestPro&apos;s Terms of Use
            </a>
            ,{" "}
            <a
              href="https://carenestpro.com/care-provider-agreement/"
              className="text-[#0093d1] underline"
            >
              Agreement
            </a>{" "}
            ,{" "}
            <a
              href="https://carenestpro.com/child-sexual-abuse-and-exploitation-csae-policy/"
              className="text-[#0093d1] underline"
            >
              Child Sexual Abuse and Exploitation (CSAE) Policy
            </a>{" "}
            and{" "}
            <a
              href="https://carenestpro.com/privacy-policy/"
              className="text-[#0093d1] underline"
            >
              Privacy policy
            </a>
            ,{" "}
            <a
              href="https://carenestpro.com/background-check-consent/"
              className="text-[#0093d1] underline"
            >
              Background check consent
            </a>
            .
          </label>
          {/* Sign Up Button */}
          <button
            type="submit"
            onClick={handleSignUp}
            disabled={
              !isValidEmail(email) ||
              !isStrongPassword(password) ||
              password !== password2
            }
            className="w-full bg-[#0093d1] text-white font-medium py-2 rounded-md hover:bg-[#007bb0] transition disabled:opacity-60"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmailPassword;
