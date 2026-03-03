/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CareLogo from "../../../public/CareLogo.png";

const Home = () => {
  const [selectedRole, setSelectedRole] = useState("seeker"); // default to care seeker
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole === "provider") {
      navigate("/careproviders/login");
    } else {
      navigate("/careseekers/login");
    }
  };

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center px-4 py-8 font-sfpro"
      style={{ backgroundColor: "#f0f7fc" }}
    >
      <div className="w-full max-w-md">
        {/* Logo + Title */}
        <div className="flex items-center justify-center mb-8 space-x-2">
          <img src={CareLogo} alt="CareNestPro Logo" className="h-14" />
          <h1 className="text-2xl md:text-3xl font-sfpro font-semibold text-[#024a68]">
            CareNest<span className="text-[#00b3a4]">Pro</span>
          </h1>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">
          Welcome to CareNestPro
        </h1>

        {/* Subheading */}
        <p className="text-center text-gray-600 text-sm md:text-base mb-10 leading-relaxed">
          Connecting families to trusted care and empowering care professionals
          to grow meaningful career
        </p>

        {/* Options Container */}
        <div className="space-y-4 mb-8">
          {/* Care Provider Option */}
          <label
            className="flex items-center p-4 md:p-5 border-2 rounded-2xl cursor-pointer transition duration-200"
            style={{
              borderColor: selectedRole === "provider" ? "#0093d1" : "#e5e7eb",
              backgroundColor:
                selectedRole === "provider" ? "#e8f4f8" : "#ffffff",
            }}
            onClick={() => setSelectedRole("provider")}
          >
            <input
              type="radio"
              name="role"
              value="provider"
              checked={selectedRole === "provider"}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-5 h-5 cursor-pointer"
              style={{ accentColor: "#0093d1" }}
            />
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-semibold text-gray-900">
                  I'm a Care Provider
                </span>
                {selectedRole === "provider" && (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{ color: "#0093d1" }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p
                className="text-xs md:text-sm mt-1"
                style={{ color: "#0093d1" }}
              >
                I want access to verified care jobs opportunities
              </p>
            </div>
          </label>

          {/* Care Seeker Option */}
          <label
            className="flex items-center p-4 md:p-5 border-2 rounded-2xl cursor-pointer transition duration-200"
            style={{
              borderColor: selectedRole === "seeker" ? "#0093d1" : "#e5e7eb",
              backgroundColor:
                selectedRole === "seeker" ? "#e8f4f8" : "#ffffff",
            }}
            onClick={() => setSelectedRole("seeker")}
          >
            <input
              type="radio"
              name="role"
              value="seeker"
              checked={selectedRole === "seeker"}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-5 h-5 cursor-pointer"
              style={{ accentColor: "#0093d1" }}
            />
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-semibold text-gray-900">
                  I'm a Care Seeker
                </span>
                {selectedRole === "seeker" && (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{ color: "#0093d1" }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                I want to find trusted, verified care providers for my needs.
              </p>
            </div>
          </label>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full text-white text-lg md:text-base font-semibold py-3 md:py-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          style={{
            backgroundColor: "#0093d1",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#007ab3")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#0093d1")}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Home;
