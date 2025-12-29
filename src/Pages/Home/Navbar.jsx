import React from "react";
import CareLogo from "../../../public/CareLogo.png"; // ✅ use your logo path

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownOptions = [
    { label: "Care Seeker", link: "/careseekers/login" },
    { label: "Care Provider", link: "/careproviders/login" },

    // { label: 'Care Seeker (Childcare)', link: '/login_care_seeker_child' },
    // { label: 'Care Seekers (Elderly care)', link: '/login_care_seeker_elder' },
    // { label: 'Care Seekers (Tutoring)', link: '/login_care_seeker_tutoring' },
    // { label: 'Care Seekers (Home keeper)', link: '/login_care_seeker_home_keeper' },
    // { label: 'Care Provider (Home Keeper)', link: '/login_care_provider_home_keeper' },
    // // { label: 'Care Provider (Home Keeper)', link: '/dummy-provider-homekeeper' }
  ];

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest("#join-dropdown")) setDropdownOpen(false);
    };
    if (dropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  return (
    <nav className="w-full bg-white shadow-sm px-8 py-4 flex items-center justify-between">
      {/* Logo + Title */}
      <div className="flex items-center">
        <img src={CareLogo} alt="CareNestPro Logo" className="h-10 mr-2" />
        <h1 className="text-lg font-medium text-[#024a68]">
          CareNest<span className="text-[#00b3a4]">Pro</span>
        </h1>
      </div>

      {/* Join Now Button + Dropdown */}
      <div className="relative" id="join-dropdown">
        <button
          className="bg-[#0093d1] hover:bg-[#007bb0] transition text-white text-sm font-medium px-4 py-2 rounded-md"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          Join Now
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
            {dropdownOptions.map((opt) => (
              <button
                key={opt.label}
                className="w-full text-left px-5 py-3 text-gray-700 hover:bg-[#f0fbf9] focus:bg-[#f0fbf9] transition text-sm border-b last:border-b-0 border-gray-100"
                onClick={() => {
                  setDropdownOpen(false);
                  window.location.href = opt.link;
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
