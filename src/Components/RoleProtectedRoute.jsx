/* eslint-disable no-unused-vars */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import VerificationStatusListener from "./VerificationStatusListener";

export default function RoleProtectedRoute({ allowedRole, children }) {
  const { user } = useAuth();

  if (!user) {
    // Not authenticated - redirect to home or general login
    return <Navigate to="/" replace />;
  }

  const allowedRoles = Array.isArray(allowedRole)
    ? allowedRole
    : allowedRole
      ? [allowedRole]
      : null;

  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    // Logged in as another role - redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <>
      {/* Global verification status listener for all protected routes */}
      <VerificationStatusListener />
      {children}
    </>
  );
}
