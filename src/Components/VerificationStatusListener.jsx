import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUserProfile } from "../Redux/Auth";

/**
 * VerificationStatusListener Component
 *
 * A background listener that monitors for verification approval events
 * and refreshes the user profile when detected.
 *
 * This component should be placed in the main app layout (App.jsx or Main.jsx)
 * so it runs globally for all authenticated users.
 *
 * How it works:
 * 1. Admin approves a user → Backend stores event in localStorage
 * 2. This component detects the event every 5 seconds
 * 3. If event found and recent (within 5 minutes), fetches fresh profile
 * 4. User sees verification badge immediately
 * 5. Clears the event after processing
 *
 * This ensures users get updated verification status even if they're:
 * - On HomePage
 * - On any other page in the dashboard
 * - Have multiple tabs open
 */
export default function VerificationStatusListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for verification approval event
    const checkVerificationUpdate = () => {
      try {
        const approval = localStorage.getItem("verification_approval");
        if (approval) {
          const approvalData = JSON.parse(approval);
          const now = Date.now();
          const eventAge = now - approvalData.timestamp;

          // If approval happened within the last 5 minutes, refresh profile
          if (eventAge < 5 * 60 * 1000) {
            console.log(
              "✅ Verification approval detected! Refreshing user profile...",
              approvalData,
            );
            dispatch(fetchUserProfile());

            // Clear the event after processing
            localStorage.removeItem("verification_approval");
          } else {
            // Event is old, just clear it
            localStorage.removeItem("verification_approval");
          }
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      }
    };

    // Check immediately on mount
    checkVerificationUpdate();

    // Check every 5 seconds for updates
    const interval = setInterval(checkVerificationUpdate, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // This component renders nothing - it's just a listener
  return null;
}
