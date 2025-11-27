// React not directly referenced
import { useDispatch } from "react-redux";
import { useState } from "react";
import { reverseGeocode } from "../../../Redux/Location";
import { saveStep } from "../../../Redux/CareSeekerAuth";

function TutoringInformation({
  formData,
  updateFormData,
  handleNext,
  handleBack,
  showLocationPopup,
  setShowLocationPopup,
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
  const [errors, setErrors] = useState({});
  return (
    <>
      {/* Location Popup */}
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
              src="/mappopup.png"
              alt="Map Popup"
              className="w-full h-40 object-cover rounded-t-2xl"
            />
            {/* Content */}
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
                    // trigger location permission logic here
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
                            const lang =
                              map[code] || (code === "en" ? "English" : code);
                            updateFormData("preferredLanguage", lang);
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

      {/* Main Form Container */}
      <div className="w-full max-w-3xl mx-auto bg-white p-4 lg:p-8 rounded-2xl shadow-lg border border-gray-100">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            ←
          </button>
          <h3 className="text-base lg:text-lg text-gray-700 flex-1">
            Tutoring Information
          </h3>
          <span className="text-base lg:text-lg text-[#0093d1] font-bold">
            Step 2
          </span>
          <span className="ml-2 text-base lg:text-lg text-gray-500"> of 5</span>
        </div>

        <div className="mb-6">
          <h4 className="text-base font-medium text-gray-800 mb-2">Details</h4>
          <p className="text-sm text-gray-500 mb-6">
            Kindly provide details to help us match you with the right tutor.
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

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Use Current Location */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useLocation"
              checked={formData.useCurrentLocation}
              onChange={(e) =>
                updateFormData("useCurrentLocation", e.target.checked)
              }
              className="mr-3"
            />
            <label htmlFor="useLocation" className="text-sm text-gray-700">
              Use my current Location instead
            </label>
          </div>

          {/* Preferred Language & Country */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language <span className="text-red-600">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                value={formData.preferredLanguage || ""}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-600">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                value={formData.country || ""}
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
          </div>

          {/* State & Nationality */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-600">*</span>
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
              {errors.state && (
                <p className="text-sm text-red-600 mt-1">{errors.state}</p>
              )}
            </div>
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
                value={formData.nationality}
                onChange={(e) => updateFormData("nationality", e.target.value)}
              />
              {errors.nationality && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.nationality}
                </p>
              )}
            </div>
          </div>

          {/* Zip Code */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
                value={formData.zipCode}
                onChange={(e) => updateFormData("zipCode", e.target.value)}
              />
              {errors.zipCode && (
                <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>
              )}
            </div>
            {/* Preferred Location */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Location <span className="text-red-600">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                value={formData.preferredLocation || ""}
                required
                aria-required="true"
                onChange={(e) =>
                  updateFormData("preferredLocation", e.target.value)
                }
              >
                <option value="">Select preferred location</option>
                <option value="Home">Home</option>
                <option value="Online">Online</option>
                <option value="Tutor's Place">Tutor&apos;s Place</option>
                <option value="Any Location">Any Location</option>
              </select>
              {errors.preferredLocation && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.preferredLocation}
                </p>
              )}
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Tutoring Subjects & Learning Environment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What subject(s) need tutoring{" "}
                <span className="text-red-600">*</span>
              </label>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                {[
                  "English",
                  "Mathematics",
                  "Basic science",
                  "Phonetics",
                  "Others",
                ].map((subject) => (
                  <label
                    key={subject}
                    className="flex items-center py-2 border-b last:border-b-0 border-gray-100"
                  >
                    <input
                      type="checkbox"
                      name="tutoringSubject"
                      required
                      aria-required="true"
                      className="mr-2"
                      checked={formData.tutoringSubject?.includes(subject)}
                      onChange={(e) => {
                        let arr = formData.tutoringSubject || [];
                        updateFormData(
                          "tutoringSubject",
                          e.target.checked
                            ? [...arr, subject]
                            : arr.filter((s) => s !== subject)
                        );
                      }}
                    />
                    <span className="text-gray-700">{subject}</span>
                  </label>
                ))}
              </div>
              {errors.tutoringSubject && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.tutoringSubject}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is the learning environment needed{" "}
                <span className="text-red-600">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                value={formData.learningEnvironment || ""}
                required
                aria-required="true"
                onChange={(e) =>
                  updateFormData("learningEnvironment", e.target.value)
                }
              >
                <option value="">Select environment</option>
                <option value="Group lessons">Group lessons</option>
                <option value="Individual Tutoring">Individual Tutoring</option>
              </select>
              {errors.learningEnvironment && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.learningEnvironment}
                </p>
              )}
            </div>
          </div>

          {/* Learning Purpose & Student Age Range */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is the purpose of this learning{" "}
                <span className="text-red-600">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                value={formData.learningPurpose || ""}
                required
                aria-required="true"
                onChange={(e) =>
                  updateFormData("learningPurpose", e.target.value)
                }
              >
                <option value="">Select purpose</option>
                <option value="Exam preparation">Exam preparation</option>
                <option value="Homework help">Homework help</option>
                <option value="Special needs tutoring">
                  Special needs tutoring
                </option>
                <option value="Homeschooling (onsite)">
                  Homeschooling (onsite)
                </option>
                <option value="Online Tutoring">Online Tutoring</option>
              </select>
              {errors.learningPurpose && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.learningPurpose}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age range of student <span className="text-red-600">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                value={formData.studentAgeRange || ""}
                required
                aria-required="true"
                onChange={(e) =>
                  updateFormData("studentAgeRange", e.target.value)
                }
              >
                <option value="">Select age range</option>
                <option value="1 - 5 years">1 - 5 years</option>
                <option value="6 - 10 years">6 - 10 years</option>
                <option value="11 - 15 years">11 - 15 years</option>
                <option value="16 - 20 years">16 - 20 years</option>
                <option value="21 - 25 years">21 - 25 years</option>
                <option value="26 - 30 years">26 - 30 years</option>
                <option value="Above 30">Above 30</option>
              </select>
              {errors.studentAgeRange && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.studentAgeRange}
                </p>
              )}
            </div>
          </div>

          {/* Additional Care */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Care <span className="text-red-600">*</span>
              </label>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                {["Child Care", "Elderly Care"].map((care) => (
                  <label
                    key={care}
                    className="flex items-center py-2 border-b last:border-b-0 border-gray-100"
                  >
                    <input
                      type="checkbox"
                      name="additionalCare"
                      required
                      aria-required="true"
                      className="mr-2"
                      checked={formData.additionalCare?.includes(care)}
                      onChange={(e) => {
                        let arr = formData.additionalCare || [];
                        updateFormData(
                          "additionalCare",
                          e.target.checked
                            ? [...arr, care]
                            : arr.filter((s) => s !== care)
                        );
                      }}
                    />
                    <span className="text-gray-700">{care}</span>
                  </label>
                ))}
              </div>
              {errors.additionalCare && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.additionalCare}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={() => {
            const newErrors = {};
            if (!formData.firstName)
              newErrors.firstName = "First name is required.";
            if (!formData.lastName)
              newErrors.lastName = "Last name is required.";
            if (!formData.preferredLanguage)
              newErrors.preferredLanguage = "Preferred language is required.";
            if (!formData.country) newErrors.country = "Country is required.";
            if (!formData.state) newErrors.state = "State is required.";
            if (!formData.nationality)
              newErrors.nationality = "Nationality is required.";
            if (!formData.zipCode) newErrors.zipCode = "Zip code is required.";
            if (!formData.preferredLocation)
              newErrors.preferredLocation = "Preferred location is required.";
            if (
              !formData.tutoringSubject ||
              formData.tutoringSubject.length === 0
            )
              newErrors.tutoringSubject = "Select at least one subject.";
            if (!formData.learningEnvironment)
              newErrors.learningEnvironment =
                "Learning environment is required.";
            if (!formData.learningPurpose)
              newErrors.learningPurpose = "Learning purpose is required.";
            if (!formData.studentAgeRange)
              newErrors.studentAgeRange = "Student age range is required.";
            if (
              !formData.additionalCare ||
              formData.additionalCare.length === 0
            )
              newErrors.additionalCare =
                "Select at least one additional care option.";

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
      </div>
    </>
  );
}

export default TutoringInformation;
