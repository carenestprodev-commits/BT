import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { saveStep, generatePreview } from "../../../Redux/CareSeekerAuth";

function ChildSummary({
  formData,
  updateFormData,
  handleNext,
  handleBack,
  currentStep = 7,
  totalSteps = 8,
}) {
  const dispatch = useDispatch();
  const preview = useSelector((s) => s.careSeeker.preview);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    // if there's no preview in store, try reading from localStorage
    if (!preview) {
      const raw = localStorage.getItem("seeker_onboarding");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.preview) {
            /* nothing */
          }
        } catch {
          /* ignore parse errors */
        }
      }
    }
  }, [preview]);
  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-4 lg:p-8 rounded-2xl shadow-lg border border-gray-100 font-sfpro">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          ←
        </button>
        <h3 className="text-base lg:text-lg text-gray-700 flex-1">Summary</h3>
        <span className="text-base lg:text-lg text-[#0093d1] font-bold">
          Step {currentStep}
        </span>{" "}
        <span className="ml-2 text-base lg:text-lg text-gray-500"> of {totalSteps}</span>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="text-green-600 mr-3">💡</div>
          <p className="text-sm text-green-700">
            This was generated based on the information you gave. This would
            help care providers understand your preferences.
          </p>
        </div>
      </div>
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <p className="text-sm text-gray-700 leading-relaxed">
          {preview?.summary ||
            preview?.title ||
            "This text will be generated after we call the preview API."}
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message to Care Provider <span className="text-red-600">*</span>
        </label>
        <textarea
          placeholder="Have any other information you might want to share with care provider"
          rows="4"
          required
          aria-required="true"
          className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
          style={{ backgroundColor: "#fff", color: "#222" }}
          value={formData.messageToProvider}
          onChange={(e) => updateFormData("messageToProvider", e.target.value)}
        />
        {errors.messageToProvider && (
          <p className="text-sm text-red-600 mt-1">
            {errors.messageToProvider}
          </p>
        )}
      </div>
      <div className="flex items-start mt-6 mb-6">
        <input
          type="checkbox"
          id="terms"
          className="mr-3 mt-1"
          checked={formData.acceptedTerms}
          onChange={(e) => updateFormData("acceptedTerms", e.target.checked)}
          required
          aria-required="true"
        />
        <label htmlFor="terms" className="text-sm text-gray-700">
          I acknowledge that I have read and accepted{" "}
          <a href="#" className="text-[#0093d1] underline">
            CareNestPro&apos;s Terms of Use
          </a>
          ,{" "}
          <a href="#" className="text-[#0093d1] underline">
            Agreement
          </a>{" "}
          and{" "}
          <a href="#" className="text-[#0093d1] underline">
            Privacy policy
          </a>
          .
        </label>
      </div>
      {errors.acceptedTerms && (
        <p className="text-sm text-red-600 mt-1">{errors.acceptedTerms}</p>
      )}
      <button
        onClick={() => {
          const newErrors = {};
          if (
            !formData.messageToProvider ||
            !formData.messageToProvider.toString().trim()
          )
            newErrors.messageToProvider =
              "Please enter a message for the care provider.";
          if (!formData.acceptedTerms)
            newErrors.acceptedTerms = "You must accept the terms to continue.";
          setErrors(newErrors);
          if (Object.keys(newErrors).length > 0) return;

          // save message and acceptedTerms into redux/localStorage before moving on
          dispatch(
            saveStep({
              stepName: "summary",
              data: {
                messageToProvider: formData.messageToProvider,
                acceptedTerms: formData.acceptedTerms,
              },
            })
          );
          handleNext();
        }}
        className="w-full bg-[#0093d1] text-white text-base lg:text-lg font-medium py-3 rounded-md hover:bg-[#007bb0] transition"
        disabled={
          !formData.acceptedTerms ||
          !formData.messageToProvider ||
          !formData.messageToProvider.toString().trim()
        }
      >
        Next
      </button>
    </div>
  );
}

export default ChildSummary;
