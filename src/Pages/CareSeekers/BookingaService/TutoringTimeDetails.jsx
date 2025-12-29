import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import {
  saveStep,
  generatePreview,
  buildPayloadFromSteps,
} from "../../../Redux/CareSeekerAuth";
import DualRangeSlider from "./DualRangeSlider";

function TutoringTimeDetails({
  formData,
  updateFormData,
  handleNext,
  handleBack,
  currentStep = 3,
  totalSteps = 7,
}) {
  const dispatch = useDispatch();
  const onboardingSteps = useSelector((state) => state.careSeeker.steps);
  const [errors, setErrors] = useState({});
  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-4 lg:p-8 rounded-2xl shadow-lg border border-gray-100 font-sfpro">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          ←
        </button>
        <h3 className="text-base lg:text-lg text-gray-700 flex-1">
          Time/Date details
        </h3>
        <span className="text-base lg:text-lg text-[#0093d1] font-bold">
          Step {currentStep}
        </span>{" "}
        <span className="ml-2 text-base lg:text-lg text-gray-500">
          {" "}
          of {totalSteps}
        </span>
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
            onClick={() => updateFormData("scheduleType", "Reoccurring")}
            className={`flex-1 py-3 px-4 text-center ${
              formData.scheduleType === "Reoccurring"
                ? "bg-[#0093d1] text-white"
                : "bg-gray-100 text-gray-600"
            } rounded-l-md`}
          >
            Reoccurring
          </button>
          <button
            onClick={() => updateFormData("scheduleType", "One-Off")}
            className={`flex-1 py-3 px-4 text-center ${
              formData.scheduleType === "One-Off"
                ? "bg-[#0093d1] text-white"
                : "bg-gray-100 text-gray-600"
            } rounded-r-md`}
          >
            One-Off
          </button>
        </div>

        {formData.scheduleType === "Reoccurring" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  aria-required="true"
                  onFocus={(e) => {
                    try {
                      if (e.target && e.target.showPicker)
                        e.target.showPicker();
                    } catch (e) {
                      void e;
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                  style={{ backgroundColor: "#fff", color: "#222" }}
                  value={formData.startDate}
                  onChange={(e) => updateFormData("startDate", e.target.value)}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  aria-required="true"
                  onFocus={(e) => {
                    try {
                      if (e.target && e.target.showPicker)
                        e.target.showPicker();
                    } catch (e) {
                      void e;
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                  style={{ backgroundColor: "#fff", color: "#222" }}
                  value={formData.endDate}
                  onChange={(e) => updateFormData("endDate", e.target.value)}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repeat every <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  aria-required="true"
                  placeholder="Specify No.of times"
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                  style={{ backgroundColor: "#fff", color: "#222" }}
                  value={formData.repeatEvery}
                  onChange={(e) =>
                    updateFormData("repeatEvery", e.target.value)
                  }
                />
                {errors.repeatEvery && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.repeatEvery}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 invisible">
                  Frequency
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
                  required
                  aria-required="true"
                  style={{ backgroundColor: "#fff", color: "#222" }}
                  value={formData.repeatFrequency}
                  onChange={(e) =>
                    updateFormData("repeatFrequency", e.target.value)
                  }
                >
                  <option value="">Select frequency</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Daily</option>
                </select>
                {errors.repeatFrequency && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.repeatFrequency}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Repeat <span className="text-red-600">*</span>
              </label>
              <div className="flex justify-between max-w-full w-full">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const dayName = [
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                      ][index];
                      if (formData.repeatDays.includes(dayName)) {
                        updateFormData(
                          "repeatDays",
                          formData.repeatDays.filter((d) => d !== dayName)
                        );
                      } else {
                        updateFormData("repeatDays", [
                          ...formData.repeatDays,
                          dayName,
                        ]);
                      }
                    }}
                    className={`w-10 h-10 rounded-full ${
                      formData.repeatDays.includes(
                        [
                          "Sunday",
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                        ][index]
                      )
                        ? "bg-[#0093d1] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {errors.repeatDays && (
                <p className="text-sm text-red-600 mt-1">{errors.repeatDays}</p>
              )}
            </div>
          </>
        )}

        {formData.scheduleType === "One-Off" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              required
              aria-required="true"
              onFocus={(e) => {
                try {
                  if (e.target && e.target.showPicker) e.target.showPicker();
                } catch (e) {
                  void e;
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
              style={{ backgroundColor: "#fff", color: "#222" }}
              value={formData.startDate}
              onChange={(e) => updateFormData("startDate", e.target.value)}
            />
            {errors.startDate && (
              <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time <span className="text-red-600">*</span>
            </label>
            <input
              type="time"
              required
              aria-required="true"
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
              style={{ backgroundColor: "#fff", color: "#222" }}
              value={formData.startTime}
              onChange={(e) => updateFormData("startTime", e.target.value)}
            />
            {errors.startTime && (
              <p className="text-sm text-red-600 mt-1">{errors.startTime}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time <span className="text-red-600">*</span>
            </label>
            <input
              type="time"
              required
              aria-required="true"
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900"
              style={{ backgroundColor: "#fff", color: "#222" }}
              value={formData.endTime}
              onChange={(e) => updateFormData("endTime", e.target.value)}
            />
            {errors.endTime && (
              <p className="text-sm text-red-600 mt-1">{errors.endTime}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How much would you be offering{" "}
            <span className="text-gray-500 text-xs">(per Hour)</span>
          </label>
          <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4">
            <span className="inline-flex items-center">
              <span className="mr-1">ℹ️</span>
              average range in your area is ₦1000 - ₦3000
            </span>
          </div>
          <DualRangeSlider
            valueStart={formData.hourlyRateStart}
            valueEnd={formData.hourlyRateEnd}
            onChange={(v) => {
              if (v?.hourlyRateStart !== undefined)
                updateFormData("hourlyRateStart", v.hourlyRateStart);
              if (v?.hourlyRateEnd !== undefined)
                updateFormData("hourlyRateEnd", v.hourlyRateEnd);
            }}
          />
          {errors.hourlyRate && (
            <p className="text-sm text-red-600 mt-1">{errors.hourlyRate}</p>
          )}
        </div>
      </div>

      <button
        onClick={async () => {
          const newErrors = {};
          if (!formData.startTime)
            newErrors.startTime = "Start time is required.";
          if (!formData.endTime) newErrors.endTime = "End time is required.";
          if (!formData.hourlyRateStart || !formData.hourlyRateEnd)
            newErrors.hourlyRate = "Please set an hourly rate range.";

          if (formData.scheduleType === "Reoccurring") {
            if (!formData.startDate)
              newErrors.startDate = "Start date is required.";
            if (!formData.endDate) newErrors.endDate = "End date is required.";
            if (!formData.repeatEvery)
              newErrors.repeatEvery = "Repeat every is required.";
            if (!formData.repeatFrequency)
              newErrors.repeatFrequency = "Repeat frequency is required.";
            if (!formData.repeatDays || formData.repeatDays.length === 0)
              newErrors.repeatDays = "Select at least one day to repeat.";
          } else {
            // One-Off
            if (!formData.startDate)
              newErrors.startDate = "Start date is required.";
          }

          setErrors(newErrors);
          if (Object.keys(newErrors).length > 0) return;

          const timeDetailsData = {
            scheduleType: formData.scheduleType,
            startDate: formData.startDate,
            endDate:
              formData.scheduleType === "One-Off" ? null : formData.endDate,
            repeatEvery:
              formData.scheduleType === "One-Off" ? "" : formData.repeatEvery,
            repeatFrequency:
              formData.scheduleType === "One-Off"
                ? ""
                : formData.repeatFrequency,
            // Normalize repeatDays to full weekday names for payload
            repeatDays:
              formData.scheduleType === "One-Off"
                ? []
                : (() => {
                    const fullNames = [
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ];
                    const shortSymbols = ["S", "M", "T", "W", "T", "F", "S"];
                    return (formData.repeatDays || []).map((d) => {
                      if (fullNames.includes(d)) return d;
                      const idx = shortSymbols.indexOf(d);
                      return idx !== -1 ? fullNames[idx] : d;
                    });
                  })(),
            startTime: formData.startTime,
            endTime: formData.endTime,
            priceMin: formData.hourlyRateStart
              ? Number(formData.hourlyRateStart).toFixed(2)
              : "1000",
            priceMax: formData.hourlyRateEnd
              ? Number(formData.hourlyRateEnd).toFixed(2)
              : "3000",
          };

          dispatch(
            saveStep({ stepName: "timeDetails", data: timeDetailsData })
          );

          const allSteps = { ...onboardingSteps, timeDetails: timeDetailsData };
          const payload = buildPayloadFromSteps(allSteps);

          try {
            await dispatch(generatePreview(payload));
          } catch (error) {
            console.log("Preview generation failed:", error);
          }

          handleNext();
        }}
        className="w-full bg-[#0093d1] text-white text-base lg:text-lg font-medium py-3 rounded-md hover:bg-[#007bb0] transition mt-8"
      >
        Next
      </button>
    </div>
  );
}

export default TutoringTimeDetails;
