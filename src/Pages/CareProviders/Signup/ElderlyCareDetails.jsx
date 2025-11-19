import { useDispatch } from "react-redux";
import { useState } from "react";
import { saveStep } from "../../../Redux/CareProviderAuth";
import { reverseGeocode } from "../../../Redux/Location";

function ElderlyCareDetails({
  formData,
  updateFormData,
  handleNext,
  handleBack,
  showLocationPopup,
  setShowLocationPopup,
}) {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [countryOptions, setCountryOptions] = useState([
    "United States",
    "Canada",
    "United Kingdom",
  ]);
  const [stateOptions, setStateOptions] = useState([
    "California",
    "New York",
    "Texas",
  ]);
  const [languageOptions, setLanguageOptions] = useState([
    "English",
    "Spanish",
    "French",
    "Bengali",
  ]);
  return (
    <>
      {showLocationPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-full relative flex flex-col">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold z-10"
              onClick={() => setShowLocationPopup(false)}
              aria-label="Close"
            >
              ×
            </button>
            <img
              src="/mappopup.png"
              alt="Map Popup"
              className="w-full h-40 object-cover rounded-t-2xl"
            />
            <div className="p-8 flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                Enable your Location
              </h2>
              <p className="text-sm text-gray-500 mb-6 text-center">
                This app requires your location to be turned on your device and
                within this app. Please enable it in your phone settings.
              </p>
              <div className="w-full flex flex-col gap-4">
                <button
                  className="w-full py-3 rounded-md bg-[#0093d1] text-white text-lg font-medium hover:bg-[#007bb0] transition"
                  onClick={() => {
                    setShowLocationPopup(false);
                    dispatch(reverseGeocode())
                      .then((res) => {
                        if (res && res.payload) {
                          const d = res.payload;
                          if (d.country) {
                            updateFormData("country", d.country);
                            if (!countryOptions.includes(d.country))
                              setCountryOptions((prev) => [d.country, ...prev]);
                          }
                          if (d.state) {
                            updateFormData("state", d.state);
                            if (!stateOptions.includes(d.state))
                              setStateOptions((prev) => [d.state, ...prev]);
                          }
                          updateFormData("city", d.city || formData.city);
                          updateFormData(
                            "zipCode",
                            d.zip_code || d.postcode || formData.zipCode
                          );
                          updateFormData(
                            "nationality",
                            d.nationality || formData.nationality
                          );
                          if (
                            d.common_languages &&
                            d.common_languages.length > 0
                          ) {
                            const code = d.common_languages[0];
                            const map = {
                              en: "English",
                              es: "Spanish",
                              fr: "French",
                              bn: "Bengali",
                            };
                            const lang = map[code] || code;
                            // set both preferred language and native language
                            updateFormData("language", lang);
                            updateFormData("nativeLanguage", lang);
                            if (!languageOptions.includes(lang))
                              setLanguageOptions((prev) => [lang, ...prev]);
                          }
                        }
                      })
                      .catch(() => {});
                  }}
                >
                  Allow only while using this App
                </button>
                <button className="w-full py-3 rounded-md border border-[#0093d1] text-[#0093d1] text-lg font-medium bg-white hover:bg-[#f0fbf9] transition">
                  Don&apos;t allow this App
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-right justify-end w-full">
          <span className="text-lg text-[#0093d1] font-bold">Step 3</span>{" "}
          <span className="ml-2 text-lg text-gray-500"> of 4</span>
        </div>
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            ←
          </button>
          <h3 className="text-lg text-gray-700 flex-1">Elderly care details</h3>
        </div>
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <TextField
              required
              label="First Name"
              value={formData.firstName || ""}
              onChange={(val) => updateFormData("firstName", val)}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <TextField
              required
              label="Last Name"
              value={formData.lastName || ""}
              onChange={(val) => updateFormData("lastName", val)}
            />
            {errors.lastName && (
              <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Kindly select options to help us understand your preferences
        </p>

        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="useLocation"
            checked={formData.useCurrentLocation}
            onChange={(e) => {
              updateFormData("useCurrentLocation", e.target.checked);
              if (e.target.checked) setShowLocationPopup(true);
            }}
            className="mr-3"
          />
          <label htmlFor="useLocation" className="text-sm text-gray-700">
            Use my current Location instead
          </label>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <SelectField
            required
            label="Country"
            value={formData.country}
            onChange={(val) => updateFormData("country", val)}
            options={countryOptions}
          />
          <SelectField
            required
            label="Preferred Language"
            value={formData.language}
            onChange={(val) => updateFormData("language", val)}
            options={languageOptions}
          />
          <SelectField
            required
            label="State"
            value={formData.state}
            onChange={(val) => updateFormData("state", val)}
            options={stateOptions}
          />
          <TextField
            required
            label="City"
            value={formData.city}
            onChange={(val) => updateFormData("city", val)}
          />
          <TextField
            required
            label="Nationality"
            value={formData.nationality}
            onChange={(val) => updateFormData("nationality", val)}
          />
          <TextField
            required
            label="Zip Code"
            value={formData.zipCode}
            onChange={(val) => updateFormData("zipCode", val)}
          />
          <SelectField
            required
            label="Years of Experience"
            value={formData.experienceLevel}
            onChange={(val) => updateFormData("experienceLevel", val)}
            options={["1-3 Years", "4-8 Years", "9-12 Years"]}
          />
          <SelectField
            label="Native Language"
            value={formData.nativeLanguage}
            onChange={(val) => updateFormData("nativeLanguage", val)}
            options={languageOptions}
          />
          {/* <SelectField
            required
            label="Other Language"
            value={formData.otherLanguage}
            onChange={(val) => updateFormData("otherLanguage", val)}
            options={[]}
          /> */}
          <CheckboxGroup
            required
            label="Other Services you can Offer"
            options={["Child Care", "Elderly Care", "House keeping"]}
            values={formData.otherServices || []}
            onChange={(val) => updateFormData("otherServices", val)}
          />
        </div>

        <CheckboxGroup
          label="What qualities matter most to you in a care provider? Select the ones that best align."
          options={[
            "Hypertension",
            "Diabetes",
            "Clean-up help",
            "Healthy diet",
            "CPR trained",
            "Non-smoker",
            "Medication reminder",
            "Can drive",
            "Palliative care",
            "Willing to live-in",
            "Background checked",
            "Speaks Yoruba",
            "Speaks Igbo",
            "Speaks Hausa",
            "Special Needs experience",
          ]}
          values={formData.careQualities || []}
          onChange={(val) => updateFormData("careQualities", val)}
        />

        <CheckboxGroup
          label="Choose the skills you have"
          options={[
            "First Aid Certificate",
            "CPR Certificate",
            "Speech Therapist",
            "Special Needs Care Training",
            "Physical Therapist",
            "Registered Nurse",
            "Occupational Therapist",
            "Healthcare Assistance",
          ]}
          values={formData.skills || []}
          onChange={(val) => updateFormData("skills", val)}
        />

        {/* Additional multi-select dropdown-like groups */}
        <CheckboxGroup
          label="Personality and Interpersonal Skill"
          options={["Friendly", "Patient", "Energetic", "Calm", "Organized"]}
          values={formData.personalitySkills || []}
          onChange={(val) => updateFormData("personalitySkills", val)}
        />

        <CheckboxGroup
          label="Communication and Language"
          options={[
            "Fluent in English",
            "Fluent in French",
            "Fluent in Spanish",
            "Fluent in Yoruba",
            "Fluent in Igbo",
            "Fluent in Idoma",
            "Fluent in Edo",
          ]}
          values={formData.communicationLanguages || []}
          onChange={(val) => updateFormData("communicationLanguages", val)}
        />

        <CheckboxGroup
          label="Special Preference"
          options={[
            "Experience with Autism",
            "Experience with ADHD",
            "Experience with Cerebral Palsy",
            "Experience with twins or multiples",
            "Experience with special needs",
            "Experience with speech delay",
          ]}
          values={formData.specialPreferences || []}
          onChange={(val) => updateFormData("specialPreferences", val)}
        />

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hourly Rate
          </label>
          <input
            required
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
            placeholder="Input rate"
            value={formData.hourlyRate}
            onChange={(e) => updateFormData("hourlyRate", e.target.value)}
          />
          <p className="text-sm text-green-600 mt-1">
            Average hourly rate is ₦5,500
          </p>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tell Us about yourself
          </label>
          <textarea
            required
            className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
            rows={4}
            placeholder="Kindly highlight your skills and experience..."
            value={formData.aboutYou}
            onChange={(e) => updateFormData("aboutYou", e.target.value)}
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            required
            className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
            placeholder="Give your explanation a title..."
            value={formData.title}
            onChange={(e) => updateFormData("title", e.target.value)}
          />
        </div>

        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            id="autoSend"
            checked={formData.autoSend}
            onChange={(e) => updateFormData("autoSend", e.target.checked)}
            className="mr-3"
          />
          <label htmlFor="autoSend" className="text-sm text-gray-700">
            I would like to automatically send the above application to
            potential caregivers
          </label>
        </div>

        <button
          type="button"
          onClick={() => {
            console.debug &&
              console.debug("ElderlyCareDetails: Save clicked", { formData });
            const trimmedFirst = (formData.firstName || "").trim();
            const trimmedLast = (formData.lastName || "").trim();
            const newErrors = {};
            if (!trimmedFirst) newErrors.firstName = "First name is required.";
            if (!trimmedLast) newErrors.lastName = "Last name is required.";
            // enforce required fields
            const requiredChecks = [
              ["country", formData.country, "Country is required."],
              [
                "language",
                formData.language,
                "Preferred language is required.",
              ],
              ["state", formData.state, "State is required."],
              ["city", formData.city, "City is required."],
              ["nationality", formData.nationality, "Nationality is required."],
              ["zipCode", formData.zipCode, "Zip code is required."],
              [
                "experienceLevel",
                formData.experienceLevel,
                "Years of experience is required.",
              ],
              [
                "nativeLanguage",
                formData.nativeLanguage,
                "Native language is required.",
              ],
              ["hourlyRate", formData.hourlyRate, "Hourly rate is required."],
              ["aboutYou", formData.aboutYou, "About you is required."],
              ["title", formData.title, "Title is required."],
            ];
            requiredChecks.forEach(([key, val, msg]) => {
              if (!val || (typeof val === "string" && val.trim() === ""))
                newErrors[key] = msg;
            });
            // checkbox groups must have at least one selection
            const checkboxChecks = [
              [
                "otherServices",
                formData.otherServices,
                "Please select at least one service.",
              ],
              [
                "careQualities",
                formData.careQualities,
                "Please select at least one quality.",
              ],
              ["skills", formData.skills, "Please select at least one skill."],
              [
                "personalitySkills",
                formData.personalitySkills,
                "Please select at least one personality skill.",
              ],
              [
                "communicationLanguages",
                formData.communicationLanguages,
                "Please select at least one communication language.",
              ],
              [
                "specialPreferences",
                formData.specialPreferences,
                "Please select at least one special preference.",
              ],
            ];
            checkboxChecks.forEach(([key, val, msg]) => {
              if (!val || !Array.isArray(val) || val.length === 0)
                newErrors[key] = msg;
            });
            setErrors(newErrors);
            if (Object.keys(newErrors).length > 0) return;

            const elderPayload = {
              user_data: {
                first_name: trimmedFirst,
                last_name: trimmedLast,
                full_name: (trimmedFirst + " " + trimmedLast).trim(),
              },
              profile_data: {
                service_category: "elderlycare",
                country: formData.country || null,
                city: formData.city || null,
                state: formData.state || null,
                zip_code: formData.zipCode || null,
                nationality: formData.nationality || null,
                native_language:
                  formData.nativeLanguage || formData.language || null,
                experience_level: formData.experienceLevel || null,
                years_of_experience: formData.yearsOfExperience || null,
                hourly_rate: formData.hourlyRate
                  ? parseFloat(formData.hourlyRate)
                  : null,
                languages:
                  formData.communicationLanguages &&
                  formData.communicationLanguages.length > 0
                    ? formData.communicationLanguages
                    : formData.language
                    ? [formData.language]
                    : [],
                additional_services: formData.otherServices || [],
                skills: formData.skills || [],
                category_specific_details: {
                  personality_and_interpersonal_skills:
                    formData.personalitySkills || [],
                  special_preferences: formData.specialPreferences || [],
                  communication_language:
                    formData.communicationLanguages &&
                    formData.communicationLanguages.length > 0
                      ? formData.communicationLanguages[0]
                      : formData.language || null,
                  preferred_option: Array.isArray(
                    formData.housekeepingPreference
                  )
                    ? formData.housekeepingPreference[0]
                    : formData.preferredOption || null,
                },
                about_me: formData.aboutYou || null,
                profile_title: formData.title || null,
              },
            };

            // persist top-level user_data so the final payload builder picks up names
            dispatch(
              saveStep({
                stepName: "user_data",
                data: {
                  first_name: trimmedFirst,
                  last_name: trimmedLast,
                  full_name: (trimmedFirst + " " + trimmedLast).trim(),
                },
              })
            );
            // save flattened profile fields under 'elderly_profile'
            const flatProfile = { ...elderPayload.profile_data };
            dispatch(
              saveStep({ stepName: "elderly_profile", data: flatProfile })
            );
            console.debug &&
              console.debug(
                "ElderlyCareDetails: saved steps, calling handleNext",
                { handleNextType: typeof handleNext }
              );
            if (typeof handleNext === "function") {
              handleNext();
            } else {
              console.error(
                "ElderlyCareDetails: handleNext is not a function",
                handleNext
              );
            }
          }}
          className="w-full bg-[#0093d1] text-white text-lg font-medium py-3 rounded-md hover:bg-[#007bb0] transition mt-8"
        >
          Save
        </button>
      </div>
    </>
  );
}

// Reusable subcomponents
const TextField = ({
  label,
  value,
  onChange,
  required = false,
  type = "text",
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    {type === "date" ? (
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        onFocus={(e) => e.target.showPicker && e.target.showPicker()}
        className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
      />
    )}
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
    >
      <option value="">Select Option</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const CheckboxGroup = ({ label, options, values, onChange }) => {
  const handleCheck = (option) => {
    if (values.includes(option)) {
      onChange(values.filter((item) => item !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700 mb-4">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, idx) => (
          <label key={idx} className="flex items-center">
            <input
              type="checkbox"
              checked={values.includes(option)}
              onChange={() => handleCheck(option)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ElderlyCareDetails;
