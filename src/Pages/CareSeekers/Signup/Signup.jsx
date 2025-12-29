/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import SidebarSignup, { getStepsForCategory } from "./SidebarSignup";
import CareCategory from "./CareCategory";
import ChildInformation from "./ChildInformation";
import ElderlyInformation from "./ElderlyInformation";
import TutoringInformation from "./TutoringInformation";
import HousekeeperInformation from "./HousekeeperInformation";
import ChildCareProviderExperience from "./ChildCareProviderExperience";
import ElderlyCareProviderExperience from "./ElderlyCareProviderExperience";
import ChildTimeDetails from "./ChildTimeDetails";
import ElderlyTimeDetails from "./ElderlyTimeDetails";
import TutoringTimeDetails from "./TutoringTimeDetails";
import HouseKeepingTimeDetails from "./HouseKeepingTimeDetails";
import ChildSummary from "./ChildSummary";
import ElderlySummary from "./ElderlySummary";
import TutoringSummary from "./TutoringSummary";
import HousekeepingSummary from "./HousekeepingSummary";
import CareProvidersNearYou from "./CareProvidersNearYou";
import EmailStep from "./EmailStep";
import PasswordStep from "./PasswordStep";

function Signup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [isEmailComplete, setIsEmailComplete] = useState(false);
  const [isPasswordComplete, setIsPasswordComplete] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    // Category
    careCategory: "",

    // Location data
    useCurrentLocation: false,
    country: "",
    state: "",
    city: "",
    zipCode: "",

    // Child care specific
    numberOfChildren: "",
    childrenDetails: [],

    // Elderly care specific
    elderlyCareType: "",
    relationshipWithElderly: "",
    ageOfElderly: "",
    genderOfElderly: "",
    healthCondition: "",
    otherHealthCondition: "",
    assistanceForm: "",

    // Tutoring specific
    tutoringSubjects: [],
    studentAge: "",
    currentGrade: "",

    // Housekeeping specific
    housekeepingServices: [],
    homeSize: "",
    cleaningFrequency: "",

    // Experience and preferences
    careProviderQualities: [],
    careProviderExperience: [],

    // Time details
    scheduleType: "Reoccurring",
    startDate: "",
    endDate: "",
    repeatEvery: "",
    repeatFrequency: "Weekly",
    repeatDays: [],
    startTime: "",
    endTime: "",
    hourlyRateStart: 80,
    hourlyRateEnd: 1230,

    // Summary
    messageToProvider: "",
    acceptedTerms: false,

    // Auth
    email: "",
    password: "",
    confirmPassword: "",
  });

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "useCurrentLocation" && value === true) {
      setShowLocationPopup(true);
    }
  };

  const handleNext = () => {
    const nextStep = getNextStep();
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    const prevStep = getPreviousStep();
    if (prevStep) {
      setCurrentStep(prevStep);
    }
  };

  const getNextStep = () => {
    switch (selectedCategory) {
      case "Childcare":
        switch (currentStep) {
          case 1:
            return 2; // CareCategory → ChildInformation
          case 2:
            return 3; // ChildInformation → ChildCareProviderExperience
          case 3:
            return 4; // ChildCareProviderExperience → ChildTimeDetails
          case 4:
            return 5; // ChildTimeDetails → ChildSummary
          case 5:
            return 6; // ChildSummary → CareProvidersNearYou
          default:
            return null;
        }
      case "Elderly Care":
        switch (currentStep) {
          case 1:
            return 2; // CareCategory → ElderlyInformation
          case 2:
            return 3; // ElderlyInformation → ElderlyCareProviderExperience
          case 3:
            return 4; // ElderlyCareProviderExperience → ElderlyTimeDetails
          case 4:
            return 5; // ElderlyTimeDetails → ElderlySummary
          case 5:
            return 6; // ElderlySummary → CareProvidersNearYou
          default:
            return null;
        }
      case "Tutoring":
        switch (currentStep) {
          case 1:
            return 2; // CareCategory → TutoringInformation
          case 2:
            return 3; // TutoringInformation → TutoringTimeDetails
          case 3:
            return 4; // TutoringTimeDetails → TutoringSummary
          case 4:
            return 5; // TutoringSummary → CareProvidersNearYou
          default:
            return null;
        }
      case "Housekeeping":
        switch (currentStep) {
          case 1:
            return 2; // CareCategory → HousekeeperInformation
          case 2:
            return 3; // HousekeeperInformation → HouseKeepingTimeDetails
          case 3:
            return 4; // HouseKeepingTimeDetails → HousekeepingSummary
          case 4:
            return 5; // HousekeepingSummary → CareProvidersNearYou
          default:
            return null;
        }
      default:
        // If no category is selected, only allow moving from step 1 to step 2
        return currentStep === 1 && selectedCategory ? 2 : null;
    }
  };

  const getPreviousStep = () => {
    return currentStep > 1 ? currentStep - 1 : null;
  };

  const handleEmailComplete = () => {
    // Validate email before marking complete
    const isValidEmail = (email) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
    if (isValidEmail(formData.email)) {
      setIsEmailComplete(true);
    }
    setShowEmailPopup(false);
  };

  const handlePasswordComplete = () => {
    const isStrongPassword = (pw) =>
      pw && /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pw);
    if (
      isStrongPassword(formData.password) &&
      formData.password === formData.confirmPassword
    ) {
      setIsPasswordComplete(true);
    }
    setShowPasswordPopup(false);
  };

  const handleEmailPopupClose = () => {
    setShowEmailPopup(false);
  };

  const handlePasswordPopupClose = () => {
    setShowPasswordPopup(false);
  };

  const renderStepContent = () => {
    const totalSteps = getStepsForCategory(selectedCategory).length;

    // Step 1 is always CareCategory
    if (currentStep === 1) {
      return (
        <CareCategory
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          updateFormData={updateFormData}
          handleNext={handleNext}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      );
    }

    // For subsequent steps, render based on selected category
    switch (selectedCategory) {
      case "Childcare":
        switch (currentStep) {
          case 2:
            return (
              <ChildInformation
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                showLocationPopup={showLocationPopup}
                setShowLocationPopup={setShowLocationPopup}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            );
          case 3:
            return (
              <ChildCareProviderExperience
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            );
          case 4:
            return (
              <ChildTimeDetails
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            );
          case 5:
            return (
              <ChildSummary
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            );
          case 6:
            return (
              <CareProvidersNearYou
                formData={formData}
                isEmailComplete={isEmailComplete}
                isPasswordComplete={isPasswordComplete}
                onShowEmailPopup={() => setShowEmailPopup(true)}
                onShowPasswordPopup={() => setShowPasswordPopup(true)}
              />
            );
          default:
            return (
              <CareCategory
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                updateFormData={updateFormData}
                handleNext={handleNext}
              />
            );
        }

      case "Elderly Care":
        switch (currentStep) {
          case 2:
            return (
              <ElderlyInformation
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                showLocationPopup={showLocationPopup}
                setShowLocationPopup={setShowLocationPopup}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            );
          case 3:
            return (
              <ElderlyCareProviderExperience
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            );
          case 4:
            return (
              <ElderlyTimeDetails
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            );
          case 5:
            return (
              <ElderlySummary
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            );
          case 6:
            return (
              <CareProvidersNearYou
                formData={formData}
                isEmailComplete={isEmailComplete}
                isPasswordComplete={isPasswordComplete}
                onShowEmailPopup={() => setShowEmailPopup(true)}
                onShowPasswordPopup={() => setShowPasswordPopup(true)}
              />
            );
          default:
            return (
              <CareCategory
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                updateFormData={updateFormData}
                handleNext={handleNext}
              />
            );
        }

      case "Tutoring":
        switch (currentStep) {
          case 2:
            return (
              <TutoringInformation
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                showLocationPopup={showLocationPopup}
                setShowLocationPopup={setShowLocationPopup}
              />
            );
          case 3:
            return (
              <TutoringTimeDetails
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            );
          case 4:
            return (
              <TutoringSummary
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            );
          case 5:
            return (
              <CareProvidersNearYou
                formData={formData}
                isEmailComplete={isEmailComplete}
                isPasswordComplete={isPasswordComplete}
                onShowEmailPopup={() => setShowEmailPopup(true)}
                onShowPasswordPopup={() => setShowPasswordPopup(true)}
              />
            );
          default:
            return (
              <CareCategory
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                updateFormData={updateFormData}
                handleNext={handleNext}
              />
            );
        }

      case "Housekeeping":
        switch (currentStep) {
          case 2:
            return (
              <HousekeeperInformation
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                showLocationPopup={showLocationPopup}
                setShowLocationPopup={setShowLocationPopup}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            );
          case 3:
            return (
              <HouseKeepingTimeDetails
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            );
          case 4:
            return (
              <HousekeepingSummary
                formData={formData}
                updateFormData={updateFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            );
          case 5:
            return (
              <CareProvidersNearYou
                formData={formData}
                isEmailComplete={isEmailComplete}
                isPasswordComplete={isPasswordComplete}
                onShowEmailPopup={() => setShowEmailPopup(true)}
                onShowPasswordPopup={() => setShowPasswordPopup(true)}
              />
            );
          default:
            return (
              <CareCategory
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                updateFormData={updateFormData}
                handleNext={handleNext}
              />
            );
        }

      default:
        // Default fallback - always show CareCategory if no valid category is selected
        return (
          <CareCategory
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            updateFormData={updateFormData}
            handleNext={handleNext}
          />
        );
    }
  };

  return (
    <div className="flex lg:grid lg:grid-cols-[440px_1fr] min-h-screen bg-white">
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-30 p-4 border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/CareLogo.png"
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
          activeStep={currentStep}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center min-h-screen font-sfpro pt-16 lg:pt-0">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-12 px-4 lg:px-8">
          <h2 className="text-2xl lg:text-4xl font-semibold text-gray-800 mb-6 lg:mb-8 text-center font-sfpro">
            Create an account
          </h2>
          <div className="w-full flex justify-center">
            {renderStepContent()}
          </div>
        </div>
      </div>

      {/* Email Popup */}
      {showEmailPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-6 lg:p-8">
            <EmailStep
              formData={formData}
              updateFormData={updateFormData}
              onClose={handleEmailPopupClose}
              onComplete={handleEmailComplete}
            />
          </div>
        </div>
      )}

      {/* Password Popup */}
      {showPasswordPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-6 lg:p-8">
            <PasswordStep
              formData={formData}
              updateFormData={updateFormData}
              onClose={handlePasswordPopupClose}
              onComplete={handlePasswordComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;
