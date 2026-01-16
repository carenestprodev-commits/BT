/* eslint-disable no-unused-vars */
// React not directly referenced in this file
import { useDispatch } from "react-redux";
import { useState } from "react";
import { reverseGeocode } from "../../../Redux/Location";
import { saveStep } from "../../../Redux/CareSeekerAuth";
import mappopup from "../../../../public/mappopup.png";
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function ElderlyInformation({
  formData,
  updateFormData,
  handleNext,
  handleBack,
  showLocationPopup,
  setShowLocationPopup,
  currentStep = 2,
  totalSteps = 5,
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

  // 1. Define handleGetLocation on its own first
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

          // Extract fields
          const address = result.formatted_address || "";
          const country = get("country");
          const state = get("administrative_area_level_1");
          const city =
            get("locality") ||
            get("sublocality") ||
            get("administrative_area_level_2");
          const zipCode = get("postal_code");

          // Update form
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
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <>
      {showLocationPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 font-sfpro">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] relative flex flex-col">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold z-10"
              onClick={() => setShowLocationPopup(false)}
              aria-label="Close"
            >
              ×
            </button>

            {/* Full-width Image */}
            <img
              src={mappopup}
              alt="Map Popup"
              className="w-full h-40 object-cover rounded-t-2xl"
            />

            {/* Content */}
            <div className="p-8 flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                Enable your Location
              </h2>
              <p className="text-sm text-gray-500 mb-6 text-center">
                This app requires your location are turned on your devices and
                on this app. You must enable them on your phone settings
              </p>

              {/* Buttons */}
              <div className="w-full flex flex-col gap-4">
                <button
                  className="w-full py-3 rounded-md bg-[#0093d1] text-white text-base lg:text-lg font-medium hover:bg-[#007bb0] transition"
                  onClick={handleGetLocation}
                >
                  Allow only while using this App
                </button>
                <button
                  className="w-full py-3 rounded-md border border-[#0093d1] text-[#0093d1] text-lg font-medium bg-white hover:bg-[#f0fbf9] transition"
                  onClick={() => setShowLocationPopup(false)}
                >
                  Don&apos;t allow this App
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto bg-white p-4 lg:p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            ←
          </button>
          <h3 className="text-base lg:text-lg text-gray-700 flex-1">
            Elderly care details
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

        {/* First & Last name fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              aria-required="true"
              placeholder="First name"
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
              value={formData.firstName || ""}
              onChange={(e) => updateFormData("firstName", e.target.value)}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              aria-required="true"
              placeholder="Last name"
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
              value={formData.lastName || ""}
              onChange={(e) => updateFormData("lastName", e.target.value)}
            />
            {errors.lastName && (
              <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              placeholder="Address"
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
              value={formData.address || ""}
              onChange={(e) => updateFormData("address", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-600">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: "#fff", color: "#222" }}
                value={formData.country}
                required
                aria-required="true"
                onChange={(e) => updateFormData("country", e.target.value)}
              >
                <option value="">Select country</option>
                {countryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-sm text-red-600 mt-1">{errors.country}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language <span className="text-red-600">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: "#fff", color: "#222" }}
                value={formData.preferredLanguage}
                required
                aria-required="true"
                onChange={(e) =>
                  updateFormData("preferredLanguage", e.target.value)
                }
              >
                <option value="">Select language</option>
                {languageOptions.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              {errors.preferredLanguage && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.preferredLanguage}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-600">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: "#fff", color: "#222" }}
                value={formData.state}
                required
                aria-required="true"
                onChange={(e) => updateFormData("state", e.target.value)}
              >
                <option value="">Select state</option>
                {stateOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-sm text-red-600 mt-1">{errors.state}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                aria-required="true"
                placeholder="Input city"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: "#fff", color: "#222" }}
                value={formData.city}
                onChange={(e) => updateFormData("city", e.target.value)}
              />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">{errors.city}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                aria-required="true"
                placeholder="Input nationality"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: "#fff", color: "#222" }}
                value={formData.nationality}
                onChange={(e) => updateFormData("nationality", e.target.value)}
              />
              {errors.nationality && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.nationality}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                aria-required="true"
                placeholder="Input zip code"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: "#fff", color: "#222" }}
                value={formData.zipCode}
                onChange={(e) => updateFormData("zipCode", e.target.value)}
              />
              {errors.zipCode && (
                <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Elderly care type <span className="text-red-600">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: "#fff", color: "#222" }}
                value={formData.elderlyCareType}
                required
                aria-required="true"
                onChange={(e) =>
                  updateFormData("elderlyCareType", e.target.value)
                }
              >
                <option value="">Select option</option>
                <option>Companionship</option>
                <option>Carer</option>
              </select>
              {errors.elderlyCareType && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.elderlyCareType}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship with elderly{" "}
                <span className="text-red-600">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: "#fff", color: "#222" }}
                value={formData.relationshipWithElderly}
                required
                aria-required="true"
                onChange={(e) =>
                  updateFormData("relationshipWithElderly", e.target.value)
                }
              >
                <option value="">Select option</option>
                <option>Child</option>
                <option>Grandchild</option>
                <option>Spouse</option>
                <option>Other</option>
              </select>
              {errors.relationshipWithElderly && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.relationshipWithElderly}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age of elderly <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                aria-required="true"
                placeholder="e.g. 65-75"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: "#fff", color: "#222" }}
                value={formData.ageOfElderly}
                onChange={(e) => updateFormData("ageOfElderly", e.target.value)}
              />
              {errors.ageOfElderly && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.ageOfElderly}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender of elderly <span className="text-red-600">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: "#fff", color: "#222" }}
                value={formData.genderOfElderly}
                required
                aria-required="true"
                onChange={(e) =>
                  updateFormData("genderOfElderly", e.target.value)
                }
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              {errors.genderOfElderly && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.genderOfElderly}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Health condition of elderly
              </label>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                {[
                  "Stroke",
                  "Cancer",
                  "Hypertension",
                  "Just old age symptoms",
                  "Dementia",
                  "Others",
                ].map((option) => (
                  <label
                    key={option}
                    className="flex items-center py-2 border-b last:border-b-0 border-gray-100"
                  >
                    <input
                      type="checkbox"
                      name="healthCondition"
                      required
                      aria-required="true"
                      className="mr-2 bg-white text-gray-900"
                      style={{ backgroundColor: "#fff", color: "#222" }}
                      checked={formData.healthCondition?.includes(option)}
                      onChange={(e) => {
                        let arr = Array.isArray(formData.healthCondition)
                          ? formData.healthCondition
                          : [];
                        if (e.target.checked) {
                          updateFormData("healthCondition", [...arr, option]);
                        } else {
                          updateFormData(
                            "healthCondition",
                            arr.filter((o) => o !== option)
                          );
                        }
                      }}
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {errors.healthCondition && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.healthCondition}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What form of assistance is needed
              </label>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                {["Mobility", "Feeding", "Bathing", "Company", "Others"].map(
                  (option) => (
                    <label
                      key={option}
                      className="flex items-center py-2 border-b last:border-b-0 border-gray-100"
                    >
                      <input
                        type="checkbox"
                        name="assistanceForm"
                        required
                        aria-required="true"
                        className="mr-2 bg-white text-gray-900"
                        style={{ backgroundColor: "#fff", color: "#222" }}
                        checked={formData.assistanceForm?.includes(option)}
                        onChange={(e) => {
                          let arr = Array.isArray(formData.assistanceForm)
                            ? formData.assistanceForm
                            : [];
                          if (e.target.checked) {
                            updateFormData("assistanceForm", [...arr, option]);
                          } else {
                            updateFormData(
                              "assistanceForm",
                              arr.filter((o) => o !== option)
                            );
                          }
                        }}
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  )
                )}
              </div>
              {errors.assistanceForm && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.assistanceForm}
                </p>
              )}
            </div>
          </div>

          {formData.assistanceForm?.includes("Others") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                If other (specify)
              </label>
              <input
                type="text"
                placeholder="Please specify"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                value={formData.assistanceFormOther || ""}
                onChange={(e) =>
                  updateFormData("assistanceFormOther", e.target.value)
                }
              />
              {errors.assistanceFormOther && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.assistanceFormOther}
                </p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            const newErrors = {};
            if (!formData.firstName)
              newErrors.firstName = "First name is required.";
            if (!formData.lastName)
              newErrors.lastName = "Last name is required.";
            if (!formData.country) newErrors.country = "Country is required.";
            if (!formData.preferredLanguage)
              newErrors.preferredLanguage = "Preferred language is required.";
            if (!formData.state) newErrors.state = "State is required.";
            if (!formData.city) newErrors.city = "City is required.";
            if (!formData.nationality)
              newErrors.nationality = "Nationality is required.";
            if (!formData.zipCode) newErrors.zipCode = "Zip code is required.";
            if (!formData.elderlyCareType)
              newErrors.elderlyCareType = "Please select elderly care type.";
            if (!formData.relationshipWithElderly)
              newErrors.relationshipWithElderly =
                "Please select your relationship.";
            if (!formData.ageOfElderly)
              newErrors.ageOfElderly = "Age of elderly is required.";
            if (!formData.genderOfElderly)
              newErrors.genderOfElderly = "Gender of elderly is required.";
            if (
              !formData.healthCondition ||
              formData.healthCondition.length === 0
            )
              newErrors.healthCondition =
                "Please specify at least one health condition.";
            if (
              !formData.assistanceForm ||
              formData.assistanceForm.length === 0
            )
              newErrors.assistanceForm =
                "Please specify required assistance form.";
            // If user selected 'Others', require the specification field
            if (
              formData.assistanceForm?.includes("Others") &&
              (!formData.assistanceFormOther ||
                String(formData.assistanceFormOther).trim() === "")
            ) {
              newErrors.assistanceFormOther =
                "Please specify other assistance.";
            }

            setErrors(newErrors);
            if (Object.keys(newErrors).length > 0) return;

            dispatch(
              saveStep({
                stepName: "user_data",
                data: {
                  first_name: formData.firstName || "",
                  last_name: formData.lastName || "",
                },
              })
            );
            handleNext();
          }}
          className="w-full bg-[#0093d1] text-white text-base lg:text-lg font-medium py-3 rounded-md hover:bg-[#007bb0] transition mt-8"
        >
          Next
        </button>
        {/* Display any group-level errors */}
        {errors.healthCondition && (
          <p className="text-sm text-red-600 mt-2">{errors.healthCondition}</p>
        )}
        {errors.assistanceForm && (
          <p className="text-sm text-red-600 mt-2">{errors.assistanceForm}</p>
        )}
      </div>
    </>
  );
}

export default ElderlyInformation;
