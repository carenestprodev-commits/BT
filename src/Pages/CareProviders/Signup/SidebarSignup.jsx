import React from "react";
import { TiTick } from "react-icons/ti";
import { BsExclamationOctagonFill } from "react-icons/bs";
import { IoIosPeople } from "react-icons/io";
import { RiPagesLine } from "react-icons/ri";
import { GrSchedule } from "react-icons/gr";
import { IoMdPeople } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";

function SidebarSignup({ activeStep = 1, selectedCategory = "" }) {
  const getSteps = () => {
    const baseSteps = [
      {
        id: 1,
        name: "Why do you want to work?",
        desc: "Tell us your motivation",
        icon: <BsExclamationOctagonFill className="text-[#00b3a4] h-5 w-5" />,
      },
      {
        id: 2,
        name: "Care Category",
        desc: "Select the care category",
        icon: <IoIosPeople className="text-[#00b3a4] h-5 w-5" />,
      },
    ];

    // Add category-specific step based on selection
    if (selectedCategory) {
      let categoryStep = {
        id: 3,
        name: `${selectedCategory} Details`,
        desc: `Provide your ${selectedCategory.toLowerCase()} information`,
        icon: <RiPagesLine className="text-[#00b3a4] h-5 w-5" />,
      };
      baseSteps.push(categoryStep);
    }

    // Add final email/password step
    baseSteps.push({
      id: selectedCategory ? 4 : 3,
      name: "Email & Password",
      desc: "Create your account",
      icon: <MdEmail className="text-[#00b3a4] h-5 w-5" />,
    });

    return baseSteps;
  };

  const steps = getSteps();

  return (
    <div
      className="w-90 min-h-screen bg-[#eaf6eb] p-6 lg:p-12 flex flex-col h-full z-20 font-sfpro"
      style={{
        fontFamily: "Inter, sans-serif",
        width: "100vw",
        maxWidth: "440px",
      }}
    >
      {/* Logo */}
      <div className="flex items-center mb-6 lg:mb-10">
        <img
          src="/CareLogo.png"
          alt="CareNestPro Logo"
          className="h-8 lg:h-12 mr-3"
        />
        <h1 className="text-xl lg:text-2xl font-sfpro font-semibold text-[#024a68]">
          CareNest<span className="text-[#00b3a4]">Pro</span>
        </h1>
      </div>

      {/* Steps Navigation */}
      <div className="relative flex flex-col flex-1 font-sfpro">
        <ul className="space-y-0">
          {steps.map((step, idx) => (
            <li
              key={step.id}
              className="flex items-start relative min-h-[60px] lg:min-h-[70px]"
            >
              {/* Vertical line */}
              {idx < steps.length - 1 && (
                <span className="absolute left-4 lg:left-5 top-6 lg:top-8 w-0.5 h-[45px] lg:h-[55px] bg-[#d1e7dd] z-0"></span>
              )}
              {/* Icon */}
              <span
                className={`z-10 flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg border ${
                  step.id === activeStep
                    ? "border-[#00b3a4] bg-white shadow"
                    : "border-[#e0e0e0] bg-[#f5f5f5]"
                } mr-3 lg:mr-4 flex-shrink-0`}
              >
                <div className="text-sm lg:text-base">{step.icon}</div>
              </span>
              <div className="flex flex-col">
                <span
                  className={`text-sm lg:text-base font-semibold ${
                    step.id === activeStep ? "text-[#024a68]" : "text-[#bdbdbd]"
                  }`}
                >
                  {step.name}
                </span>
                <span
                  className={`text-xs lg:text-sm mt-1 ${
                    step.id === activeStep ? "text-[#6c757d]" : "text-[#bdbdbd]"
                  }`}
                >
                  {step.desc}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SidebarSignup;
