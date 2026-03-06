import React from "react";
import AcademyImg from "../../../public/study.svg"; // ✅ replace with actual image

function Academy() {
  return (
    <section className="w-full bg-white flex justify-center mb-20">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-10">
        {/* Left Content */}
        <div className="flex-1">
          <p className="text-green-700 font-medium mb-2">CareNestPro Academy</p>
          <h2 className="text-3xl font-semibold text-gray-800 leading-snug mb-4">
            Learn, Get Certified <br /> & Get Hired
          </h2>
          <p className="text-gray-600 mb-6 text-base">
            CareNestPro Academy trains nannies, senior caregivers, and tutors to
            become certified and job-ready, with real job placement support.
          </p>
          <button className="bg-[#0093d1] hover:bg-[#007bb0] text-white font-medium px-5 py-2 rounded-md transition">
            Explore the Academy
          </button>
        </div>

        {/* Right Image */}
        <div className="flex-1 flex justify-center">
          <img
            src={AcademyImg}
            alt="CareNestPro Academy"
            className="rounded-xl shadow-md object-cover w-full max-w-md"
          />
        </div>
      </div>
    </section>
  );
}

export default Academy;
