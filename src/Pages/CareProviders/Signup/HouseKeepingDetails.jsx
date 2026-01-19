/* eslint-disable no-unused-vars */
import { useDispatch } from "react-redux";
import { useState } from "react";
import { saveStep } from "../../../Redux/CareProviderAuth";
import { reverseGeocode } from "../../../Redux/Location";
import mappopup from "../../../../public/mappopup.png";
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function HouseKeepingDetails({
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
            data.results.find(
              (r) =>
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
            Housekeeping details
          </h3>
        </div>
        {/* Name fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:p-6 mb-4 lg:mb-6">
          <div>
            <TextField
              name="firstName"
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
              name="lastName"
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

        <div className="mb-4 lg:mb-6">
          <TextField
            label="Address"
            value={formData.address || ""}
            onChange={(val) => updateFormData("address", val)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:p-6">
          <SelectField
            name="country"
            required
            label="Country"
            value={formData.country}
            onChange={(val) => updateFormData("country", val)}
            options={countryOptions}
          />
          <SelectField
            name="language"
            required
            label="Preferred Language"
            value={formData.language}
            onChange={(val) => updateFormData("language", val)}
            options={languageOptions}
          />
          <SelectField
            name="state"
            required
            label="State"
            value={formData.state}
            onChange={(val) => updateFormData("state", val)}
            options={stateOptions}
          />
          <TextField
            name="city"
            required
            label="City"
            value={formData.city}
            onChange={(val) => updateFormData("city", val)}
          />
          <TextField
            name="nationality"
            required
            label="Nationality"
            value={formData.nationality}
            onChange={(val) => updateFormData("nationality", val)}
          />
          <TextField
            name="zipCode"
            required
            label="Zip Code"
            value={formData.zipCode}
            onChange={(val) => updateFormData("zipCode", val)}
          />
          <SelectField
            name="experienceLevel"
            required
            label="Years of Experience"
            value={formData.experienceLevel}
            onChange={(val) => updateFormData("experienceLevel", val)}
            options={["1-3 Years", "4-8 Years", "9-12 Years"]}
          />
          <SelectField
            name="nativeLanguage"
            required
            label="Native Language"
            value={formData.nativeLanguage}
            onChange={(val) => updateFormData("nativeLanguage", val)}
            options={languageOptions}
          />
          {/* <SelectField
            name="otherLanguage"
            required
            label="Other Language"
            value={formData.otherLanguage}
            onChange={(val) => updateFormData("otherLanguage", val)}
            options={[]}
          /> */}
          <CheckboxGroup
            name="otherServices"
            label="Other Services you can Offer"
            options={["Child Care", "Elderly Care", "Tutoring"]}
            values={formData.otherServices || []}
            onChange={(val) => updateFormData("otherServices", val)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              aria-required="true"
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
              placeholder="Input rate"
              value={formData.hourlyRate}
              onChange={(e) => updateFormData("hourlyRate", e.target.value)}
            />
            {errors.hourlyRate ? (
              <p className="text-sm text-red-600 mt-1">{errors.hourlyRate}</p>
            ) : (
              <p className="text-sm text-green-600 mt-1">
                Average hourly rate is between ₦1000 - ₦3000
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tell Us about yourself <span className="text-red-600">*</span>
          </label>
          <textarea
            required
            aria-required="true"
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
            Title <span className="text-red-600">*</span>
          </label>
          <input
            required
            aria-required="true"
            className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
            placeholder="Give your application a title that sums you up as a child care provider"
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
            potential caretakers
          </label>
        </div>

        <CheckboxGroup
          name="housekeepingPreference"
          label="Choose your house keeping preference"
          options={[
            "Interested in live-in jobs",
            "Interested in live-out jobs",
          ]}
          values={formData.housekeepingPreference || []}
          onChange={(val) => updateFormData("housekeepingPreference", val)}
        />

        <button
          onClick={() => {
            const newErrors = {};
            const requiredFields = [
              "firstName",
              "lastName",
              "country",
              "language",
              "state",
              "city",
              "nationality",
              "zipCode",
              "experienceLevel",
              "nativeLanguage",
              // "otherLanguage", // optional
              "hourlyRate",
              "aboutYou",
              "title",
            ];

            requiredFields.forEach((f) => {
              const val = (formData[f] || "").toString().trim();
              if (!val) newErrors[f] = `${humanizeFieldName(f)} is required.`;
            });

            // checkbox groups
            if (
              !formData.housekeepingPreference ||
              (Array.isArray(formData.housekeepingPreference) &&
                formData.housekeepingPreference.length === 0)
            ) {
              newErrors.housekeepingPreference =
                "Please choose at least one housekeeping preference.";
            }
            if (
              !formData.otherServices ||
              (Array.isArray(formData.otherServices) &&
                formData.otherServices.length === 0)
            ) {
              newErrors.otherServices =
                "Please select at least one service you can offer.";
            }

            // hourlyRate numeric check
            if (formData.hourlyRate && isNaN(Number(formData.hourlyRate))) {
              newErrors.hourlyRate = "Hourly rate must be a number.";
            }

            setErrors(newErrors);
            if (Object.keys(newErrors).length > 0) return;

            const trimmedFirst = (formData.firstName || "").trim();
            const trimmedLast = (formData.lastName || "").trim();

            const hkPayload = {
              user_data: {
                first_name: trimmedFirst,
                last_name: trimmedLast,
                full_name: (trimmedFirst + " " + trimmedLast).trim(),
              },
              profile_data: {
                service_category: "housekeeping",
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
                skills: formData.otherServices || [],
                category_specific_details: {
                  housekeeping_preference: Array.isArray(
                    formData.housekeepingPreference
                  )
                    ? formData.housekeepingPreference[0]
                    : formData.housekeepingPreference || null,
                  services_offered: formData.otherServices || [],
                },
                about_me: formData.aboutYou || null,
                profile_title: formData.title || null,
              },
            };

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
            const flatProfile = { ...hkPayload.profile_data };
            dispatch(
              saveStep({ stepName: "housekeeping_profile", data: flatProfile })
            );
            handleNext();
          }}
          className="w-full bg-[#0093d1] text-white text-base lg:text-lg font-medium py-3 rounded-md hover:bg-[#007bb0] transition mt-8"
        >
          Save
        </button>
      </div>
    </>
  );
}

// Reusable components
const TextField = ({ name, label, value, onChange, required, type }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    {type === "date" ? (
      <input
        type="date"
        name={name}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => {
          try {
            if (e.target && e.target.showPicker) e.target.showPicker();
          } catch {
            /* ignore */
          }
        }}
        required={required}
        aria-required={required}
        className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
      />
    ) : (
      <input
        type={type || "text"}
        name={name}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-required={required}
        className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
      />
    )}
  </div>
);

const SelectField = ({ name, label, value, onChange, options, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <select
      name={name}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      aria-required={required}
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

const CheckboxGroup = ({ name, label, options, values, onChange }) => {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {options.map((option, idx) => (
          <label key={idx} className="flex items-center">
            <input
              type="checkbox"
              name={name}
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

// helper to produce human readable labels for validation messages
function humanizeFieldName(key) {
  const map = {
    firstName: "First name",
    lastName: "Last name",
    zipCode: "Zip code",
    experienceLevel: "Years of experience",
    hourlyRate: "Hourly rate",
    aboutYou: "About you",
    nativeLanguage: "Native language",
    otherLanguage: "Other language",
  };
  return (
    map[key] ||
    key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
  );
}

export default HouseKeepingDetails;
