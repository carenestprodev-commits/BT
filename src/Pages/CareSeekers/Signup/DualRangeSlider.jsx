/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { useHourlyRateConfig } from "../../../constants/hourlyRates";

export default function DualRangeSlider({
  valueStart,
  valueEnd,
  minValue,
  maxValue,
  onChange,
  countryCode = "NG",
}) {
  const config = useHourlyRateConfig(countryCode);
  const defaultMinValue = minValue ?? config.minRate;
  const defaultMaxValue = maxValue ?? config.maxRate;
  const defaultValueStart = valueStart ?? defaultMinValue;
  const defaultValueEnd = valueEnd ?? defaultMaxValue;
  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

  const [start, setStart] = useState(defaultValueStart);
  const [end, setEnd] = useState(defaultValueEnd);
  const [isDragging, setIsDragging] = useState(null);

  const sliderRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    setStart(defaultValueStart);
    setEnd(defaultValueEnd);
  }, [defaultValueStart, defaultValueEnd]);

  useEffect(() => {
    if (onChange) {
      onChange({
        hourlyRateStart: start,
        hourlyRateEnd: end,
      });
    }
  }, [start, end]);

  const getPercent = (value) =>
    ((value - defaultMinValue) / (defaultMaxValue - defaultMinValue)) * 100;

  const formatValue = (v) => `${config.symbol}${v}`;

  const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

  const handleMove = (e) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = (getClientX(e) - rect.left) / rect.width;

    let value = Math.round(
      defaultMinValue + percent * (defaultMaxValue - defaultMinValue),
    );
    value = clamp(value, defaultMinValue, defaultMaxValue);

    if (isDragging === "start") {
      setStart(Math.min(value, end));
    }

    if (isDragging === "end") {
      setEnd(Math.max(value, start));
    }
  };

  useEffect(() => {
    const stopDrag = () => setIsDragging(null);

    if (isDragging) {
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", stopDrag);
      document.addEventListener("touchmove", handleMove);
      document.addEventListener("touchend", stopDrag);
    }

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", stopDrag);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", stopDrag);
    };
  }, [isDragging, start, end]);

  /* Keyboard Controls */

  const handleKey = (e, type) => {
    const step = 10;

    if (type === "start") {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        setStart((prev) => clamp(prev + step, defaultMinValue, end));
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        setStart((prev) => clamp(prev - step, defaultMinValue, end));
      }
    }

    if (type === "end") {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        setEnd((prev) => clamp(prev + step, start, defaultMaxValue));
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        setEnd((prev) => clamp(prev - step, start, defaultMaxValue));
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* FIXED MOBILE LAYOUT */}
      <div className="flex justify-between mb-3 text-sm text-gray-500">
        <span>{formatValue(defaultMinValue)}</span>
        <span>{formatValue(defaultMaxValue)}</span>
      </div>

      <div
        ref={sliderRef}
        className="relative w-full h-8 flex items-center cursor-pointer"
      >
        {/* background */}
        <div className="absolute w-full h-2 bg-gray-200 rounded-full"></div>

        {/* active range */}
        <div
          className="absolute h-2 bg-blue-500 rounded-full"
          style={{
            left: `${getPercent(start)}%`,
            width: `${getPercent(end) - getPercent(start)}%`,
          }}
        ></div>

        {/* start thumb */}
        <div
          ref={startRef}
          tabIndex={0}
          onKeyDown={(e) => handleKey(e, "start")}
          onMouseDown={() => setIsDragging("start")}
          onTouchStart={() => setIsDragging("start")}
          className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md -translate-x-1/2 cursor-pointer"
          style={{ left: `${getPercent(start)}%` }}
        ></div>

        {/* end thumb */}
        <div
          ref={endRef}
          tabIndex={0}
          onKeyDown={(e) => handleKey(e, "end")}
          onMouseDown={() => setIsDragging("end")}
          onTouchStart={() => setIsDragging("end")}
          className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md -translate-x-1/2 cursor-pointer"
          style={{ left: `${getPercent(end)}%` }}
        ></div>
      </div>

      {/* Selected values */}
      <div className="flex justify-between mt-4 text-blue-600 font-semibold text-lg">
        <span>{formatValue(start)}</span>
        <span>{formatValue(end)}</span>
      </div>
    </div>
  );
}
