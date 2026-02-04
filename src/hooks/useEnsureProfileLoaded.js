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

  const auth = useSelector((s) => s.auth || {});
  const reduxUser = auth.user;

  useEffect(() => {
    // Only initialize once
    if (isInitialized) return;
    setIsInitialized(true);

    const initializeProfile = async () => {
      try {
        // Check if we have a valid token
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("access");
        if (!token) {
          console.warn(
            "⚠️ No token found yet, waiting for login to complete...",
          );
          // Token not ready yet, wait a bit longer for login to complete
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Check again after waiting
          const tokenAfterWait =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("access");
          if (!tokenAfterWait) {
            console.warn(
              "⚠️ Still no token after waiting, allowing render with cache",
            );
            setIsLoading(false);
            return;
          }
        }

        // If we have a Redux user with is_verified, we're ready
        if (reduxUser && typeof reduxUser.is_verified === "boolean") {
          console.log("✅ Profile already loaded in Redux");
          setIsLoading(false);
          return;
        }

        // Otherwise, fetch fresh profile
        console.log("📡 Fetching fresh user profile from API...");
        const result = await dispatch(fetchUserProfile());

        // Check if fetch was successful
        if (
          result.payload &&
          typeof result.payload === "object" &&
          !result.payload.error
        ) {
          console.log(
            "✅ Profile fetched successfully, is_verified:",
            result.payload.is_verified,
          );
          // Add a delay to ensure Redux state updates completely
          await new Promise((resolve) => setTimeout(resolve, 200));
          setIsLoading(false);
        } else {
          // Fetch failed, but don't block render - show cached data
          console.warn(
            "⚠️ Profile fetch failed, using cached data:",
            result.payload,
          );
          await new Promise((resolve) => setTimeout(resolve, 200));
          setIsLoading(false);
        }
      } catch (error) {
        console.error("❌ Profile load error:", error.message);
        // Even if fetch fails, we have cached data, so we can proceed
        await new Promise((resolve) => setTimeout(resolve, 200));
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
