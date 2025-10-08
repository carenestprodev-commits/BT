import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function Summary({ formData, updateFormData, handleNext, handleBack }) {
  const navigate = useNavigate();
  // Provide default values to avoid undefined errors
  const safeFormData = {
    messageToProvider: "",
    acceptedTerms: false,
    ...formData
  };
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar active="Summary" />
      <div className="flex-1 font-sfpro px-8 py-8 ml-64 overflow-y-auto">
        <button className="mb-8 text-gray-500 hover:text-gray-700 text-2xl font-bold" onClick={() => navigate(-1)}>
          ←
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">Summary</h2>
  {/* <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 font-medium text-gray-700">
        <div className="flex items-start">
          <div className="text-green-600 mr-3">💡</div>
          <p className="text-sm text-green-700">
            This was generated based on the information you gave. This would help care providers understand your preferences.
          </p>
        </div>
      </div> */}
  {/* <div className="bg-gray-50 p-6 rounded-lg mb-6 text-base text-gray-700">
        <p className="text-sm text-gray-700 leading-relaxed">
          Dedicated childcare provider with extensive ways of managing daily routines for multiple children. Skilled in age-appropriate activities, behavioral guidance, and emergency response. Strong communication with parents, maintains detailed care logs, and prioritizes safety above all. Trustworthy, energetic, and passionate about supporting children's emotional and physical development.
        </p>
      </div> */}
  <div>
  <div className="text-gray-700 font-medium mb-2">Message to Care Provider</div>
        <textarea
          placeholder="Have any other information you might want to share with care provider"
          rows="4"
          className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white text-gray-800 min-h-[100px] resize-none mb-2"
          value={safeFormData.messageToProvider}
          onChange={(e) => updateFormData('messageToProvider', e.target.value)}
        />
      </div>
        <div className="flex items-start mt-6 mb-6">
          <input
            type="checkbox"
            id="terms"
            className="mr-3 mt-1"
            checked={safeFormData.acceptedTerms}
            onChange={(e) => updateFormData('acceptedTerms', e.target.checked)}
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I acknowledge that I have read and accepted{' '}
            <a href="#" className="text-[#0093d1] underline">CareNestPro's Terms of Use</a>,{' '}
            <a href="#" className="text-[#0093d1] underline">Agreement</a> and{' '}
            <a href="#" className="text-[#0093d1] underline">Privacy policy</a>.
          </label>
        </div>
        <button
          onClick={handleNext}
          className="w-full bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition"
          disabled={!safeFormData.acceptedTerms}
        >
          Submit
        </button>
       
      <p className="text-red-500">after submit it should go back with a successful alert msg</p>
      </div>
    </div>
  );
}

export default Summary;
