import React from "react";

function ElderlyCareProviderExperience({ formData, updateFormData, handleNext, handleBack, currentStep = 3, totalSteps = 8 }) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100 font-sfpro">
      <div className="flex items-center mb-6">
          <button onClick={handleBack} className="mr-4 text-gray-500 hover:text-gray-700">←</button>
        </div>
      <div className="mb-6">
        <h4 className="text-base font-medium text-gray-800 mb-2">Details</h4>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">Kindly select options to help us understand your preferences</p>
          <div className="flex items-center">

          <span className="text-lg text-[#0093d1] font-bold">Step {currentStep}</span> <span className="ml-2 text-lg text-gray-500"> of {totalSteps}</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-sm text-gray-700 mb-4">
            <strong>What qualities matter most to you in a care provider?</strong> Select the ones that feel right.
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-4 gap-4">
              {['Gentle', 'Attentive', 'Responsible', 'Respectful'].map(quality => (
                <label key={quality} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 bg-white text-gray-900"
                    style={{ backgroundColor: '#fff', color: '#222' }}
                    checked={formData.careProviderQualities.includes(quality)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFormData('careProviderQualities', [...formData.careProviderQualities, quality]);
                      } else {
                        updateFormData('careProviderQualities', formData.careProviderQualities.filter(q => q !== quality));
                      }
                    }}
                  />
                  <span className="text-sm text-gray-700">{quality}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-700 mb-4">
            <strong>What qualities matter most to you in a care provider?</strong> Select the ones that feel right.
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-4 gap-4">
              {['Hypertension', 'Diabetes', 'clean-up help', 'healthy diet',
                'CPR trained', 'Non-smoker', 'Medication reminder', 'can drive',
                'Palliative care', 'Willing to live-in', 'Background checked',
                'Speaks Yoruba', 'Speaks Igbo', 'Speaks Hausa', 'Special Needs experience'
              ].map(exp => (
                <label key={exp} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 bg-white text-gray-900"
                    style={{ backgroundColor: '#fff', color: '#222' }}
                    checked={formData.careProviderExperience.includes(exp)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFormData('careProviderExperience', [...formData.careProviderExperience, exp]);
                      } else {
                        updateFormData('careProviderExperience', formData.careProviderExperience.filter(q => q !== exp));
                      }
                    }}
                  />
                  <span className="text-sm text-gray-700">{exp}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-700 mb-4">
            <strong>Want your care provider to offer more than one type of care?</strong> Select an extra category below.
          </p>
          <select 
            className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
            style={{ backgroundColor: '#fff', color: '#222' }}
            value={formData.extraCareCategory}
            onChange={(e) => updateFormData('extraCareCategory', e.target.value)}
          >
            <option>Select</option>
            <option>Child Care</option>
            <option>Tutoring</option>
            <option>Housekeeping</option>
          </select>
        </div>
      </div>

      <button 
        onClick={handleNext}
        className="w-full bg-[#0093d1] text-white text-lg font-medium py-3 rounded-md hover:bg-[#007bb0] transition mt-8"
      >
        Next
      </button>
    </div>
  );
}

export default ElderlyCareProviderExperience;
