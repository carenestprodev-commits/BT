// src/utils/logout.js

export function logout() {
  try {
    // Clear all localStorage data
    localStorage.clear();

    // Redirect to login page
    window.location.href = "/careproviders/login/";

    // Optional: reload to ensure clean state
    window.location.reload();
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
