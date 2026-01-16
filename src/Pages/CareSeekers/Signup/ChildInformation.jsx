/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { saveStep } from "../../../Redux/CareSeekerAuth";
import { reverseGeocode } from "../../../Redux/Location";
import mappopup from "../../../../public/mappopup.png";
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function ChildInformation({
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
  // Parse the number of children from the selection
  const getChildCount = () => {
    const childCount = formData.numberOfChildren || formData.childCount || "";
    if (childCount.includes("1 child")) return 1;
    if (childCount.includes("2 children")) return 2;
    if (childCount.includes("3 children")) return 3;
    if (childCount.includes("4")) return 4;
    return 0;
  };

  const childCount = getChildCount();

  // Initialize children details array when count changes
  useEffect(() => {
    const currentDetails = formData.childrenDetails || [];
    const newDetails = [];

    for (let i = 0; i < childCount; i++) {
      newDetails.push(currentDetails[i] || { age: "", gender: "" });
    }

    if (newDetails.length !== currentDetails.length) {
      updateFormData("childrenDetails", newDetails);
    }
  }, [childCount, formData.childrenDetails, updateFormData]);

  // Update child detail
  const updateChildDetail = (index, field, value) => {
    const currentDetails = formData.childrenDetails || [];
    const newDetails = [...currentDetails];
    if (!newDetails[index]) newDetails[index] = {};
    newDetails[index][field] = value;
    updateFormData("childrenDetails", newDetails);
  };

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

  // Check if form is complete
  const isFormComplete = () => {
    const requiredFields = [
      "preferredLanguage",
      "country",
      "state",
      "city",
      "zipCode",
      "nationality",
      "childcareType",
      "numberOfChildren",
    ];

    const basicFieldsComplete = requiredFields.every(
      (field) => formData[field] || formData.childCount // fallback for numberOfChildren
    );

    const childrenDetailsComplete =
      (formData.childrenDetails || []).length === childCount &&
      (formData.childrenDetails || []).every(
        (child) => child.age && child.gender
      );

    return basicFieldsComplete && childrenDetailsComplete;
  };
  return (
    <>
      {showLocationPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 font-sfpro p-4">
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
              className="w-full h-32 lg:h-40 object-cover rounded-t-2xl"
            />

            {/* Content */}
            <div className="p-6 lg:p-8 flex flex-col items-center">
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-2 text-center">
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
                  className="w-full py-3 rounded-md border border-[#0093d1] text-[#0093d1] text-base lg:text-lg font-medium bg-white hover:bg-[#f0fbf9] transition"
                  onClick={() => setShowLocationPopup(false)}
                >
                  Don&apos;t allow this App
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto bg-white p-4 lg:p-8 rounded-2xl shadow-lg border border-gray-100 font-sfpro">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            ←
          </button>
          <h3 className="text-base lg:text-lg text-gray-700 flex-1">Details</h3>
          <span className="text-base lg:text-lg text-[#0093d1] font-bold">
            Step {currentStep}
          </span>{" "}
          <span className="ml-2 text-base lg:text-lg text-gray-500">
            {" "}
            of {totalSteps}
          </span>
        </div>
        {/* First & Last name fields */}
        <div className="mb-6">
          <h4 className="text-base font-medium text-gray-800 mb-2">Details</h4>
          <p className="text-sm text-gray-500 mb-6">
            Kindly select options to help us understand your preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              placeholder="First name"
              required
              aria-required="true"
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
              value={formData.firstName || ""}
              onChange={(e) => updateFormData("firstName", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Last name"
              required
              aria-required="true"
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
              value={formData.lastName || ""}
              onChange={(e) => updateFormData("lastName", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center mb-4">
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
                Country
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
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
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                placeholder="Input city"
                required
                aria-required="true"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                value={formData.city}
                onChange={(e) => updateFormData("city", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code
              </label>
              <input
                type="text"
                placeholder="Input zip code"
                required
                aria-required="true"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                value={formData.zipCode}
                onChange={(e) => updateFormData("zipCode", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <input
                type="text"
                placeholder="Input nationality"
                required
                aria-required="true"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                value={formData.nationality}
                onChange={(e) => updateFormData("nationality", e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h4 className="text-base font-medium text-gray-800 mb-2">
              Child Information
            </h4>
            <p className="text-sm text-gray-500 mb-6">
              Kindly select options to help us understand your preferences
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Childcare type
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                  value={formData.childcareType}
                  required
                  aria-required="true"
                  onChange={(e) =>
                    updateFormData("childcareType", e.target.value)
                  }
                >
                  <option>Select option</option>
                  <option>Babysitter</option>
                  <option>Nanny</option>
                  {/* <option>Daycare</option> */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of child(ren) that needs care
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                  value={formData.numberOfChildren || formData.childCount || ""}
                  required
                  aria-required="true"
                  onChange={(e) => {
                    updateFormData("numberOfChildren", e.target.value);
                    updateFormData("childCount", e.target.value); // backward compatibility
                  }}
                >
                  <option value="">Select option</option>
                  <option value="1 child">1 child</option>
                  <option value="2 children">2 children</option>
                  <option value="3 children">3 children</option>
                  <option value="4+ children">4+ children</option>
                </select>
              </div>
            </div>

            {/* Dynamic Child Details */}
            {childCount > 0 && (
              <div className="space-y-6">
                {Array.from({ length: childCount }, (_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age of child {index + 1}
                      </label>
                      <input
                        type="date"
                        placeholder="DD-MM-YYYY"
                        required
                        aria-required="true"
                        className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                        value={formData.childrenDetails?.[index]?.age || ""}
                        onChange={(e) =>
                          updateChildDetail(index, "age", e.target.value)
                        }
                        onFocus={(e) => {
                          try {
                            // Some browsers expose showPicker() to programmatically open the date picker
                            e.target?.showPicker && e.target.showPicker();
                          } catch (err) {
                            void err;
                          }
                        }}
                        onClick={(e) => {
                          try {
                            e.target?.showPicker && e.target.showPicker();
                          } catch (err) {
                            void err;
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender of child {index + 1}
                      </label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                        value={formData.childrenDetails?.[index]?.gender || ""}
                        required
                        aria-required="true"
                        onChange={(e) =>
                          updateChildDetail(index, "gender", e.target.value)
                        }
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            // Save user's first and last name for payload
            dispatch(
              saveStep({
                stepName: "user_data",
                data: {
                  first_name: formData.firstName || "",
                  last_name: formData.lastName || "",
                },
              })
            );
            // Save location and child info to Redux before moving next
            dispatch(
              saveStep({
                stepName: "location",
                data: {
                  useCurrentLocation: formData.useCurrentLocation,
                  preferredLanguage: formData.preferredLanguage,
                  country: formData.country,
                  state: formData.state,
                  city: formData.city,
                  zipCode: formData.zipCode,
                  nationality: formData.nationality,
                },
              })
            );
            dispatch(
              saveStep({
                stepName: "childInfo",
                data: {
                  childcareType: formData.childcareType,
                  numberOfChildren:
                    formData.numberOfChildren || formData.childCount,
                  childrenDetails: formData.childrenDetails,
                },
              })
            );
            handleNext();
          }}
          disabled={!isFormComplete()}
          className={`w-full text-base lg:text-lg font-medium py-3 rounded-md transition mt-8 ${
            isFormComplete()
              ? "bg-[#0093d1] text-white hover:bg-[#007bb0]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </>
  );
}

export default ChildInformation;
