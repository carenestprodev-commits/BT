import { useState } from "react";
import { useDispatch } from "react-redux";
import { saveStep } from "../../../Redux/CareProviderAuth";
function WhyWantWork({ handleNext, handleBack }) {
  const [selectedOption, setSelectedOption] = useState("");
  const dispatch = useDispatch();

  const options = [
    "Grow my Business",
    "Earn extra Income",
    "I'm passionate about providing care",
    "All of the Above",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-4 lg:p-6 rounded-xl shadow-md border border-gray-100 font-sfpro">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center mb-4 lg:mb-6 gap-3 lg:gap-0">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            ←
          </button>
          <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
            Details
          </h2>
        </div>
        <div className="flex items-center lg:justify-end lg:w-full">
          <span className="text-base lg:text-lg text-[#0093d1] font-bold">
            Step 1
          </span>
          <span className="ml-2 text-base lg:text-lg text-gray-500"> of 4</span>
        </div>
      </div>

      {/* Question */}
      <h3 className="text-sm lg:text-md font-semibold text-gray-700 mb-4">
        Why do you want to work with CareNestPro
      </h3>

      {/* Options */}
      <div className="space-y-3 lg:space-y-4 mb-4 lg:mb-6">
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center border rounded-lg px-3 lg:px-4 py-2 lg:py-3 cursor-pointer transition ${
              selectedOption === option
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <input
              type="radio"
              name="reason"
              value={option}
              checked={selectedOption === option}
              onChange={() => setSelectedOption(option)}
              className="mr-3"
            />
            <span className="text-sm lg:text-base text-gray-700">{option}</span>
          </label>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => {
          dispatch(saveStep({ stepName: "whyWantWork", data: selectedOption }));
          handleNext(selectedOption);
        }}
        disabled={!selectedOption}
        className={`w-full py-3 rounded-md text-white text-sm lg:text-md font-medium transition ${
          selectedOption
            ? "bg-[#0093d1] hover:bg-[#007bb0]"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        Next
      </button>
    </div>
  );
}

export default WhyWantWork;
