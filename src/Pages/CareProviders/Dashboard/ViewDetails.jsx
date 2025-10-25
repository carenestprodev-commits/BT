import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function ViewDetails() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Home" />
      <div className="flex-1 font-sfpro px-4 md:px-8 py-8 md:ml-64 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            className="mr-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Details</h2>
        </div>
        {/* Profile */}
        <div className="flex items-center mb-4">
          <img
            src="https://randomuser.me/api/portraits/women/1.jpg"
            alt="Provider"
            className="w-16 h-16 rounded-full mr-4 object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-800 text-lg">Aleem Sarah</h4>
            <p className="text-sm text-gray-500">Old Dallas,Salford,UK</p>
            <p className="text-xs text-gray-500 max-w-2xl">
              5 years of experience with extensive ways of managing daily
              routines for multiple children. Skilled in age-appropriate
              activities, behavioural guidance, and emergency response. Strong
              communication with parents
            </p>
          </div>
        </div>
        {/* Experience/Rate/Rating */}
        <div className="flex gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg px-6 py-3 flex flex-col items-center">
            <span className="text-xs text-gray-500">Experience</span>
            <span className="font-semibold text-gray-800 text-lg">8 years</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg px-6 py-3 flex flex-col items-center">
            <span className="text-xs text-gray-500">Rate</span>
            <span className="font-semibold text-gray-800 text-lg">$135/hr</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg px-6 py-3 flex flex-col items-center">
            <span className="text-xs text-gray-500">Rating</span>
            <span className="font-semibold text-[#cb9e49] text-lg">★★★★★</span>
            <span className="text-xs text-gray-600">5.0</span>
          </div>
        </div>
        {/* Dedicated Childcare Provider */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">
            Dedicated childcare provider
          </h3>
          <p className="text-sm text-gray-700">
            Dedicated childcare provider with extensive ways of managing daily
            routines for multiple children. Skilled in age-appropriate
            activities, behavioural guidance, and emergency response. Strong
            communication with parents, maintains detailed care logs, and
            prioritizes safety above all. Trustworthy, energetic, and passionate
            about supporting children's emotional and physical development.
          </p>
        </div>
        {/* Testimonials */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Testimonials</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
              <p className="text-sm text-gray-700 mb-2">
                "Sarah "I had a wonderful experience caring for Mr. and Mrs.
                Johnson over the past 8 months. They are such a sweet couple who
                treated me like family from day one. Mrs. Johnson always had
                interesting stories to share, and Mr. Johnson kept me
                entertained with his sense of humor during our daily walks."
              </p>
              <span className="text-xs text-gray-500 font-semibold">
                Nora Wilson
              </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
              <p className="text-sm text-gray-700 mb-2">
                The family was very organized with clear instructions for
                medications and routines, which made my job much easier. They
                were always respectful of my time and paid promptly. The only
                minor issue was that sometimes the adult children would change
                care schedules last minute, which made it a bit challenging to
                plan my week.
              </p>
              <span className="text-xs text-gray-500 font-semibold">
                Katryn
              </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
              <p className="text-sm text-gray-700 mb-2">
                Overall, this was one of my most rewarding assignments. I
                genuinely looked forward to each visit and felt like I was
                making a real difference in their daily lives. I would
                definitely recommend this family to other caregivers - they
                truly appreciate the work we do."
              </p>
              <span className="text-xs text-gray-500 font-semibold">
                Patricia
              </span>
            </div>
          </div>
        </div>
        <button className="w-full bg-[#0093d1] text-white py-3 rounded-md font-semibold text-lg hover:bg-[#007bb0] transition">
          Message
        </button>
      </div>
    </div>
  );
}

export default ViewDetails;
