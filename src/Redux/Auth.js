import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "./config";
import { fetchWithAuth } from "../lib/fetchWithAuth";
import tokenService from "../utils/tokenService";

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      if (!tokenService.getAccessToken()) {
        return rejectWithValue("No access token");
      }

      const userType = tokenService.getUser()?.user_type || "provider";

      const endpoint = `${BASE_URL}/api/${userType}/profile/personal-info/`;
      const res = await fetchWithAuth(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        return rejectWithValue({
          error: `Failed to fetch profile: HTTP ${res.status}`,
        });
      }

      const responseText = await res.text();

      if (
        !responseText.trim() ||
        responseText.trim().startsWith("<") ||
        responseText.includes("<!DOCTYPE")
      ) {
        return rejectWithValue({
          error: "Invalid profile response",
        });
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (err) {
        return rejectWithValue({
          error: `Invalid JSON response: ${err.message}`,
        });
      }

      const data = responseData.user_data || responseData;
      const user = {
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

      try {
        localStorage.setItem(`${userType}_user`, JSON.stringify(user));
      } catch {}
      tokenService.setSession({ user });
      return user;
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
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
