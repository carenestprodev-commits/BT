import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BASE_URL } from "./config";
import { buildPublishPayload } from "../lib/seekerRequestPayload";

// Helper function to build payload from formData and localStorage
export const buildJobPayload = (formData) => {
  // Read onboarding data from localStorage
  const readOnboarding = () => {
    try {
      const raw = localStorage.getItem("seeker_onboarding");
      return raw ? JSON.parse(raw) : { steps: {}, preview: null };
    } catch {
      return { steps: {}, preview: null };
    }
  };

  const onboarding = readOnboarding();
  const finalPayload = buildPublishPayload({
    formData: { ...(onboarding.steps?.summary || {}), ...formData },
    steps: onboarding.steps || {},
    preview: onboarding.preview || {},
  });

  console.log(
    "📤 Sending payload to API:",
    JSON.stringify(finalPayload, null, 2),
  );
  return finalPayload;
};

// POST job data to backend
export const postJob = createAsyncThunk(
  "bookaservice/postJob",
  async (payload, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = access
        ? {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          }
        : { "Content-Type": "application/json" };

      const res = await fetch(`${BASE_URL}/api/post/create/`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data);
      }
      return data;
    } catch (err) {
      return rejectWithValue({ message: err.message || "Network error" });
    }
  },
);

const bookaSlice = createSlice({
  name: "bookaservice",
  initialState: {
    loading: false,
    error: null,
    response: null,
  },
  reducers: {
    clearBookaState(state) {
      state.loading = false;
      state.error = null;
      state.response = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.response = null;
      })
      .addCase(postJob.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;
      })
      .addCase(postJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      });
  },
});

export const { clearBookaState } = bookaSlice.actions;
export default bookaSlice.reducer;
