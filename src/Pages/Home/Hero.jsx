import React from "react";
import HeroImage from "../../../public/patient.svg"; // ✅ replace with actual image
import { MdVerified } from "react-icons/md";

function Hero() {
  return (
    <section className="w-full bg-gradient-to-r from-[#f8fbfd] to-[#eef6fa] py-16 px-8 flex items-center justify-center">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center md:items-start justify-between gap-10 mt-20 mb-20">
        {/* Left Text Content */}
        <div className="flex-1">
          <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-6">
            Verified Care <br /> Providers for your <br /> Family
          </h1>
          <p className="text-gray-600 text-lg mb-6 max-w-lg">
            Whether you need a Nanny, Adult & Senior Care provider, Special
            needs Support, Home Assistant or Tutor, we’re here for you.
          </p>
          <button className="bg-[#0093d1] hover:bg-[#007bb0] text-white px-6 py-3 rounded-md text-lg font-medium transition">
            Get Started
          </button>
        </div>

        {/* Right Image Content */}
        <div className="flex-1 relative flex justify-center">
          {/* Hero Image */}
          <img
            src={HeroImage}
            alt="Caregiver with senior person"
            className="shadow-lg object-cover w-[420px] h-[450px]"
            style={{
              borderTopLeftRadius: "1rem", // ≈ rounded-l-2xl
              borderBottomLeftRadius: "1rem",
              borderTopRightRadius: "5rem", // custom radius
              borderBottomRightRadius: "1rem",
            }}
          />

          {/* Overlay Card (Satisfied Users) */}
          <div className="absolute -bottom-6 -left-6 bg-white shadow-md rounded-xl px-5 py-3 flex items-center space-x-3">
            <MdVerified className="h-10 w-10 text-green-400" />
            <div>
              <p className="text-xl font-semibold text-gray-800">1,123 +</p>
              <p className="text-sm text-gray-500">Satisfied Care seekers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
