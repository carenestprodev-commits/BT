/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { saveStep } from "../../../Redux/CareSeekerAuth";

function ChildCareProviderExperience({
  formData,
  updateFormData,
  handleNext,
  currentStep = 3,
  totalSteps = 5,
}) {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-4 lg:p-8 rounded-2xl shadow-lg border border-gray-100 font-sfpro">
      <div className="flex items-center mb-6">
        <button
          onClick={() => window.history.back()}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          ←
        </button>
        <h3 className="text-base lg:text-lg text-gray-700 flex-1">
          Care provider Experience
        </h3>
        <span className="text-base lg:text-lg text-[#0093d1] font-bold">
          Step {currentStep}
        </span>{" "}
        <span className="ml-2 text-base lg:text-lg text-gray-500">
          {" "}
          of {totalSteps}
        </span>
      </div>
      <div className="mb-6">
        <h4 className="text-base font-medium text-gray-800 mb-2">Details</h4>
        <p className="text-sm text-gray-500 mb-6">
          Kindly select options to help us understand your preferences
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-sm text-gray-700 mb-4">
            Communication & Language{" "}
            <span className="font-normal">Select care giver preference.</span>{" "}
            <span className="text-red-600">*</span>
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="relative">
              <button
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 mb-4 text-left"
                onClick={() =>
                  updateFormData(
                    "showLanguageDropdown",
                    !formData.showLanguageDropdown
                  )
                }
              >
                {formData.selectedLanguage || "Select Language"}
              </button>
              {formData.showLanguageDropdown && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                  {[
                    "Fluent in English",
                    "Fluent in French",
                    "Fluent in Spanish",
                    "Fluent in Yoruba",
                    "Fluent in Igbo",
                    "Fluent in Idoma",
                    "Fluent in Edo",
                  ].map((language) => (
                    <label key={language} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 bg-white text-gray-900"
                        checked={formData.communicationLanguage?.includes(
                          language
                        )}
                        onChange={(e) => {
                          let arr = Array.isArray(
                            formData.communicationLanguage
                          )
                            ? formData.communicationLanguage
                            : [];
                          if (e.target.checked) {
                            updateFormData("communicationLanguage", [
                              ...arr,
                              language,
                            ]);
                          } else {
                            updateFormData(
                              "communicationLanguage",
                              arr.filter((l) => l !== language)
                            );
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">{language}</span>
                    </label>
                  ))}
                  <button
                    className="mt-4 w-full bg-[#0093d1] text-white text-sm font-medium py-2 rounded-md hover:bg-[#007bb0] transition"
                    onClick={() =>
                      updateFormData("showLanguageDropdown", false)
                    }
                  >
                    Done
                  </button>
                </div>
              )}
              {!formData.showLanguageDropdown &&
                formData.communicationLanguage?.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                    {formData.communicationLanguage.map((language) => (
                      <li key={language}>{language}</li>
                    ))}
                  </ul>
                )}
              {errors.communicationLanguage && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.communicationLanguage}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-700 mb-4">
            Special Preferences{" "}
            <span className="font-normal">
              Select care giver preference (optional).
            </span>
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="relative">
              <button
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 mb-4 text-left"
                onClick={() =>
                  updateFormData(
                    "showPreferenceDropdown",
                    !formData.showPreferenceDropdown
                  )
                }
              >
                {formData.selectedPreference || "Select Preference"}
              </button>
              {formData.showPreferenceDropdown && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                  {[
                    "Experience with Autism",
                    "Experience with ADHD",
                    "Experience with Cerebral Palsy",
                    "Experience with twins or multiples",
                    "Experience with special needs",
                    "Experience with speech delay",
                  ].map((preference) => (
                    <label key={preference} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 bg-white text-gray-900"
                        checked={formData.specialPreferences?.includes(
                          preference
                        )}
                        onChange={(e) => {
                          let arr = Array.isArray(formData.specialPreferences)
                            ? formData.specialPreferences
                            : [];
                          if (e.target.checked) {
                            updateFormData("specialPreferences", [
                              ...arr,
                              preference,
                            ]);
                          } else {
                            updateFormData(
                              "specialPreferences",
                              arr.filter((p) => p !== preference)
                            );
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">
                        {preference}
                      </span>
                    </label>
                  ))}
                  <button
                    className="mt-4 w-full bg-[#0093d1] text-white text-sm font-medium py-2 rounded-md hover:bg-[#007bb0] transition"
                    onClick={() =>
                      updateFormData("showPreferenceDropdown", false)
                    }
                  >
                    Done
                  </button>
                </div>
              )}
              {!formData.showPreferenceDropdown &&
                formData.specialPreferences?.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                    {formData.specialPreferences.map((preference) => (
                      <li key={preference}>{preference}</li>
                    ))}
                  </ul>
                )}
              {/* specialPreferences is optional - no error shown */}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-700 mb-4">
            Preferred Option{" "}
            <span className="font-normal">Select care giver preference.</span>{" "}
            <span className="text-red-600">*</span>
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="relative">
              <button
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 mb-4 text-left"
                onClick={() =>
                  updateFormData(
                    "showOptionDropdown",
                    !formData.showOptionDropdown
                  )
                }
              >
                {formData.selectedOption || "Select Option"}
              </button>
              {formData.showOptionDropdown && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                  {["Live-In", "Live-Out", "Hybrid"].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 bg-white text-gray-900"
                        checked={formData.preferredOption?.includes(option)}
                        onChange={(e) => {
                          let arr = Array.isArray(formData.preferredOption)
                            ? formData.preferredOption
                            : [];
                          if (e.target.checked) {
                            updateFormData("preferredOption", [...arr, option]);
                          } else {
                            updateFormData(
                              "preferredOption",
                              arr.filter((o) => o !== option)
                            );
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                  <button
                    className="mt-4 w-full bg-[#0093d1] text-white text-sm font-medium py-2 rounded-md hover:bg-[#007bb0] transition"
                    onClick={() => updateFormData("showOptionDropdown", false)}
                  >
                    Done
                  </button>
                </div>
              )}
              {!formData.showOptionDropdown &&
                formData.preferredOption?.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                    {formData.preferredOption.map((option) => (
                      <li key={option}>{option}</li>
                    ))}
                  </ul>
                )}
              {errors.preferredOption && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.preferredOption}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-700 mb-4">
            Want your care provider to offer more than one type of care?{" "}
            <span className="font-normal">
              Select an extra category below (optional).
            </span>
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="relative">
              <button
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 mb-4 text-left"
                onClick={() =>
                  updateFormData(
                    "showExtraCategoryDropdown",
                    !formData.showExtraCategoryDropdown
                  )
                }
              >
                {formData.selectedExtraCategory || "Select category"}
              </button>
              {formData.showExtraCategoryDropdown && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                  {["Elderly Care", "Tutoring", "Housekeeping"].map(
                    (category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2 bg-white text-gray-900"
                          checked={formData.extraCareCategory?.includes(
                            category
                          )}
                          onChange={(e) => {
                            let arr = Array.isArray(formData.extraCareCategory)
                              ? formData.extraCareCategory
                              : [];
                            if (e.target.checked) {
                              updateFormData("extraCareCategory", [
                                ...arr,
                                category,
                              ]);
                            } else {
                              updateFormData(
                                "extraCareCategory",
                                arr.filter((c) => c !== category)
                              );
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700">
                          {category}
                        </span>
                      </label>
                    )
                  )}
                  <button
                    className="mt-4 w-full bg-[#0093d1] text-white text-sm font-medium py-2 rounded-md hover:bg-[#007bb0] transition"
                    onClick={() =>
                      updateFormData("showExtraCategoryDropdown", false)
                    }
                  >
                    Done
                  </button>
                </div>
              )}
              {!formData.showExtraCategoryDropdown &&
                Array.isArray(formData.extraCareCategory) &&
                formData.extraCareCategory.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                    {formData.extraCareCategory.map((category) => (
                      <li key={category}>{category}</li>
                    ))}
                  </ul>
                )}
              {/* extraCareCategory is optional - no error shown */}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          const newErrors = {};
          if (
            !formData.communicationLanguage ||
            formData.communicationLanguage.length === 0
          )
            newErrors.communicationLanguage =
              "Please select at least one communication language.";
          if (
            !formData.preferredOption ||
            formData.preferredOption.length === 0
          )
            newErrors.preferredOption = "Please select a preferred option.";

          setErrors(newErrors);
          if (Object.keys(newErrors).length > 0) return;

          // Save experience data to Redux before moving next
          dispatch(
            saveStep({
              stepName: "experience",
              data: {
                communicationLanguage: formData.communicationLanguage || [],
                specialPreferences: formData.specialPreferences || [],
                preferredOption: formData.preferredOption || [],
                extraCareCategory: formData.extraCareCategory || [],
              },
            })
          );
          handleNext();
        }}
        className="w-full bg-[#0093d1] text-white text-base lg:text-lg font-medium py-3 rounded-md hover:bg-[#007bb0] transition mt-8"
      >
        Next
      </button>
    </div>
  );
}

export default ChildCareProviderExperience;
