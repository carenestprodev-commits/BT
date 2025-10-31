import React, { useState, useRef, useEffect } from "react";

export default function DualRangeSlider({
  valueStart = 80,
  valueEnd = 1230,
  minValue = 10,
  maxValue = 3000,
  onChange,
}) {
  const [start, setStart] = useState(valueStart);
  const [end, setEnd] = useState(valueEnd);
  const [isDragging, setIsDragging] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (onChange) onChange({ hourlyRateStart: start, hourlyRateEnd: end });
  }, [start, end, onChange]);

  const getPercentage = (value) =>
    ((value - minValue) / (maxValue - minValue)) * 100;

  const handleSliderClick = (e) => {
    if (!sliderRef.current || isDragging) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const clickValue = minValue + clickPosition * (maxValue - minValue);
    const distanceToStart = Math.abs(clickValue - start);
    const distanceToEnd = Math.abs(clickValue - end);
    if (distanceToStart < distanceToEnd) {
      setStart(Math.round(Math.min(clickValue, end)));
    } else {
      setEnd(Math.round(Math.max(clickValue, start)));
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const position = (e.clientX - rect.left) / rect.width;
      const value = Math.round(minValue + position * (maxValue - minValue));
      if (isDragging === "start") {
        setStart(Math.max(minValue, Math.min(value, end)));
      } else if (isDragging === "end") {
        setEnd(Math.min(maxValue, Math.max(value, start)));
      }
    };
    const handleMouseUp = () => setIsDragging(null);
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMouseMove);
      document.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, start, end]);

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 font-sfpro">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">${minValue}</span>
          <span className="text-sm text-gray-500">${maxValue}</span>
        </div>
        <div
          ref={sliderRef}
          className="relative w-full h-8 flex items-center mb-4 cursor-pointer"
          onClick={handleSliderClick}
        >
          <div className="absolute w-full h-2 bg-gray-200 rounded-full"></div>
          <div
            className="absolute h-2 bg-blue-500 rounded-full pointer-events-none"
            style={{
              left: `${getPercentage(start)}%`,
              width: `${getPercentage(end) - getPercentage(start)}%`,
            }}
          ></div>
          <div
            className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-grab active:cursor-grabbing transform -translate-x-1/2 z-10"
            style={{ left: `${getPercentage(start)}%` }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging("start");
            }}
          ></div>
          <div
            className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-grab active:cursor-grabbing transform -translate-x-1/2 z-10"
            style={{ left: `${getPercentage(end)}%` }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging("end");
            }}
          ></div>
          <input
            type="range"
            min={minValue}
            max={maxValue}
            value={start}
            onChange={(e) => setStart(Math.min(parseInt(e.target.value), end))}
            className="sr-only"
            aria-label="Minimum hourly rate"
          />
          <input
            type="range"
            min={minValue}
            max={maxValue}
            value={end}
            onChange={(e) => setEnd(Math.max(parseInt(e.target.value), start))}
            className="sr-only"
            aria-label="Maximum hourly rate"
          />
        </div>
        <div className="flex justify-between mt-2 dark: text-blue-500">
          <span className="text-lg font-semibold">${start}</span>
          <span className="text-lg font-semibold">${end}</span>
        </div>
      </div>
    </div>
  );
}
