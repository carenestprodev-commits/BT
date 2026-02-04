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
        console.warn("⚠️ No access token found");
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

      // ✅ FIX: Ensure trailing slash is consistent with backend
      // Try both with and without trailing slash if first attempt fails
      const endpoints = [
        `${BASE_URL}/api/${userType}/profile/personal-info/`,
        `${BASE_URL}/api/${userType}/profile/personal-info`,
      ];

      let res;
      let lastError;

      // Try both endpoint variations
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Attempting to fetch profile from: ${endpoint}`);

          res = await fetch(endpoint, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${access}`,
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });

          // Check if we got HTML instead of JSON (404 error page)
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("text/html")) {
            console.warn(`⚠️ Endpoint ${endpoint} returned HTML (likely 404)`);
            lastError = new Error("Endpoint returned HTML");
            continue; // Try next endpoint
          }

          // If we got a successful response, break out of loop
          if (res.ok) {
            console.log(`✅ Successfully connected to: ${endpoint}`);
            break;
          }

          // If we got 401/403, don't try other endpoints
          if (res.status === 401 || res.status === 403) {
            console.error("❌ Authentication error:", res.status);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("access");
            return rejectWithValue("Authentication failed");
          }

          lastError = new Error(`HTTP ${res.status}`);
        } catch (fetchError) {
          console.warn(
            `⚠️ Failed to fetch from ${endpoint}:`,
            fetchError.message,
          );
          lastError = fetchError;
          continue; // Try next endpoint
        }
      }

      // If all endpoints failed
      if (!res || !res.ok) {
        console.error("❌ All profile endpoints failed:", lastError);
        return rejectWithValue({
          error: `Failed to fetch profile: ${lastError?.message || "Unknown error"}`,
        });
      }

      // Parse the response
      let responseData;
      try {
        const responseText = await res.text();

        // Double-check for HTML response
        if (
          responseText.trim().startsWith("<") ||
          responseText.includes("<!DOCTYPE")
        ) {
          console.error("❌ Server returned HTML instead of JSON");
          return rejectWithValue({
            error:
              "Server error: received HTML instead of JSON. Check endpoint URL.",
          });
        }

        if (!responseText.trim()) {
          console.error("❌ Empty response from server");
          return rejectWithValue({ error: "Empty response from server" });
        }

        responseData = JSON.parse(responseText);
        console.log("✅ Profile data parsed successfully");
      } catch (parseError) {
        console.error(
          "❌ Failed to parse profile response:",
          parseError.message,
        );
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
      console.error("❌ Unexpected error in fetchUserProfile:", err);
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
      console.log("✅ Redux user state updated:", action.payload?.is_verified);
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
        state.error = null;
        console.log("✅ Profile fetch fulfilled, user:", action.payload);
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("❌ Profile fetch rejected:", action.payload);
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
