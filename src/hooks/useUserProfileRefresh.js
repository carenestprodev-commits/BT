import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUserProfile } from "../Redux/Auth";

/**
 * usePeriodicUserProfileRefresh Hook
 *
 * Automatically refreshes user profile periodically to ensure
 * the frontend stays in sync with backend changes.
 *
 * This is especially useful for:
 * - Detecting verification status changes
 * - Detecting subscription updates
 * - Detecting profile changes made in admin panel
 *
 * @param {number} intervalMs - Refresh interval in milliseconds (default: 15 minutes)
 *
 * Usage:
 * ```jsx
 * function MyDashboard() {
 *   const dispatch = useDispatch();
 *   usePeriodicUserProfileRefresh(15 * 60 * 1000); // 15 minutes
 *
 *   return <div>Dashboard content</div>;
 * }
 * ```
 */
export function usePeriodicUserProfileRefresh(intervalMs = 15 * 60 * 1000) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Refresh on mount
    dispatch(fetchUserProfile());

    // Then refresh periodically
    const interval = setInterval(() => {
      console.log("📡 Periodic user profile refresh...");
      dispatch(fetchUserProfile());
    }, intervalMs);

    return () => clearInterval(interval);
  }, [dispatch, intervalMs]);
}

/**
 * useUserProfileRefreshOnFocus Hook
 *
 * Refreshes user profile when the browser tab regains focus.
 * Useful for detecting changes made while the user was on another tab.
 *
 * Usage:
 * ```jsx
 * function MyDashboard() {
 *   useUserProfileRefreshOnFocus();
 *   return <div>Dashboard content</div>;
 * }
 * ```
 */
export function useUserProfileRefreshOnFocus() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleFocus = () => {
      console.log("👁️ Page focused - refreshing user profile...");
      dispatch(fetchUserProfile());
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [dispatch]);
}
