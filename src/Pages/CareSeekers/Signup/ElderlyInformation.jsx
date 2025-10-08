// React not directly referenced in this file
import { useDispatch } from 'react-redux'
import { useState } from 'react'
import { reverseGeocode } from '../../../Redux/Location'

function ElderlyInformation({ formData, updateFormData, handleNext, handleBack, showLocationPopup, setShowLocationPopup, currentStep = 2, totalSteps = 5 }) {
  const dispatch = useDispatch()
  const [countryOptions, setCountryOptions] = useState(["United States", "Canada", "United Kingdom"])
  const [stateOptions, setStateOptions] = useState(["California", "New York", "Texas"])
  const [languageOptions, setLanguageOptions] = useState(["English", "Spanish", "French"])
  return (
    <>
      {showLocationPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 font-sfpro">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-full relative flex flex-col">
            
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">Enable your Location</h2>
              <p className="text-sm text-gray-500 mb-6 text-center">
                This app requires your location are turned on your devices and on this app. You must enable them on your phone settings
              </p>

              {/* Buttons */}
              <div className="w-full flex flex-col gap-4">
                <button
                  className="w-full py-3 rounded-md bg-[#0093d1] text-white text-lg font-medium hover:bg-[#007bb0] transition"
                  onClick={() => {
                    setShowLocationPopup(false);
                    // Trigger location permission logic here
                    dispatch(reverseGeocode()).then(res => {
                      if (res && res.payload) {
                        const d = res.payload
                        if (d.country) {
                          updateFormData('country', d.country)
                          if (!countryOptions.includes(d.country)) setCountryOptions(prev => [d.country, ...prev])
                        }
                        if (d.state) {
                          updateFormData('state', d.state)
                          if (!stateOptions.includes(d.state)) setStateOptions(prev => [d.state, ...prev])
                        }
                        updateFormData('city', d.city || formData.city)
                        updateFormData('zipCode', d.postcode || formData.zipCode)
                        updateFormData('nationality', d.nationality || formData.nationality)
                        if (d.common_languages && d.common_languages.length > 0) {
                          const code = d.common_languages[0]
                          const map = { en: 'English', es: 'Spanish', fr: 'French', bn: 'Bengali' }
                          const lang = map[code] || (code === 'en' ? 'English' : code)
                          updateFormData('preferredLanguage', lang)
                          if (!languageOptions.includes(lang)) setLanguageOptions(prev => [lang, ...prev])
                        }
                      }
                    })
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
      
      <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center mb-6">
          <button onClick={handleBack} className="mr-4 text-gray-500 hover:text-gray-700">
            ← 
          </button>
          <h3 className="text-lg text-gray-700 flex-1">Elderly care details</h3>
          <span className="text-lg text-[#0093d1] font-bold">Step {currentStep}</span> <span className="ml-2 text-lg text-gray-500"> of {totalSteps}</span>
        </div>
        <div className="mb-6">
          <h4 className="text-base font-medium text-gray-800 mb-2">Details</h4>
          <p className="text-sm text-gray-500 mb-6">
            Kindly select options to help us understand your preferences
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="useLocation" 
              checked={formData.useCurrentLocation}
              onChange={(e) => updateFormData('useCurrentLocation', e.target.checked)}
              className="mr-3"
            />
            <label htmlFor="useLocation" className="text-sm text-gray-700">
              Use my current Location instead
            </label>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: '#fff', color: '#222' }}
                value={formData.country}
                onChange={(e) => updateFormData('country', e.target.value)}
              >
                <option value="">Select country</option>
                {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: '#fff', color: '#222' }}
                value={formData.preferredLanguage}
                onChange={(e) => updateFormData('preferredLanguage', e.target.value)}
              >
                <option value="">Select language</option>
                {languageOptions.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: '#fff', color: '#222' }}
                value={formData.state}
                onChange={(e) => updateFormData('state', e.target.value)}
              >
                <option value="">Select state</option>
                {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input 
                type="text" 
                placeholder="Input city"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: '#fff', color: '#222' }}
                value={formData.city}
                onChange={(e) => updateFormData('city', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
              <input 
                type="text" 
                placeholder="Input nationality"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: '#fff', color: '#222' }}
                value={formData.nationality}
                onChange={(e) => updateFormData('nationality', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
              <input 
                type="text" 
                placeholder="Input zip code"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: '#fff', color: '#222' }}
                value={formData.zipCode}
                onChange={(e) => updateFormData('zipCode', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Elderly care type</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: '#fff', color: '#222' }}
                value={formData.elderlyCareType}
                onChange={(e) => updateFormData('elderlyCareType', e.target.value)}
              >
                <option>Select option</option>
                <option>Companionship</option>
                <option>Carer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Relationship with elderly</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: '#fff', color: '#222' }}
                value={formData.relationshipWithElderly}
                onChange={(e) => updateFormData('relationshipWithElderly', e.target.value)}
              >
                <option>Select option</option>
                <option>Child</option>
                <option>Grandchild</option>
                <option>Spouse</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age of elderly</label>
              <input 
                type="text" 
                placeholder="e.g. 65-75"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: '#fff', color: '#222' }}
                value={formData.ageOfElderly}
                onChange={(e) => updateFormData('ageOfElderly', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender of elderly</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                style={{ backgroundColor: '#fff', color: '#222' }}
                value={formData.genderOfElderly}
                onChange={(e) => updateFormData('genderOfElderly', e.target.value)}
              >
                <option>Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Health condition of elderly</label>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                {['Stroke', 'Cancer', 'Hypertension', 'Just old age symptoms', 'Dementia', 'Others'].map(option => (
                  <label key={option} className="flex items-center py-2 border-b last:border-b-0 border-gray-100">
                    <input
                      type="checkbox"
                      className="mr-2 bg-white text-gray-900"
                      style={{ backgroundColor: '#fff', color: '#222' }}
                      checked={formData.healthCondition?.includes(option)}
                      onChange={e => {
                        let arr = Array.isArray(formData.healthCondition) ? formData.healthCondition : [];
                        if (e.target.checked) {
                          updateFormData('healthCondition', [...arr, option]);
                        } else {
                          updateFormData('healthCondition', arr.filter(o => o !== option));
                        }
                      }}
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What form of assistance is needed</label>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                {['Mobility', 'Feeding', 'Bathing', 'Company', 'Others'].map(option => (
                  <label key={option} className="flex items-center py-2 border-b last:border-b-0 border-gray-100">
                    <input
                      type="checkbox"
                      className="mr-2 bg-white text-gray-900"
                      style={{ backgroundColor: '#fff', color: '#222' }}
                      checked={formData.assistanceForm?.includes(option)}
                      onChange={e => {
                        let arr = Array.isArray(formData.assistanceForm) ? formData.assistanceForm : [];
                        if (e.target.checked) {
                          updateFormData('assistanceForm', [...arr, option]);
                        } else {
                          updateFormData('assistanceForm', arr.filter(o => o !== option));
                        }
                      }}
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleNext}
          className="w-full bg-[#0093d1] text-white text-lg font-medium py-3 rounded-md hover:bg-[#007bb0] transition mt-8"
        >
          Next
        </button>
      </div>
    </>
  );
}

export default ElderlyInformation;
