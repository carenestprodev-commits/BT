import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "./config";

// Fetch current user profile (works for both providers and seekers)
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const access =
        localStorage.getItem("accessToken") || localStorage.getItem("access");
      if (!access) {
        console.warn("⚠️ No access token found, using cached user data");
        // Try to use cached data
        try {
          const cachedUser = localStorage.getItem("user");
          if (cachedUser) {
            return JSON.parse(cachedUser);
          }
        } catch {
          /* ignore */
        }
        return rejectWithValue("No access token");
      }

      // Get user type from localStorage to determine which endpoint to call
      let userType = "provider";
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          userType = user.user_type || "provider";
        }
      } catch {
        userType = "provider";
      }

      // Build the appropriate endpoint based on user type
      let endpoint = `${BASE_URL}/api/provider/profile/personal-info/`;
      if (userType === "seeker") {
        endpoint = `${BASE_URL}/api/seeker/profile/personal-info/`;
      }

      let res;
      try {
        res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${access}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
      } catch (fetchError) {
        console.error("❌ Network error fetching profile:", fetchError.message);
        // Return cached data if network fails
        try {
          const cachedUser = localStorage.getItem("user");
          if (cachedUser) {
            console.log("📦 Using cached user data due to network error");
            return JSON.parse(cachedUser);
          }
        } catch {
          /* ignore */
        }
        return rejectWithValue(`Network error: ${fetchError.message}`);
      }

      // Handle HTTP errors
      if (!res.ok) {
        console.error("❌ Profile fetch HTTP error:", {
          status: res.status,
          statusText: res.statusText,
          endpoint,
        });

        // If 401 or 403, token might be invalid
        if (res.status === 401 || res.status === 403) {
          console.warn(
            "⚠️ Authentication error (401/403), clearing invalid token",
          );
          localStorage.removeItem("accessToken");
          localStorage.removeItem("access");
          // Try to use cached data
          try {
            const cachedUser = localStorage.getItem("user");
            if (cachedUser) {
              console.log("📦 Using cached user data due to auth error");
              return JSON.parse(cachedUser);
            }
          } catch {
            /* ignore */
          }
        }

        try {
          const errorData = await res.json();
          return rejectWithValue(errorData);
        } catch {
          return rejectWithValue({
            error: `HTTP ${res.status}: ${res.statusText}`,
          });
        }
      }

      let responseData;
      try {
        const responseText = await res.text();

        // Check if response is HTML (error page) instead of JSON
        if (
          responseText.trim().startsWith("<") ||
          responseText.includes("<!DOCTYPE")
        ) {
          console.error("❌ Server returned HTML instead of JSON");
          // Try to use cached data
          try {
            const cachedUser = localStorage.getItem("user");
            if (cachedUser) {
              console.log("📦 Using cached user data due to HTML response");
              return JSON.parse(cachedUser);
            }
          } catch {
            /* ignore */
          }
          return rejectWithValue({
            error: "Server error: received HTML instead of JSON",
          });
        }

        if (!responseText.trim()) {
          console.error("❌ Empty response from server");
          return rejectWithValue({ error: "Empty response from server" });
        }

        responseData = JSON.parse(responseText);
        console.log("✅ Profile fetch successful, response length:", {
          length: responseText.length,
          hasUserData: !!responseData.user_data,
        });
      } catch (parseError) {
        console.error("❌ Failed to parse profile response:", {
          error: parseError.message,
        });
        // Try to use cached data
        try {
          const cachedUser = localStorage.getItem("user");
          if (cachedUser) {
            console.log("📦 Using cached user data due to parse error");
            return JSON.parse(cachedUser);
          }
        } catch {
          /* ignore */
        }
        return rejectWithValue({
          error: `Invalid JSON response: ${parseError.message}`,
        });
      }

      // Extract the actual user data (API returns nested in user_data)
      let data = responseData.user_data || responseData;

      // Map API field names to expected field names
      const mappedData = {
        id: data.id,
        full_name:
          data.full_name ||
          `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        user_type: userType,
        is_verified: data.is_verified || false,
        ...data,
      };

      console.log(
        "✅ User profile updated, is_verified:",
        mappedData.is_verified,
      );

      // Update localStorage with fresh user data
      try {
        localStorage.setItem(`${userType}_user`, JSON.stringify(mappedData));
        localStorage.setItem("user", JSON.stringify(mappedData));
      } catch (storageError) {
        console.warn("⚠️ Failed to update localStorage:", storageError.message);
      }

      return mappedData;
    } catch (err) {
      console.error("❌ Unexpected error in fetchUserProfile:", err.message);
      // Final fallback: return cached user data
      try {
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          console.log("📦 Using cached user data as final fallback");
          return JSON.parse(cachedUser);
        }
      } catch {
        /* ignore */
      }
      return rejectWithValue(err.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
