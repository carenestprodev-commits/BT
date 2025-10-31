import React from "react";

function Header({ title = "Admin", onToggleSidebar }) {
  const today = new Date();
  const formatted = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-white border-b border-gray-200 shadow-sm font-sfpro">
      <div className="flex items-center gap-3">
        {/* hamburger for mobile to toggle sidebar */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-md bg-white text-gray-700"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 className="text-lg text-black">{title}</h1>
      </div>

      <div className="flex items-center space-x-2 text-[11px] text-gray-600 bg-white border border-gray-200 rounded-md px-3 py-2">
        <span>{formatted}</span>
        <span role="img" aria-label="calendar">
          📅
        </span>
      </div>
    </header>
  );
}

export default Header;
