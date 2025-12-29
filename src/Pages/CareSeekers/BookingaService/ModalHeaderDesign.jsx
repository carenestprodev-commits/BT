/* eslint-disable no-unused-vars */
import React from "react";

function ModalHeaderDesign() {
  return (
    <div className="flex flex-col items-center mb-6 font-sfpro">
      <img src="/CareLogo.png" alt="Care Logo" className="w-20 h-20 mb-2" />
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-1">
        Sign Up to View Care Providers
        <br />
        near you
      </h2>
      <p className="text-sm text-gray-500 text-center">
        Kindly enter your email address below to view care providers near you.
      </p>
    </div>
  );
}

export default ModalHeaderDesign;
