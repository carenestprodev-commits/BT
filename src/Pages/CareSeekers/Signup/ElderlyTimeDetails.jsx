import { useDispatch, useSelector } from 'react-redux';
import { saveStep, generatePreview, buildPayloadFromSteps } from '../../../Redux/CareSeekerAuth';
import DualRangeSlider from "./DualRangeSlider";

function ElderlyTimeDetails({ formData, updateFormData, handleNext, handleBack, currentStep = 4, totalSteps = 8 }) {
  const dispatch = useDispatch();
  const onboardingSteps = useSelector(state => state.careSeeker.steps);
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center mb-6">
        <button onClick={handleBack} className="mr-4 text-gray-500 hover:text-gray-700">
          ← 
        </button>
        <h3 className="text-lg text-gray-700 flex-1">Time/Date details</h3>
  <span className="text-lg text-[#0093d1] font-bold">Step {currentStep}</span> <span className="ml-2 text-lg text-gray-500"> of {totalSteps}</span>
      </div>
      
      <div className="mb-6">
        <h4 className="text-base font-medium text-gray-800 mb-2">Details</h4>
        <p className="text-sm text-gray-500 mb-6">
          Kindly select options to help us understand your preferences
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex">
          <button 
            onClick={() => updateFormData('scheduleType', 'Reoccurring')}
            className={`flex-1 py-3 px-4 text-center ${formData.scheduleType === 'Reoccurring' ? 'bg-[#0093d1] text-white' : 'bg-gray-100 text-gray-600'} rounded-l-md`}
          >
            Reoccurring
          </button>
          <button 
            onClick={() => updateFormData('scheduleType', 'One-Off')}
            className={`flex-1 py-3 px-4 text-center ${formData.scheduleType === 'One-Off' ? 'bg-[#0093d1] text-white' : 'bg-gray-100 text-gray-600'} rounded-r-md`}
          >
            One-Off
          </button>
        </div>

        {formData.scheduleType === 'Reoccurring' && (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input 
                  type="date" 
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                  style={{ backgroundColor: '#fff', color: '#222' }}
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input 
                  type="date" 
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                  style={{ backgroundColor: '#fff', color: '#222' }}
                  value={formData.endDate}
                  onChange={(e) => updateFormData('endDate', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Repeat every</label>
                <input 
                  type="text" 
                  placeholder="Specify No.of times"
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                  style={{ backgroundColor: '#fff', color: '#222' }}
                  value={formData.repeatEvery}
                  onChange={(e) => updateFormData('repeatEvery', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 invisible">Frequency</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                  style={{ backgroundColor: '#fff', color: '#222' }}
                  value={formData.repeatFrequency}
                  onChange={(e) => updateFormData('repeatFrequency', e.target.value)}
                >
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Daily</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Repeat</label>
              <div className="flex justify-between max-w-full w-full">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index];
                      if (formData.repeatDays.includes(dayName)) {
                        updateFormData('repeatDays', formData.repeatDays.filter(d => d !== dayName));
                      } else {
                        updateFormData('repeatDays', [...formData.repeatDays, dayName]);
                      }
                    }}
                    className={`w-10 h-10 rounded-full ${formData.repeatDays.includes(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index]) ? 'bg-[#0093d1] text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {formData.scheduleType === 'One-Off' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input 
              type="date" 
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
              style={{ backgroundColor: '#fff', color: '#222' }}
              value={formData.startDate}
              onChange={(e) => updateFormData('startDate', e.target.value)}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <input 
              type="time" 
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
              style={{ backgroundColor: '#fff', color: '#222' }}
              value={formData.startTime}
              onChange={(e) => updateFormData('startTime', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <input 
              type="time" 
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
              style={{ backgroundColor: '#fff', color: '#222' }}
              value={formData.endTime}
              onChange={(e) => updateFormData('endTime', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">How much would you be offering <span className="text-gray-500 text-xs">(per Hour)</span></label>
          <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4">
            <span className="inline-flex items-center"><span className="mr-1">ℹ️</span> average range in your area is $32 - $55</span>
          </div>
          <DualRangeSlider />
        </div>
      </div>

      <button 
        onClick={async () => {
          const timeDetailsData = {
            scheduleType: formData.scheduleType,
            startDate: formData.startDate,
            endDate: formData.endDate,
            repeatEvery: formData.repeatEvery,
            repeatFrequency: formData.repeatFrequency,
            repeatDays: formData.repeatDays,
            startTime: formData.startTime,
            endTime: formData.endTime,
            priceMin: formData.hourlyRateStart ? (formData.hourlyRateStart / 10).toString() : "35.00",
            priceMax: formData.hourlyRateEnd ? (formData.hourlyRateEnd / 10).toString() : "55.00"
          };

          dispatch(saveStep({ stepName: 'timeDetails', data: timeDetailsData }));

          const allSteps = { ...onboardingSteps, timeDetails: timeDetailsData };
          const payload = buildPayloadFromSteps(allSteps);

          try {
            await dispatch(generatePreview(payload));
          } catch (error) {
            console.log('Preview generation failed:', error);
          }

          handleNext();
        }}
        className="w-full bg-[#0093d1] text-white text-lg font-medium py-3 rounded-md hover:bg-[#007bb0] transition mt-8"
      >
        Next
      </button>
    </div>
  );
}

export default ElderlyTimeDetails;
