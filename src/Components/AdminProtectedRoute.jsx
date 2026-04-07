import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
    const access = localStorage.getItem("access");
    const userStr = localStorage.getItem("user");

    if (!access) {
        // Not authenticated - redirect to admin login
        return <Navigate to="/admin/login" replace />;
    }

    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            // Check if user is admin or staff
            if (user.user_type !== "admin" && !user.is_staff) {
                // Not an admin - redirect to admin login
                return <Navigate to="/admin/login" replace />;
            }
        } catch (err) {
            console.error("Error parsing user data:", err);
            return <Navigate to="/admin/login" replace />;
        }
    } else {
        // No user data - redirect to admin login
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}
