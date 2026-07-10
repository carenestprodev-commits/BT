/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { FaRegClock, FaRegCalendarAlt } from "react-icons/fa";
import { useHourlyRateConfig } from "../../../constants/hourlyRates";

export default function DualRangeSlider({
  valueStart,
  valueEnd,
  minValue,
  maxValue,
  onChange,
  countryCode = "NG",
  billingCycle = "hourly",
  onBillingCycleChange,
}) {
  const config = useHourlyRateConfig(countryCode);
  const hoursPerMonth = 160;
  const isMonthly = billingCycle === "monthly";
  const defaultMinValue = isMonthly
    ? minValue ?? config.monthlyMinRate ?? config.minRate * hoursPerMonth
    : minValue ?? config.minRate;
  const defaultMaxValue = isMonthly
    ? maxValue ?? config.monthlyMaxRate ?? config.maxRate * hoursPerMonth
    : maxValue ?? config.maxRate;
  const defaultValue = valueEnd ?? valueStart ?? defaultMinValue;
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(valueEnd ?? valueStart ?? defaultMinValue);
  }, [valueEnd, valueStart, defaultMinValue]);

  const formatValue = (v) => `${config.symbol}${Number(v || 0).toLocaleString()}`;

  const handleInputChange = (event) => {
    const next = Number(event.target.value);
    if (Number.isFinite(next)) setValue(next);
  };

  const handleCycleChange = (nextCycle) => {
    if (!onBillingCycleChange || nextCycle === billingCycle) return;
    const nextValue = nextCycle === "monthly"
      ? Math.round(Number(value || 0) * hoursPerMonth)
      : Math.round(Number(value || 0) / hoursPerMonth);
    setValue(nextValue);
    onBillingCycleChange(nextCycle);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {onBillingCycleChange && (
        <div className="mb-4 flex rounded-2xl bg-gray-100 p-1">
          {[
            ["hourly", "Hourly"],
            ["monthly", "Monthly"],
          ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => handleCycleChange(value)}
                className={`flex-1 rounded-2xl py-3 text-sm font-semibold transition ${
                  billingCycle === value
                    ? "bg-white text-[#0d99c9] shadow"
                    : "text-gray-500"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {value === "hourly" ? (
                  <FaRegClock className="text-base" />
                ) : (
                  <FaRegCalendarAlt className="text-base" />
                )}
                {label}
              </span>
              
            </button>
          ))}
        </div>
      )}
      <div className="rounded-2xl border border-gray-200 p-4">
        <div className="mb-4">
          <div className="text-xl font-medium text-gray-700">
            {isMonthly ? "Monthly rates" : "Hourly rates"}
          </div>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={value}
            onChange={handleInputChange}
            className="mt-4 w-full rounded-2xl border border-gray-200 px-5 py-4 text-2xl font-medium text-gray-700 shadow-sm outline-none focus:border-[#0d99c9] focus:ring-2 focus:ring-[#0d99c9]/15"
          />
        </div>
        <p className="text-sm text-[#63c96c]">
          Average range in your area is {formatValue(defaultMinValue)} - {formatValue(defaultMaxValue)} per {isMonthly ? "month" : "hour"}
        </p>
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#0d99c9] bg-[#eef8fd] px-4 py-3 text-sm text-gray-700">
          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#0d99c9] text-[11px] font-semibold text-[#0d99c9]">
            i
          </span>
            <span>
            Care providers will see your rates as{" "}
            <span className="font-semibold text-[#0d99c9]">
              {formatValue(value)}/{isMonthly ? "monthly" : "hourly"} rate
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
