/**
 * Token Management Service
 * Handles token refresh and authentication
 */

const BASE_URL = "https://backend.app.carenestpro.com";

export const tokenService = {
  /**
   * Refresh the access token using refresh token
   */
  refreshToken: async () => {
    try {
      const refreshToken =
        localStorage.getItem("refreshToken") || localStorage.getItem("refresh");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();

      // Store the new access token
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("access", data.access);

      return data.access;
    } catch (error) {
      console.error("Token refresh error:", error);
      // Clear tokens and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("access");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("refresh");

      // Redirect to login
      window.location.href = "/login";
      return null;
    }
  },

  /**
   * Get valid access token (refresh if needed)
   */
  getValidToken: async () => {
    let accessToken =
      localStorage.getItem("accessToken") || localStorage.getItem("access");

    if (!accessToken) {
      throw new Error("No access token available");
    }

    // Check if token is expired (optional - you can decode JWT to check)
    // For now, we'll try to use it and refresh on 401
    return accessToken;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const accessToken =
      localStorage.getItem("accessToken") || localStorage.getItem("access");
    return !!accessToken;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("access");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  },
};

export default tokenService;
