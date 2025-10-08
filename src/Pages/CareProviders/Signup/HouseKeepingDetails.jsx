import { useDispatch } from 'react-redux';
import { useState } from 'react'
import { saveStep } from '../../../Redux/CareProviderAuth';
import { reverseGeocode } from '../../../Redux/Location'

function HouseKeepingDetails({ formData, updateFormData, handleNext, handleBack, showLocationPopup, setShowLocationPopup }) {
  const dispatch = useDispatch();
  const [countryOptions, setCountryOptions] = useState(["United States", "Canada", "United Kingdom"])
  const [stateOptions, setStateOptions] = useState(["California", "Texas"])
  const [languageOptions, setLanguageOptions] = useState(["English", "French", "Spanish", "Bengali"])
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
            <img src="/mappopup.png" alt="Map Popup" className="w-full h-40 object-cover rounded-t-2xl" />
            <div className="p-8 flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">Enable your Location</h2>
              <p className="text-sm text-gray-500 mb-6 text-center">
                This app requires your location to be turned on your device and within this app. Please enable it in your phone settings.
              </p>
              <div className="w-full flex flex-col gap-4">
                <button className="w-full py-3 rounded-md bg-[#0093d1] text-white text-lg font-medium hover:bg-[#007bb0] transition" onClick={() => {
                    setShowLocationPopup(false)
                    dispatch(reverseGeocode()).then(res => {
                      if (res && res.payload) {
                        const d = res.payload
                        if (d.country) { updateFormData('country', d.country); if (!countryOptions.includes(d.country)) setCountryOptions(prev => [d.country, ...prev]) }
                        if (d.state) { updateFormData('state', d.state); if (!stateOptions.includes(d.state)) setStateOptions(prev => [d.state, ...prev]) }
                        updateFormData('city', d.city || formData.city)
                        updateFormData('zipCode', d.postcode || formData.zipCode)
                        updateFormData('nationality', d.nationality || formData.nationality)
                        if (d.common_languages && d.common_languages.length > 0) { const code = d.common_languages[0]; const map = { en: 'English', es: 'Spanish', fr: 'French', bn: 'Bengali' }; const lang = map[code] || code; updateFormData('language', lang); if (!languageOptions.includes(lang)) setLanguageOptions(prev => [lang, ...prev]) }
                      }
                    }).catch(() => {})
                  }}>Allow only while using this App</button>
                <button className="w-full py-3 rounded-md border border-[#0093d1] text-[#0093d1] text-lg font-medium bg-white hover:bg-[#f0fbf9] transition">Don&apos;t allow this App</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
         <div className="flex items-right justify-end w-full">
        <span className="text-lg text-[#0093d1] font-bold">Step 3</span> <span className="ml-2 text-lg text-gray-500"> of 8</span>
        </div>
        <div className="flex items-center mb-6">
          <button onClick={handleBack} className="mr-4 text-gray-500 hover:text-gray-700">←</button>
          <h3 className="text-lg text-gray-700 flex-1">Housekeeping details</h3>
        </div>

        <p className="text-sm text-gray-500 mb-6">Kindly select options to help us understand your preferences</p>

        <div className="flex items-center mb-6">
          <input type="checkbox" id="useLocation" checked={formData.useCurrentLocation} onChange={(e) => { updateFormData("useCurrentLocation", e.target.checked); if (e.target.checked) setShowLocationPopup(true); }} className="mr-3" />
          <label htmlFor="useLocation" className="text-sm text-gray-700">Use my current Location instead</label>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <SelectField label="Country" value={formData.country} onChange={(val) => updateFormData("country", val)} options={countryOptions} />
          <SelectField label="Preferred Language" value={formData.language} onChange={(val) => updateFormData("language", val)} options={languageOptions} />
          <SelectField label="State" value={formData.state} onChange={(val) => updateFormData("state", val)} options={stateOptions} />
          <TextField label="City" value={formData.city} onChange={(val) => updateFormData("city", val)} />
          <TextField label="Nationality" value={formData.nationality} onChange={(val) => updateFormData("nationality", val)} />
          <TextField label="Zip Code" value={formData.zipCode} onChange={(val) => updateFormData("zipCode", val)} />
          <SelectField label="Native Language" value={formData.nativeLanguage} onChange={(val) => updateFormData("nativeLanguage", val)} options={[]} />
          <SelectField label="Other Language" value={formData.otherLanguage} onChange={(val) => updateFormData("otherLanguage", val)} options={[]} />
          <CheckboxGroup
  label="Other Services you can Offer"
  options={["Child Care", "Elderly Care", "House keeping"]}
  values={formData.otherServices || []}
  onChange={(val) => updateFormData("otherServices", val)}
/>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
              placeholder="Input rate"
              value={formData.hourlyRate}
              onChange={(e) => updateFormData("hourlyRate", e.target.value)}
            />
            <p className="text-sm text-green-600 mt-1">Average hourly rate is ₦5,500</p>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tell Us about yourself</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
            rows={4}
            placeholder="Kindly highlight your skills and experience..."
            value={formData.aboutYou}
            onChange={(e) => updateFormData("aboutYou", e.target.value)}
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
            placeholder="Give your application a title that sums you up as a child care provider"
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
            I would like to automatically send the above application to potential caretakers
          </label>
        </div>

        <CheckboxGroup
          label="Choose your house keeping preference"
          options={["Interested in live-in jobs", "Interested in live-out jobs"]}
          values={formData.housekeepingPreference || []}
          onChange={(val) => updateFormData("housekeepingPreference", val)}
        />

        <button
          onClick={() => {
            const payload = {
              country: formData.country,
              city: formData.city,
              nativeLanguage: formData.nativeLanguage,
              otherLanguage: formData.otherLanguage,
              otherServices: formData.otherServices,
              hourlyRate: formData.hourlyRate,
              aboutYou: formData.aboutYou,
              title: formData.title,
              housekeepingPreference: formData.housekeepingPreference
            }
            dispatch(saveStep({ stepName: 'housekeeping_profile', data: payload }))
            handleNext()
          }}
          className="w-full bg-[#0093d1] text-white text-lg font-medium py-3 rounded-md hover:bg-[#007bb0] transition mt-8"
        >
          Save
        </button>
      </div>
    </>
  );
}

// Reusable components
const TextField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
      <label className="block text-sm font-medium text-gray-700 mb-4">{label}</label>
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

export default HouseKeepingDetails;
