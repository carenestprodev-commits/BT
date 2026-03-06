import React from "react";
import PhoneImg from "../../../public/mobile.svg"; // ✅ replace with your phone image
import BG from "../../../public/howitworksbg.png"; // ✅ replace with your background pattern

function Mobile() {
  return (
    <section
      className="w-full py-16 px-6 flex justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${BG})` }} // ✅ you can change this dynamically
    >
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center md:items-start gap-10">
        {/* Left Content */}
        <div className="flex-1 text-white">
          <h2 className="text-3xl md:text-4xl font-semibold leading-snug mb-4 mt-20">
            Start your worry-free care <br /> journey today!
          </h2>
          <p className="text-gray-300 mb-6 text-base leading-relaxed max-w-lg">
            Join hundreds of Nigerian families putting their trust in
            CareNestPro. Whether you need a nanny, senior caregiver, special
            needs support, home assistant, or tutor — we’re here for you.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <button className="bg-[#0093d1] hover:bg-[#007bb0] text-white px-5 py-2 rounded-md font-medium transition">
              Become a Care provider
            </button>
            <button className="border border-gray-300 hover:bg-white/10 text-white px-5 py-2 rounded-md font-medium transition">
              Find a Care provider
            </button>
          </div>
        </div>

        {/* Right Image (Phone Mockup) */}
        <div className="flex-1 flex justify-center">
          <img
            src={PhoneImg} // ✅ you can dynamically change this path
            alt="Mobile App Preview"
            className="rounded-2xl shadow-xl max-w-xs md:max-w-md object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default Mobile;
