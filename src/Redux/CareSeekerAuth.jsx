/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL, getAuthHeaders } from "./config";
import { buildPublishPayload, buildSeekerJobData } from "../lib/seekerRequestPayload";

const LS_KEY = "seeker_onboarding";

const readLS = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          steps: {},
          preview: null,
          profile: null,
          loading: false,
          error: null,
        };
  } catch (e) {
    return {
      steps: {},
      preview: null,
      profile: null,
      loading: false,
      error: null,
    };
  }
};

const writeLS = (data) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
};

// Fetch seeker profile
export const fetchSeekerProfile = createAsyncThunk(
  "careSeekerAuth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/profile/info/`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(text);
      }
      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// Async thunk to generate preview
export const generatePreview = createAsyncThunk(
  "careSeeker/generatePreview",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/seeker/public-onboarding/generate-preview/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(text);
      }
      const data = await res.json();
      // append response to localStorage flow
      const ls = readLS();
      ls.preview = data;
      writeLS(ls);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// Async thunk to register and publish
export const registerAndPublish = createAsyncThunk(
  "careSeeker/registerAndPublish",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/seeker/public-onboarding/register-and-publish/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(text);
      }
      const data = await res.json();
      // Persist full API response to localStorage so calling code can access tokens/user immediately
      try {
        localStorage.setItem("seeker_register_response", JSON.stringify(data));
        // If tokens are present, also store them under common keys for convenience
        if (data.access) localStorage.setItem("access", data.access);
        if (data.refresh) localStorage.setItem("refresh", data.refresh);
        if (data.user)
          localStorage.setItem("seeker_user", JSON.stringify(data.user));
      } catch (storageErr) {
        // best-effort persistence; log if it fails (do not break flow)
        console.warn("Failed to persist seeker register response", storageErr);
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

const initialState = readLS();

// Helper to build API payload from current steps
export const buildPayloadFromSteps = (steps) => {
  return buildSeekerJobData({}, steps);
};

// Helper to build register-and-publish payload with user_data and job_data structure
export const buildRegisterAndPublishPayload = (steps, userCredentials = {}) => {
  const onboarding = (() => {
    try {
      const raw = localStorage.getItem("seeker_onboarding");
      return raw ? JSON.parse(raw) : { steps: {}, preview: null };
    } catch {
      return { steps: {}, preview: null };
    }
  })();

  const publishPayload = buildPublishPayload({
    steps,
    preview: onboarding.preview,
    formData: steps.summary || {},
  });

  const payload = {
    user_data: {
      first_name: userCredentials.firstName || steps.signup?.firstName || "",
      last_name: userCredentials.lastName || steps.signup?.lastName || "",
      phone_number: userCredentials.phone || steps.signup?.phone || "",
      email: userCredentials.email || steps.signup?.email || "",
      password: userCredentials.password || steps.signup?.password || "",
      user_type: "seeker",
    },
    ...publishPayload,
  };

  return payload;
};

const slice = createSlice({
  name: "careSeeker",
  initialState,
  reducers: {
    saveStep(state, action) {
      // action.payload: { stepName: string, data: object }
      const { stepName, data } = action.payload;
      state.steps = { ...state.steps, [stepName]: data };
      writeLS(state);
    },
    clearOnboarding(state) {
      state.steps = {};
      state.preview = null;
      writeLS(state);
    },
    appendPreview(state, action) {
      state.preview = action.payload;
      writeLS(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeekerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSeekerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchSeekerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(generatePreview.fulfilled, (state, action) => {
        state.preview = action.payload;
        writeLS(state);
      })
      .addCase(registerAndPublish.fulfilled, (state, action) => {
        state.registerResponse = action.payload;
        writeLS(state);
      });
  },
});

export const { saveStep, clearOnboarding, appendPreview } = slice.actions;

export default slice.reducer;
