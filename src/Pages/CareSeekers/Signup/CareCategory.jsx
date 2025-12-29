/* eslint-disable no-unused-vars */
import React from "react";
import { useDispatch } from "react-redux";
import { saveStep } from "../../../Redux/CareSeekerAuth";

function CareCategory({
  selectedCategory,
  setSelectedCategory,
  updateFormData,
  handleNext,
  currentStep = 1,
  totalSteps = 5,
}) {
  const dispatch = useDispatch();
  const categoryKeyMap = {
    Childcare: "childcare",
    "Elderly Care": "elderlycare",
    Tutoring: "tutoring",
    Housekeeping: "housekeeping",
  };

  const categories = [
    {
      name: "Childcare",
      desc: "Find the Right child Care Provider",
      img: "/box1.svg",
    },
    {
      name: "Elderly Care",
      desc: "Find Your Perfect Elderly Care Provider",
      img: "/box2.svg",
    },
    {
      name: "Tutoring",
      desc: "Find Expert Tutors For Every Subject Area",
      img: "/box3.svg",
    },
    {
      name: "Housekeeping",
      desc: "Find Reliable House Keepers",
      img: "/box4.svg",
    },
  ];

  const isNextEnabled = selectedCategory !== "";

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-4 lg:p-4 rounded-2xl shadow-lg border border-gray-100 font-sfpro">
      <div className="relative flex flex-col lg:flex-row lg:justify-between lg:items-center mb-3 gap-3 lg:gap-0">
        <h3 className="text-sm text-center w-full lg:text-base text-gray-700 mb-1 lg:mb-0 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
          What category of Care are you interested in
        </h3>
        <div className="flex items-center">
          <span className="text-base lg:text-lg text-[#0093d1] font-bold">
            Step {currentStep}
          </span>
          <span className="ml-2 text-base lg:text-lg text-gray-500">
            {" "}
            of {totalSteps}
          </span>
        </div>
      </div>
      <p className="text-xs lg:text-sm text-gray-500 mb-2 lg:mb-3 text-center">
        Kindly select options to help us understand your preferences
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-0 gap-y-2 lg:gap-x-0 lg:gap-y-3 mb-2 lg:mb-4 justify-items-center">
        {categories.map((cat) => (
          <div
            key={cat.name}
            onClick={() => {
              setSelectedCategory(cat.name);
              updateFormData("careCategory", cat.name);
              const key =
                categoryKeyMap[cat.name] ||
                cat.name.toLowerCase().replace(/\s+/g, "");
              dispatch(saveStep({ stepName: "careCategory", data: key }));
            }}
            className={`border rounded-2xl cursor-pointer transition shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center h-32 lg:h-40 p-3 w-full max-w-[220px] lg:max-w-[220px] ${
              selectedCategory === cat.name
                ? "border-[#00b3a4] bg-[#f0fbf9]"
                : "border-gray-200"
            }`}
          >
            <img src={cat.img} alt={cat.name} className="h-12 lg:h-16 mb-3" />
            <h4 className="text-sm lg:text-base font-medium text-gray-800">
              {cat.name}
            </h4>
            <p className="text-xs lg:text-sm text-gray-500 mt-1 max-w-[90%] lg:max-w-[80%]">
              {cat.desc}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          // Save care category keyword to Redux before moving next
          const selectedKey =
            categoryKeyMap[selectedCategory] ||
            selectedCategory.toLowerCase().replace(/\s+/g, "");
          dispatch(saveStep({ stepName: "careCategory", data: selectedKey }));
          handleNext();
        }}
        disabled={!isNextEnabled}
        className={`w-full text-base lg:text-lg font-medium py-3 rounded-md transition ${
          isNextEnabled
            ? "bg-[#0093d1] text-white hover:bg-[#007bb0]"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Next
      </button>
    </div>
  );
}

export default CareCategory;
