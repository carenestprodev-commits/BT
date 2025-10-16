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
    confirmPassword: ""
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'useCurrentLocation' && value === true) {
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
          case 1: return 2; // CareCategory → ChildInformation
          case 2: return 3; // ChildInformation → ChildCareProviderExperience
          case 3: return 4; // ChildCareProviderExperience → ChildTimeDetails
          case 4: return 5; // ChildTimeDetails → ChildSummary
          case 5: return 6; // ChildSummary → CareProvidersNearYou
          default: return null;
        }
      case "Elderly Care":
        switch (currentStep) {
          case 1: return 2; // CareCategory → ElderlyInformation
          case 2: return 3; // ElderlyInformation → ElderlyCareProviderExperience
          case 3: return 4; // ElderlyCareProviderExperience → ElderlyTimeDetails
          case 4: return 5; // ElderlyTimeDetails → ElderlySummary
          case 5: return 6; // ElderlySummary → CareProvidersNearYou
          default: return null;
        }
      case "Tutoring":
        switch (currentStep) {
          case 1: return 2; // CareCategory → TutoringInformation
          case 2: return 3; // TutoringInformation → TutoringTimeDetails
          case 3: return 4; // TutoringTimeDetails → TutoringSummary
          case 4: return 5; // TutoringSummary → CareProvidersNearYou
          default: return null;
        }
      case "Housekeeping":
        switch (currentStep) {
          case 1: return 2; // CareCategory → HousekeeperInformation
          case 2: return 3; // HousekeeperInformation → HouseKeepingTimeDetails
          case 3: return 4; // HouseKeepingTimeDetails → HousekeepingSummary
          case 4: return 5; // HousekeepingSummary → CareProvidersNearYou
          default: return null;
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
    setIsEmailComplete(true);
    setShowEmailPopup(false);
  };

  const handlePasswordComplete = () => {
    setIsPasswordComplete(true);
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
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <SidebarSignup 
        activeStep={currentStep} 
        selectedCategory={selectedCategory}
      />

      {/* Main Content */}
      <div 
        className="flex-1 flex items-center justify-center min-h-screen font-sfpro"
        style={{ marginLeft: '440px' }}
      >
        <div className="w-full flex flex-col items-center justify-center py-12 px-8">
          <h2 className="text-4xl font-semibold text-gray-800 mb-8 text-center font-sfpro">
            Create an account
          </h2>
          <div className="w-full flex justify-center">
            {renderStepContent()}
          </div>
        </div>
      </div>

      {/* Email Popup */}
      {showEmailPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-full p-8">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-full p-8">
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