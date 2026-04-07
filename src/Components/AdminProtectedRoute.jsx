import React from "react";
import { Navigate } from "react-router-dom";
import tokenService from "../utils/tokenService";

export default function AdminProtectedRoute({ children }) {
    const access = tokenService.getAccessToken();
    const user = tokenService.getUser();

    if (!access) {
        // Not authenticated - redirect to admin login
        return <Navigate to="/admin/login" replace />;
    }

    if (user) {
        // Check if user is admin or staff
        if (user.user_type !== "admin" && !user.is_staff) {
            // Not an admin - redirect to admin login
            return <Navigate to="/admin/login" replace />;
        }
    } else {
        // No user data - redirect to admin login
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}
