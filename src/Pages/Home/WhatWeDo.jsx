/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import ChildImg from "../../../public/WhatWeDo (1).png";
import ElderImg from "../../../public/WhatWeDo (1).svg";
import TutorImg from "../../../public/WhatWeDo (2).svg";
import HouseImg from "../../../public/WhatWeDo (3).svg";

function WhatWeDo() {
  const [selected, setSelected] = useState("Child care");

  const services = [
    {
      name: "Child care",
      desc: "Trusted, loving care for your little ones, including children with special needs or unique routines.",
      img: ChildImg,
    },
    {
      name: "Elder care",
      desc: "Gentle, respectful assistance for elderly loved ones from companionship to specialized daily care.",
      img: ElderImg,
    },
    {
      name: "Tutoring",
      desc: "Personalized tutoring for learners of all levels, including those with special educational needs.",
      img: TutorImg,
    },
    {
      name: "Housekeeping",
      desc: "Reliable help to keep your home clean, organized, and stress-free with sensitivity to care-focused environments.",
      img: HouseImg,
    },
  ];

  return (
    <section className="w-full bg-white mb-20 dark:bg-white">
      {/* Light Green Top Background */}
      <div className="bg-[#eaf6eb] h-20 w-full "></div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 ">
        {/* Heading */}
        <h2 className="text-4xl font-semibold text-gray-800 mb-2 mt-5">
          What we do
        </h2>
        <p className="text-gray-600 text-lg mb-10">
          Connecting families with trusted, professional caregivers for
          personalized in-home support across all life stages
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 ">
          {services.map((service) => (
            <div
              key={service.name}
              onClick={() => setSelected(service.name)}
              className={`cursor-pointer rounded-xl p-6 transition shadow-sm hover:shadow-md ${
                selected === service.name
                  ? "border border-[#0093d1] bg-white"
                  : "border border-transparent bg-[#fafafa]"
              }`}
            >
              {/* Image */}
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-6 shadow-sm">
                  <img
                    src={service.img}
                    alt={service.name}
                    className="h-20 w-auto"
                  />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {service.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 leading-snug">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhatWeDo;
