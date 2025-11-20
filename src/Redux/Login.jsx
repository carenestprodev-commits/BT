import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "./config";
const LS_ACCESS = "access";
const LS_REFRESH = "refresh";
const LS_USER = "user";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // backend may return { detail: '...' } or validation errors
        return rejectWithValue(data);
      }

      // Persist tokens + user to localStorage
      if (data.access) localStorage.setItem(LS_ACCESS, data.access);
      if (data.refresh) localStorage.setItem(LS_REFRESH, data.refresh);
      if (data.user) localStorage.setItem(LS_USER, JSON.stringify(data.user));
      // Save subscription status
      if (typeof data.is_subscribed !== "undefined") {
        localStorage.setItem("is_subscribed", String(data.is_subscribed));
      }
      // Mark that the user has just logged in (used to show post-login one-time modals)
      try {
        localStorage.setItem("just_logged_in", "true");
        // Clear any previous one-time modal flag so it can show after fresh login
        localStorage.removeItem("subscription_modal_shown");
      } catch {
        // ignore
      }

      return data;
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  }
);

const initialState = {
  user: null,
  access: null,
  refresh: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    ...initialState,
    // hydrate from localStorage if available
    user: (() => {
      try {
        const u = localStorage.getItem(LS_USER);
        return u ? JSON.parse(u) : null;
      } catch {
        return null;
      }
    })(),
    access: localStorage.getItem(LS_ACCESS) || null,
    refresh: localStorage.getItem(LS_REFRESH) || null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.access = null;
      state.refresh = null;
      state.loading = false;
      state.error = null;
      try {
        localStorage.removeItem(LS_ACCESS);
        localStorage.removeItem(LS_REFRESH);
        localStorage.removeItem(LS_USER);
        localStorage.removeItem("is_subscribed");
        localStorage.removeItem("subscription_modal_shown");
        localStorage.removeItem("just_logged_in");
      } catch {
        // ignore
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.access = action.payload.access || localStorage.getItem(LS_ACCESS);
        state.refresh =
          action.payload.refresh || localStorage.getItem(LS_REFRESH);
        state.user =
          action.payload.user ||
          (localStorage.getItem(LS_USER)
            ? JSON.parse(localStorage.getItem(LS_USER))
            : null);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
