import { useDispatch } from 'react-redux';
import { useState } from 'react'
import { saveStep } from '../../../Redux/CareProviderAuth';
import { reverseGeocode } from '../../../Redux/Location'

function TutoringDetails({ formData, updateFormData, handleNext, handleBack, showLocationPopup, setShowLocationPopup }) {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [countryOptions, setCountryOptions] = useState(["United States", "Canada", "United Kingdom"])
  const [stateOptions, setStateOptions] = useState(["California", "New York", "Texas"])
  const [languageOptions, setLanguageOptions] = useState(["English", "Spanish", "French", "Bengali"])
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
          <h3 className="text-lg text-gray-700 flex-1">Tutoring details</h3>
        </div>
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <TextField label="First Name" value={formData.firstName || ''} onChange={(val) => updateFormData('firstName', val)} />
            {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <TextField label="Last Name" value={formData.lastName || ''} onChange={(val) => updateFormData('lastName', val)} />
            {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>}
          </div>
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
          <SelectField label="Years of Experience" value={formData.experienceLevel} onChange={(val) => updateFormData("experienceLevel", val)} options={["1-3 Years","4-8 Years","9-12 Years"]} />
          <SelectField label="Native Language" value={formData.nativeLanguage} onChange={(val) => updateFormData("nativeLanguage", val)} options={[]} />
          <SelectField label="Other Language" value={formData.otherLanguage} onChange={(val) => updateFormData("otherLanguage", val)} options={[]} />
          <CheckboxGroup
  label="Other Services you can Offer"
  options={["Child Care", "Elderly Care", "House keeping"]}
  values={formData.otherServices || []}
  onChange={(val) => updateFormData("otherServices", val)}
/>

        </div>

        <CheckboxGroup
          label="Choose subject you are best experienced in "
          options={["Mathematics", "English", "Physics", "Chemistry", "History", "Science", "Music", "Other Languages"]}
          values={formData.subjects || []}
          onChange={(val) => updateFormData("subjects", val)}
        />

        <CheckboxGroup
          label="Choose the type of tutoring services you would be providing"
          options={["Individual Tutoring", "Group Lessons", "Exam Preparation", "Homework help", "Special needs tutoring", "Homeschooling", "Online Tutoring"]}
          values={formData.tutoringServices || []}
          onChange={(val) => updateFormData("tutoringServices", val)}
        />

        <RadioGroup
          label="Choose the experience level"
          name="tutoringExperienceLevel"
          options={["Primary School", "Secondary School", "A-levels", "University", "Adults"]}
          value={formData.tutoringExperienceLevel}
          onChange={(val) => updateFormData("tutoringExperienceLevel", val)}
        />

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
          <input type="text" className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900" placeholder="Input rate" value={formData.hourlyRate} onChange={(e) => updateFormData("hourlyRate", e.target.value)} />
          <p className="text-sm text-green-600 mt-1">Average hourly rate is ₦5,500</p>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tell Us about yourself</label>
          <textarea className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900" rows={4} placeholder="Kindly highlight your skills and experience..." value={formData.aboutYou} onChange={(e) => updateFormData("aboutYou", e.target.value)} />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900" placeholder="Give your explanation a title..." value={formData.title} onChange={(e) => updateFormData("title", e.target.value)} />
        </div>

        <div className="flex items-center mt-6">
          <input type="checkbox" id="autoSend" checked={formData.autoSend} onChange={(e) => updateFormData("autoSend", e.target.checked)} className="mr-3" />
          <label htmlFor="autoSend" className="text-sm text-gray-700">I would like to automatically send the above application to potential caretakers</label>
        </div>

        <button onClick={() => {
            const trimmedFirst = (formData.firstName || '').trim();
            const trimmedLast = (formData.lastName || '').trim();
            const newErrors = {};
            if (!trimmedFirst) newErrors.firstName = 'First name is required.';
            if (!trimmedLast) newErrors.lastName = 'Last name is required.';
            setErrors(newErrors);
            if (Object.keys(newErrors).length > 0) return;

            const tutPayload = {
              user_data: {
                first_name: trimmedFirst,
                last_name: trimmedLast,
                full_name: (trimmedFirst + ' ' + trimmedLast).trim()
              },
              profile_data: {
                service_category: 'tutoring',
                country: formData.country || null,
                city: formData.city || null,
                state: formData.state || null,
                zip_code: formData.zipCode || null,
                nationality: formData.nationality || null,
                native_language: formData.nativeLanguage || formData.language || null,
                experience_level: formData.experienceLevel || null,
                years_of_experience: formData.yearsOfExperience || null,
                hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
                languages: (formData.communicationLanguages && formData.communicationLanguages.length > 0) ? formData.communicationLanguages : (formData.language ? [formData.language] : []),
                additional_services: formData.otherServices || [],
                skills: formData.subjects || [],
                category_specific_details: {
                  tutoring_services: formData.tutoringServices || [],
                  experience_level_taught: ensureArray(formData.tutoringExperienceLevel || []),
                  subjects_experienced_in: formData.subjects || []
                },
                about_me: formData.aboutYou || null,
                profile_title: formData.title || null
              }
            }

            // persist user_data and flattened tutoring profile
            dispatch(saveStep({ stepName: 'user_data', data: { first_name: trimmedFirst, last_name: trimmedLast, full_name: (trimmedFirst + ' ' + trimmedLast).trim() } }))
            const flatProfile = { ...tutPayload.profile_data };
            dispatch(saveStep({ stepName: 'tutoring_profile', data: flatProfile }))
            handleNext()
          }} className="w-full bg-[#0093d1] text-white text-lg font-medium py-3 rounded-md hover:bg-[#007bb0] transition mt-8">
          Save
        </button>
      </div>
    </>
  );
}

// helper used in this file
const ensureArray = (v) => {
  if (!v && v !== 0) return []
  if (Array.isArray(v)) return v
  return [v]
}

const TextField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900" />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900">
      <option value="">Select Option</option>
      {options.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
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
            <input type="checkbox" checked={values.includes(option)} onChange={() => handleCheck(option)} className="mr-2" />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const RadioGroup = ({ label, name, options, value, onChange }) => (
  <div className="mt-6">
    <label className="block text-sm font-medium text-gray-700 mb-4">{label}</label>
    <div className="grid grid-cols-3 gap-3">
      {options.map((option, idx) => (
        <label key={idx} className="flex items-center">
          <input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} className="mr-2" />
          <span className="text-sm text-gray-700">{option}</span>
        </label>
      ))}
    </div>
  </div>
);

export default TutoringDetails;
