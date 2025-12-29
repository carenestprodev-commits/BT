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
    <div className="w-full max-w-3xl mx-auto bg-white p-4 lg:p-8 rounded-2xl shadow-lg border border-gray-100 font-sfpro">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-5 gap-3 lg:gap-0">
        <h3 className="text-base lg:text-lg text-gray-700">
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
      <p className="text-sm text-gray-500 mb-6 lg:mb-8">
        Kindly select options to help us understand your preferences
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
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
            className={`border rounded-2xl cursor-pointer transition shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center aspect-square p-4 ${
              selectedCategory === cat.name
                ? "border-[#00b3a4] bg-[#f0fbf9]"
                : "border-gray-200"
            }`}
          >
            <img src={cat.img} alt={cat.name} className="h-20 lg:h-30 mb-4" />
            <h4 className="text-base lg:text-lg font-medium text-gray-800">
              {cat.name}
            </h4>
            <p className="text-xs lg:text-sm text-gray-500 mt-2 max-w-[90%] lg:max-w-[80%]">
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
