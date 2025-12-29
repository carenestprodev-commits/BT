/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import WhyWantWork from "./WhyWantWork";
import CareCategory from "./CareCategory";
import ChildCareDetails from "./ChildCareDetails";
import ElderlyCareDetails from "./ElderlyCareDetails";
import TutoringDetails from "./TutoringDetails";
import HouseKeepingDetails from "./HouseKeepingDetails";
import EmailPassword from "./EmailPassword";
import SidebarSignup from "./SidebarSignup";

function Signup() {
  const [currentStep, setCurrentStep] = useState("whyWantWork"); // Steps: whyWantWork, careCategory, details, emailPassword
  const [formData, setFormData] = useState({
    reason: "",
    careCategory: "",
    // Add other form fields as needed
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const updateFormData = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getCurrentStepNumber = () => {
    switch (currentStep) {
      case "whyWantWork":
        return 1;
      case "careCategory":
        return 2;
      case "details":
        return 3;
      case "emailPassword":
        return selectedCategory ? 4 : 3;
      default:
        return 1;
    }
  };

  const handleWhyWantWorkNext = (reason) => {
    updateFormData("reason", reason);
    setCurrentStep("careCategory");
  };

  const handleCareCategoryNext = () => {
    if (!selectedCategory) return;
    setCurrentStep("details");
  };

  const handleDetailsNext = () => {
    console.debug &&
      console.debug(
        "Signup: handleDetailsNext called - advancing to emailPassword"
      );
    setCurrentStep("emailPassword");
  };

  const handleBack = () => {
    switch (currentStep) {
      case "careCategory":
        setCurrentStep("whyWantWork");
        break;
      case "details":
        setCurrentStep("careCategory");
        break;
      case "emailPassword":
        setCurrentStep("details");
        break;
      default:
        // Go back to login page
        window.history.back();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "whyWantWork":
        return (
          <WhyWantWork
            handleNext={handleWhyWantWorkNext}
            handleBack={handleBack}
          />
        );

      case "careCategory":
        return (
          <CareCategory
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            updateFormData={updateFormData}
            handleNext={handleCareCategoryNext}
            handleBack={handleBack}
          />
        );

      case "details":
        // Conditional rendering based on selected category
        switch (selectedCategory) {
          case "Childcare":
            return (
              <ChildCareDetails
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleDetailsNext}
                handleBack={handleBack}
                showLocationPopup={showLocationPopup}
                setShowLocationPopup={setShowLocationPopup}
              />
            );
          case "Elderly Care":
            return (
              <ElderlyCareDetails
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleDetailsNext}
                handleBack={handleBack}
                showLocationPopup={showLocationPopup}
                setShowLocationPopup={setShowLocationPopup}
              />
            );
          case "Tutoring":
            return (
              <TutoringDetails
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleDetailsNext}
                handleBack={handleBack}
                showLocationPopup={showLocationPopup}
                setShowLocationPopup={setShowLocationPopup}
              />
            );
          case "Housekeeping":
            return (
              <HouseKeepingDetails
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleDetailsNext}
                handleBack={handleBack}
                showLocationPopup={showLocationPopup}
                setShowLocationPopup={setShowLocationPopup}
              />
            );
          default:
            return <div>Please select a category</div>;
        }

      case "emailPassword":
        return (
          <EmailPassword
            formData={formData}
            updateFormData={updateFormData}
            handleBack={handleBack}
          />
        );

      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="flex lg:grid lg:grid-cols-[440px_1fr] min-h-screen bg-gray-50 font-sfpro">
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-30 p-4 border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="CareLogo.png" // Changed from "/CareLogo.png"
              alt="CareNestPro Logo"
              className="h-8 mr-2"
            />
            <h1 className="text-lg font-semibold text-[#024a68]">
              CareNest<span className="text-[#00b3a4]">Pro</span>
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop: Fixed, Mobile: Overlay */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative z-40 transition-transform duration-300 ease-in-out`}
      >
        <SidebarSignup
          activeStep={getCurrentStepNumber()}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center min-h-screen pt-16 lg:pt-0 p-4">
        {renderCurrentStep()}
      </div>
    </div>
  );
}

export default Signup;
