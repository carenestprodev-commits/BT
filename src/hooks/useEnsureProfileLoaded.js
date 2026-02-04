import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../Redux/Auth";

/**
 * useEnsureProfileLoaded Hook
 *
 * Ensures the user profile is loaded from the backend before rendering
 * components that depend on verification status.
 *
 * This fixes the issue where badges don't show until after a page refresh
 * by ensuring the profile fetch completes before the component renders.
 *
 * Usage:
 * ```jsx
 * function HomePage() {
 *   const { isLoading } = useEnsureProfileLoaded();
 *
 *   if (isLoading) return <div>Loading profile...</div>;
 *
 *   return <div>Your badge will show here!</div>;
 * }
 * ```
 */
export function useEnsureProfileLoaded() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if we have a user in localStorage from before
  const hasStoredUser = () => {
    try {
      const user = localStorage.getItem("user");
      return !!user;
    } catch {
      return false;
    }
  };

  const auth = useSelector((s) => s.auth || {});
  const reduxUser = auth.user;

  useEffect(() => {
    // Only initialize once
    if (isInitialized) return;
    setIsInitialized(true);

    const initializeProfile = async () => {
      try {
        // If we have a Redux user and it has is_verified, we're ready
        if (reduxUser && typeof reduxUser.is_verified === "boolean") {
          setIsLoading(false);
          return;
        }

        // Otherwise, fetch fresh profile
        const result = await dispatch(fetchUserProfile());

        // Add a small delay to ensure Redux state updates
        // This is a workaround for React's batched state updates
        await new Promise((resolve) => setTimeout(resolve, 100));

        setIsLoading(false);
      } catch (error) {
        console.warn("Profile load error (non-critical):", error);
        // Even if fetch fails, we have cached data, so we can proceed
        await new Promise((resolve) => setTimeout(resolve, 100));
        setIsLoading(false);
      }
    };

    initializeProfile();
  }, [dispatch, isInitialized, reduxUser]);

  return {
    isLoading,
    hasProfile: !!reduxUser,
  };
}
