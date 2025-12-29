/* eslint-disable no-unused-vars */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function PreventOtherLogin({ role, children }) {
  const { user } = useAuth();

  if (user) {
    if (user.user_type === role) {
      // Already logged in as this role → send to dashboard
      const dashboardPath =
        role === "provider"
          ? "/careproviders/dashboard"
          : "/careseekers/dashboard";
      return <Navigate to={dashboardPath} replace />;
    } else {
      // Logged in as the other role → show message
      return <Navigate to="/already-logged-in" replace />;
    }
  }

  return children;
}
