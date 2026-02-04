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
        // Fallback to provider if parsing fails
        userType = "provider";
      }

      // Build the appropriate endpoint based on user type
      let endpoint = `${BASE_URL}/api/provider/profile/personal-info/`;
      if (userType === "seeker") {
        endpoint = `${BASE_URL}/api/seeker/profile/personal-info/`;
      }

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(errorData);
      }

      const data = await res.json();

      // Update localStorage with fresh user data
      try {
        const dataUserType = data.user_type || userType;
        localStorage.setItem(`${dataUserType}_user`, JSON.stringify(data));
        // Also update the main user object to keep it in sync
        localStorage.setItem("user", JSON.stringify(data));
      } catch {
        /* ignore */
      }

      return data;
    } catch (err) {
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
