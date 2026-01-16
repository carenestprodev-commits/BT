import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL, getAuthHeaders } from "./config";

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
  }
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
        }
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
  }
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
        }
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
  }
);

const initialState = readLS();

// Helper to build API payload from current steps
export const buildPayloadFromSteps = (steps) => {
  // Ensure payload uses full weekday names. The UI may store either full
  // names ("Monday") or short symbols ("M", "T", "W", ...). Normalize
  // both to full names for the API payload.
  const fullNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const shortSymbols = ["S", "M", "T", "W", "T", "F", "S"];
  const repeat_on = (
    steps.timeDetails?.repeatDays || ["Monday", "Wednesday", "Friday"]
  ).map((day) => {
    if (!day) return day;
    // If already a full name, keep it
    if (fullNames.includes(day)) return day;
    // If it's a short symbol, map to the first matching full name by index
    const idx = shortSymbols.indexOf(day);
    if (idx !== -1) return fullNames[idx];
    // Fallback: return as-is
    return day;
  });

  const service_category = steps.careCategory?.toLowerCase() || "childcare";
  const location_information = {
    use_current_location: steps.location?.useCurrentLocation || false,
    preferred_language: steps.location?.preferredLanguage || "English",
    country: steps.location?.country || "",
    state: steps.location?.state || "",
    city: steps.location?.city || "",
    zip_code: steps.location?.zipCode || "",
    nationality: steps.location?.nationality || "",
  };

  const isOneOff = steps.timeDetails?.scheduleType?.toLowerCase() === "one-off";

  const schedule = {
    job_type: isOneOff ? "one-time" : "recurring",
    start_date: steps.timeDetails?.startDate || "2025-11-10",
    end_date: isOneOff ? null : steps.timeDetails?.endDate || "2026-02-10",
    repeat_every: isOneOff
      ? {}
      : {
          count: parseInt(steps.timeDetails?.repeatEvery || "1"),
          period: steps.timeDetails?.repeatFrequency || "Weekly",
        },
    repeat_on: isOneOff ? [] : repeat_on,
    start_time: steps.timeDetails?.startTime || "09:00:00",
    end_time: steps.timeDetails?.endTime || "17:00:00",
  };

  const payload = {
    service_category,
    details: { location_information },
    schedule,
    budget: {
      price_min: steps.timeDetails?.priceMin || "35.00",
      price_max: steps.timeDetails?.priceMax || "55.00",
    },
  };

  // Add service-specific details
  if (steps.careCategory === "Childcare") {
    payload.details.child_information = {
      who_needs_care: steps.childInfo?.whoNeedsCare || "Nanny",
      childcare_type: steps.childInfo?.childcareType || "Full-Time Care",
      number_of_children: steps.childInfo?.numberOfChildren || "1 child",
      children: (steps.childInfo?.childrenDetails || []).map((child) => ({
        age: child.age || child.birthDate || "2021-05-15",
        gender: child.gender || "Male",
      })),
    };
    payload.details.provider_experience_requirements = {
      communication_and_language: steps.experience?.communicationLanguage || [
        "Fluent in English",
      ],
      special_preferences: steps.experience?.specialPreferences || [],
      preferred_option: steps.experience?.preferredOption || ["Live-Out"],
      additional_care_categories:
        steps.experience?.additionalCareCategories || [],
    };
  } else if (steps.careCategory === "Housekeeping") {
    payload.details.housekeeping_information = {
      kind_of_housekeeping: steps.housekeeping?.housekeepingServices || [],
      size_of_your_house: steps.housekeeping?.homeSize || "",
      number_of_bedrooms: steps.housekeeping?.numberOfBedrooms || "",
      number_of_bathrooms: steps.housekeeping?.numberOfBathrooms || "",
      number_of_toilets: steps.housekeeping?.numberOfToilets || "",
      pets_present: steps.housekeeping?.petsPresent || "No",
      specify_pet_present: steps.housekeeping?.petDetails || "",
      additional_care: steps.housekeeping?.additionalCare || [],
    };
  } else if (steps.careCategory === "Elderly Care") {
    payload.details.elderly_information = {
      care_type: steps.elderlyInfo?.elderlyCareType || "Companion",
      relationship: steps.elderlyInfo?.relationshipWithElderly || "",
      age: steps.elderlyInfo?.ageOfElderly || "",
      gender: steps.elderlyInfo?.genderOfElderly || "",
      health_condition: steps.elderlyInfo?.healthCondition || "",
    };
  } else if (steps.careCategory === "Tutoring") {
    payload.details.tutoring_information = {
      subjects: steps.tutoringInfo?.tutoringSubjects || [],
      student_age: steps.tutoringInfo?.studentAge || "",
      current_grade: steps.tutoringInfo?.currentGrade || "",
    };
  }

  return payload;
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

  const payload = {
    user_data: {
      first_name: userCredentials.firstName || steps.signup?.firstName || "",
      last_name: userCredentials.lastName || steps.signup?.lastName || "",
      email: userCredentials.email || steps.signup?.email || "",
      password: userCredentials.password || steps.signup?.password || "",
      user_type: "seeker",
    },
    job_data: buildPayloadFromSteps(steps),
    title: onboarding.preview?.title || "Job Posting",
    summary: onboarding.preview?.summary || "Looking for care services",
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
