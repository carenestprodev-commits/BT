/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";

function MessageDetails() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  return (
    <div className="flex min-h-screen bg-white font-sfpro">
      <Sidebar active="Message" />
      <div className="flex-1 font-sfpro px-4 md:px-8 py-8 md:ml-64">
        <button
          className="mb-8 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={() => navigate("/careproviders/dashboard/message")}
        >
          ←
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">Details</h2>
        <div className="flex items-center mb-6">
          <img
            src="https://ui-avatars.com/api/?name=Aleem+Sarah&background=E5E7EB&color=374151&size=64"
            alt="Aleem Sarah"
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mr-4 sm:mr-6"
          />
          <div>
            <div className="text-xl font-semibold text-gray-800">
              Aleem Sarah
            </div>
            <div className="text-gray-500 text-sm mt-1">
              Jan 20, 2025 -Mar 6, 2025
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start w-full sm:w-auto">
            <span className="text-gray-500 text-xs mb-1">Experience</span>
            <span className="text-gray-800 font-semibold text-lg">8 years</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start w-full sm:w-auto">
            <span className="text-gray-500 text-xs mb-1">Rate</span>
            <span className="text-gray-800 font-semibold text-lg">$135/hr</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start w-full sm:w-auto">
            <span className="text-gray-500 text-xs mb-1">Rating</span>
            <span className="text-gray-800 font-semibold text-lg flex items-center gap-2">
              5.0{" "}
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar key={i} className="text-[#cb9e49] text-base" />
              ))}
            </span>
          </div>
        </div>
        <div className="mb-8">
          <div className="text-gray-700 font-medium mb-2">
            Message to Care Provider
          </div>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white text-gray-800 min-h-[100px] resize-none mb-2"
            placeholder="Input feedback of your time with care provider"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex gap-1 mb-2 -mt-10 ml-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="focus:outline-none"
              >
                <FaStar
                  className={
                    i < rating
                      ? "text-[#cb9e49] text-xl"
                      : "text-gray-300 text-xl"
                  }
                />
              </button>
            ))}
          </div>
        </div>
        <div className="mb-8">
          <div className="text-gray-700 font-medium mb-2">Testimonials</div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 text-gray-700 text-base">
            I had a wonderful experience caring for Mr. and Mrs. Johnson over
            the past 8 months. They are such a sweet couple who treated me like
            family from day one. Mrs. Johnson always had interesting stories to
            share, and Mr. Johnson kept me entertained with his sense of humor
            during our daily walks.
          </div>
        </div>
        <button className="w-full bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition">
          Submit
        </button>
      </div>
    </div>
  );
}

export default MessageDetails;
