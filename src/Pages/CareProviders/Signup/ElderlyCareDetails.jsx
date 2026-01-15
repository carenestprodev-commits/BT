/* eslint-disable no-unused-vars */
import { useDispatch } from "react-redux";
import { useState } from "react";
import { saveStep } from "../../../Redux/CareProviderAuth";
import { reverseGeocode } from "../../../Redux/Location";
import mappopup from "../../../../public/mappopup.png";
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo (Congo-Brazzaville)",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czechia",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Korea",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Korea",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ]);

  const [stateOptions, setStateOptions] = useState([
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
    "Federal Capital Territory (Abuja)",
  ]);

  const [languageOptions, setLanguageOptions] = useState([
    "Afar",
    "Abkhaz",
    "Avestan",
    "Afrikaans",
    "Akan",
    "Aragonese",
    "Arabic",
    "Assamese",
    "Avaric",
    "Aymara",
    "Azerbaijani",
    "Bashkir",
    "Belarusian",
    "Bulgarian",
    "Bihari",
    "Bislama",
    "Bambara",
    "Bengali",
    "Tibetan",
    "Breton",
    "Bosnian",
    "Catalan",
    "Chechen",
    "Chamorro",
    "Corsican",
    "Cree",
    "Czech",
    "Church Slavic",
    "Chuvash",
    "Welsh",
    "Danish",
    "German",
    "Divehi",
    "Dzongkha",
    "Ewe",
    "Greek",
    "English",
    "Esperanto",
    "Spanish",
    "Estonian",
    "Basque",
    "Persian",
    "Fulah",
    "Finnish",
    "Fijian",
    "Faroese",
    "French",
    "Western Frisian",
    "Irish",
    "Scottish Gaelic",
    "Galician",
    "Guarani",
    "Gujarati",
    "Manx",
    "Hausa",
    "Hebrew",
    "Hindi",
    "Hiri Motu",
    "Croatian",
    "Hungarian",
    "Armenian",
    "Herero",
    "Indonesian",
    "Interlingue",
    "Igbo",
    "Sichuan Yi",
    "Inupiaq",
    "Ido",
    "Icelandic",
    "Italian",
    "Inuktitut",
    "Japanese",
    "Javanese",
    "Georgian",
    "Kongo",
    "Kikuyu",
    "Kuanyama",
    "Kazakh",
    "Kalaallisut",
    "Khmer",
    "Kannada",
    "Korean",
    "Kanuri",
    "Kashmiri",
    "Kurdish",
    "Komi",
    "Cornish",
    "Kirghiz",
    "Latin",
    "Luxembourgish",
    "Ganda",
    "Limburgish",
    "Lingala",
    "Lao",
    "Lithuanian",
    "Luba-Katanga",
    "Latvian",
    "Malagasy",
    "Marshallese",
    "Maori",
    "Macedonian",
    "Malayalam",
    "Mongolian",
    "Marathi",
    "Malay",
    "Maltese",
    "Burmese",
    "Nauru",
    "Norwegian Bokmål",
    "North Ndebele",
    "Nepali",
    "Ndonga",
    "Dutch",
    "Norwegian Nynorsk",
    "Norwegian",
    "South Ndebele",
    "Navajo",
    "Chichewa",
    "Occitan",
    "Ojibwa",
    "Oromo",
    "Oriya",
    "Ossetian",
    "Panjabi",
    "Pali",
    "Polish",
    "Pashto",
    "Portuguese",
    "Quechua",
    "Romansh",
    "Rundi",
    "Romanian",
    "Russian",
    "Kinyarwanda",
    "Sanskrit",
    "Sardinian",
    "Sindhi",
    "Northern Sami",
    "Sango",
    "Sinhala",
    "Slovak",
    "Slovenian",
    "Samoan",
    "Shona",
    "Somali",
    "Albanian",
    "Serbian",
    "Swati",
    "Sotho",
    "Sundanese",
    "Swedish",
    "Swahili",
    "Tamil",
    "Telugu",
    "Tajik",
    "Thai",
    "Tigrinya",
    "Turkmen",
    "Tagalog",
    "Tswana",
    "Tonga",
    "Turkish",
    "Tsonga",
    "Tatar",
    "Twi",
    "Tahitian",
    "Uighur",
    "Ukrainian",
    "Urdu",
    "Uzbek",
    "Venda",
    "Vietnamese",
    "Volapük",
    "Walloon",
    "Wolof",
    "Xhosa",
    "Yiddish",
    "Yoruba",
    "Zhuang",
    "Chinese",
    "Zulu",
  ]);

  //Define handleGetLocation on its own first
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
          );

          const data = await response.json();

          if (!data.results || !data.results.length) {
            throw new Error("No address results found");
          }

          // Always take the MOST SPECIFIC result (street_address / premise)
          const result =
              data.results.find((r) =>
                  r.types.includes("street_address") ||
                  r.types.includes("premise")
              ) || data.results[0];

          const components = result.address_components;

          const get = (type) =>
              components.find((c) => c.types.includes(type))?.long_name || "";

          // ✅ Extract fields
          const address = result.formatted_address || "";
          const country = get("country");
          const state = get("administrative_area_level_1"); // Lagos
          const city =
              get("locality") || // Lagos
              get("sublocality") ||
              get("administrative_area_level_2"); // Shomolu fallback
          const zipCode = get("postal_code");

          // ✅ Update form
          updateFormData("address", address);
          updateFormData("country", country);
          updateFormData("nationality", country);
          updateFormData("state", state);
          updateFormData("city", city);
          updateFormData("zipCode", zipCode);

          setShowLocationPopup(false);
        } catch (error) {
          console.error("Error fetching location:", error);
          alert("Could not retrieve address details. Please enter manually.");
          setShowLocationPopup(false);
        }
      },
      (error) => {
        console.error("Geo Error:", error);
        alert("Please enable location services in your browser settings.");
        setShowLocationPopup(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // Production settings for better accuracy
    );
  };

  return (
    <>
      {showLocationPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-3xl relative flex flex-col">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg lg:text-xl font-bold z-10"
              onClick={() => setShowLocationPopup(false)}
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={mappopup}
              alt="Map Popup"
              className="w-full h-40 object-cover rounded-t-2xl"
            />
            <div className="p-4 lg:p-8 flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                Enable your Location
              </h2>
              <p className="text-sm text-gray-500 mb-4 lg:mb-6 text-center">
                This app requires your location to be turned on your device and
                within this app. Please enable it in your phone settings.
              </p>
              <div className="w-full flex flex-col gap-4">
                <button
                  className="w-full py-3 rounded-md bg-[#0093d1] text-white text-base lg:text-lg font-medium hover:bg-[#007bb0] transition"
                  onClick={handleGetLocation}
                >
                  Allow only while using this App
                </button>
                <button className="w-full py-3 rounded-md border border-[#0093d1] text-[#0093d1] text-base lg:text-lg font-medium bg-white hover:bg-[#f0fbf9] transition">
                  Don&apos;t allow this App
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto bg-white p-4 lg:p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-right justify-end w-full">
          <span className="text-base lg:text-lg text-[#0093d1] font-bold">
            Step 3
          </span>{" "}
          <span className="ml-2 text-base lg:text-lg text-gray-500"> of 4</span>
        </div>
        <div className="flex items-center mb-4 lg:mb-6">
          <button
            onClick={handleBack}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            ←
          </button>
          <h3 className="text-base lg:text-lg text-gray-700 flex-1">
            Elderly care details
          </h3>
        </div>
        {/* Name fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:p-6 mb-4 lg:mb-6">
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

        <p className="text-sm text-gray-500 mb-4 lg:mb-6">
          Kindly select options to help us understand your preferences
        </p>

        <div className="flex items-center mb-4 lg:mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:p-6">
          <SelectField
            required
            label="Country"
            value={formData.country}
            onChange={(val) => updateFormData("country", val)}
            options={countryOptions}
          />
          {errors.country && (
            <p className="text-sm text-red-600 mt-1">{errors.country}</p>
          )}
          <SelectField
            required
            label="Preferred Language"
            value={formData.language}
            onChange={(val) => updateFormData("language", val)}
            options={languageOptions}
          />
          {errors.language && (
            <p className="text-sm text-red-600 mt-1">{errors.language}</p>
          )}
          <SelectField
            required
            label="State"
            value={formData.state}
            onChange={(val) => updateFormData("state", val)}
            options={stateOptions}
          />
          {errors.state && (
            <p className="text-sm text-red-600 mt-1">{errors.state}</p>
          )}
          <TextField
            required
            label="City"
            value={formData.city}
            onChange={(val) => updateFormData("city", val)}
          />
          {errors.city && (
            <p className="text-sm text-red-600 mt-1">{errors.city}</p>
          )}
          <TextField
            required
            label="Nationality"
            value={formData.nationality}
            onChange={(val) => updateFormData("nationality", val)}
          />
          {errors.nationality && (
            <p className="text-sm text-red-600 mt-1">{errors.nationality}</p>
          )}
          <TextField
            required
            label="Zip Code"
            value={formData.zipCode}
            onChange={(val) => updateFormData("zipCode", val)}
          />
          {errors.zipCode && (
            <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>
          )}
          <SelectField
            required
            label="Years of Experience"
            value={formData.experienceLevel}
            onChange={(val) => updateFormData("experienceLevel", val)}
            options={["1-3 Years", "4-8 Years", "9-12 Years"]}
          />
          {errors.experienceLevel && (
            <p className="text-sm text-red-600 mt-1">
              {errors.experienceLevel}
            </p>
          )}
          <SelectField
            label="Native Language"
            required
            value={formData.nativeLanguage}
            onChange={(val) => updateFormData("nativeLanguage", val)}
            options={languageOptions}
          />
          {errors.nativeLanguage && (
            <p className="text-sm text-red-600 mt-1">{errors.nativeLanguage}</p>
          )}
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
          {errors.otherServices && (
            <p className="text-sm text-red-600 mt-1">{errors.otherServices}</p>
          )}
        </div>

        <CheckboxGroup
          required
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
        {errors.careQualities && (
          <p className="text-sm text-red-600 mt-1">{errors.careQualities}</p>
        )}

        <CheckboxGroup
          required
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
        {errors.skills && (
          <p className="text-sm text-red-600 mt-1">{errors.skills}</p>
        )}

        {/* Additional multi-select dropdown-like groups */}
        <CheckboxGroup
          required
          label="Personality and Interpersonal Skill"
          options={["Friendly", "Patient", "Energetic", "Calm", "Organized"]}
          values={formData.personalitySkills || []}
          onChange={(val) => updateFormData("personalitySkills", val)}
        />
        {errors.personalitySkills && (
          <p className="text-sm text-red-600 mt-1">
            {errors.personalitySkills}
          </p>
        )}

        <CheckboxGroup
          required
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
        {errors.communicationLanguages && (
          <p className="text-sm text-red-600 mt-1">
            {errors.communicationLanguages}
          </p>
        )}

        <CheckboxGroup
          required
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
        {errors.specialPreferences && (
          <p className="text-sm text-red-600 mt-1">
            {errors.specialPreferences}
          </p>
        )}

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
            Average hourly rate is between ₦1000 - ₦3000
          </p>
          {errors.hourlyRate && (
            <p className="text-sm text-red-600 mt-1">{errors.hourlyRate}</p>
          )}
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
          {errors.aboutYou && (
            <p className="text-sm text-red-600 mt-1">{errors.aboutYou}</p>
          )}
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
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title}</p>
          )}
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
          className="w-full bg-[#0093d1] text-white text-base lg:text-lg font-medium py-3 rounded-md hover:bg-[#007bb0] transition mt-8"
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

const CheckboxGroup = ({
  label,
  options,
  values,
  onChange,
  required = false,
}) => {
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
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
