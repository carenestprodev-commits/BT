import React from "react";
import { TiTick } from "react-icons/ti";
import { BsExclamationOctagonFill } from "react-icons/bs";
import { IoIosPeople } from "react-icons/io";
import { RiPagesLine } from "react-icons/ri";
import { GrSchedule } from "react-icons/gr";
import { IoMdPeople } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";

export function getStepsForCategory(selectedCategory = "") {
  const commonSteps = [
    {
      id: 1,
      name: "Care Category",
      desc: "Select the Care You Need",
      icon: <TiTick className="text-[#00b3a4] h-5 w-5"/>,
    }
  ];

  switch (selectedCategory) {
    case "Childcare":
      return [
        ...commonSteps,
        {
          id: 2,
          name: "Child Information",
          desc: "Provide your children information",
          icon: <BsExclamationOctagonFill className="text-[#00b3a4] h-5 w-5"/>,
        },
        {
          id: 3,
          name: "Care Provider Experience",
          desc: "Select experience & quality preferences",
          icon: <IoMdPeople className="text-[#00b3a4] h-5 w-5"/>,
        },
        {
          id: 4,
          name: "Time/Date Details",
          desc: "Select preferred time & date",
          icon: <GrSchedule className="text-[#00b3a4] h-5 w-5"/>,
        },
        {
          id: 5,
          name: "Summary",
          desc: "Review your information",
          icon: <RiPagesLine className="text-[#00b3a4] h-5 w-5"/>,
        },
        {
          id: 6,
          name: "Care Providers",
          desc: "View care providers near you",
          icon: <IoIosPeople className="text-[#00b3a4] h-5 w-5"/>,
        },
      ];

    case "Elderly Care":
      return [
        ...commonSteps,
        {
          id: 2,
          name: "Elderly Information",
          desc: "Provide elderly care details",
          icon: <BsExclamationOctagonFill className="text-[#00b3a4] h-5 w-5"/>,
        },
        {
          id: 3,
          name: "Care Provider Experience",
          desc: "Select experience & quality preferences",
          icon: <IoMdPeople className="text-[#00b3a4] h-5 w-5"/>,
        },
        {
          id: 4,
          name: "Time/Date Details",
          desc: "Select preferred time & date",
          icon: <GrSchedule className="text-[#00b3a4] h-5 w-5"/>,
        },
        {
          id: 5,
          name: "Summary",
          desc: "Review your information",
          icon: <RiPagesLine className="text-[#00b3a4] h-5 w-5"/>,
        },
        {
          id: 6,
          name: "Care Providers",
          desc: "View care providers near you",
          icon: <IoIosPeople className="text-[#00b3a4] h-5 w-5"/>,
        },
      ];

    case "Tutoring":
      return [
        ...commonSteps,
        {
          id: 2,
          name: "Tutoring Information",
          desc: "Provide tutoring requirements",
          icon: <BsExclamationOctagonFill className="text-[#00b3a4] h-5 w-5"/>,
        },
        {
          id: 3,
          name: "Time/Date Details",
          desc: "Select preferred time & date",
          icon: <GrSchedule className="text-[#00b3a4] h-5 w-5"/>,
        },
        {
          id: 4,
          name: "Summary",
          desc: "Review your information",
          icon: <RiPagesLine className="text-[#00b3a4] h-5 w-5"/>,
        },
        {
          id: 5,
          name: "Care Providers",
          desc: "View tutors near you",
          icon: <IoIosPeople className="text-[#00b3a4] h-5 w-5"/>,
        },
      ];

    case "Housekeeping":
      return [
        ...commonSteps,
        {
          id: 2,
          name: "Housekeeping Information",
          desc: "Provide housekeeping requirements",
          icon: <BsExclamationOctagonFill className="text-[#00b3a4] h-5 w-5"/>,
        },
        {
          id: 3,
          name: "Time/Date Details",
          desc: "Select preferred time & date",
          icon: <GrSchedule className="text-[#00b3a4] h-5 w-5"/>,
        },
        {
          id: 4,
          name: "Summary",
          desc: "Review your information",
          icon: <RiPagesLine className="text-[#00b3a4] h-5 w-5"/>,
        },
        {
          id: 5,
          name: "Care Providers",
          desc: "View housekeepers near you",
          icon: <IoIosPeople className="text-[#00b3a4] h-5 w-5"/>,
        },
      ];

    default:
      return commonSteps;
  }
}

function SidebarSignup({ activeStep = 1, selectedCategory = "" }) {
  const steps = getStepsForCategory(selectedCategory);

  return (
    <div className="w-90 min-h-screen bg-[#eaf6eb] p-12 flex flex-col fixed left-0 top-0 h-full z-20" style={{ fontFamily: 'Inter, sans-serif', width: '440px' }}>
      {/* Logo */}
      <div className="flex items-center mb-10">
        <img src="/CareLogo.png" alt="CareNestPro Logo" className="h-12 mr-3" />
        <h1 className="text-2xl  font-sfpro font-semibold  text-[#024a68]">
          CareNest<span className="text-[#00b3a4]">Pro</span>
        </h1>
      </div>

      {/* Steps Navigation */}
      <div className="relative flex flex-col flex-1 font-sfpro ">
        <ul className="space-y-0">
          {steps.map((step, idx) => (
            <li key={step.id} className="flex items-start relative min-h-[70px]">
              {/* Vertical line */}
              {idx < steps.length - 1 && (
                <span className="absolute left-5 top-8 w-0.5 h-[55px] bg-[#d1e7dd] z-0"></span>
              )}
              {/* Icon */}
              <span className={`z-10 flex items-center justify-center w-10 h-10 rounded-lg border ${step.id === activeStep ? 'border-[#00b3a4] bg-white shadow' : 'border-[#e0e0e0] bg-[#f5f5f5]'} mr-4`}>{step.icon}</span>
              <div className="flex flex-col">
                <span className={`text-base font-semibold ${step.id === activeStep ? 'text-[#024a68]' : 'text-[#bdbdbd]'}`}>{step.name}</span>
                <span className={`text-sm mt-1 ${step.id === activeStep ? 'text-[#6c757d]' : 'text-[#bdbdbd]'}`}>{step.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SidebarSignup;
