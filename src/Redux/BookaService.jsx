import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

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
  const serviceCategory = (
    formData.careCategory ||
    onboarding.steps?.careCategory ||
    "childcare"
  ).toLowerCase();

  const job_type =
    (
      formData.scheduleType ||
      onboarding.steps?.timeDetails?.scheduleType ||
      "Reoccurring"
    ).toLowerCase() === "one-off"
      ? "one-time"
      : "recurring";
  const recurrence_frequency = (
    formData.repeatFrequency ||
    onboarding.steps?.timeDetails?.repeatFrequency ||
    "Weekly"
  ).toLowerCase();
  const recurrence_days = formData.repeatDays ||
    onboarding.steps?.timeDetails?.repeatDays || ["Friday"];

  const priceMinRaw =
    formData.hourlyRateStart ||
    formData.priceMin ||
    onboarding.steps?.timeDetails?.hourlyRateStart ||
    onboarding.steps?.timeDetails?.priceMin;
  const priceMaxRaw =
    formData.hourlyRateEnd ||
    formData.priceMax ||
    onboarding.steps?.timeDetails?.hourlyRateEnd ||
    onboarding.steps?.timeDetails?.priceMax;
  const price_min =
    priceMinRaw !== undefined && priceMinRaw !== null
      ? parseFloat(priceMinRaw)
      : 25.0;
  const price_max =
    priceMaxRaw !== undefined && priceMaxRaw !== null
      ? parseFloat(priceMaxRaw)
      : 35.0;

  const job_data = {
    service_category: serviceCategory,
    details: {
      location_information: {
        use_current_location:
          formData.useCurrentLocation ||
          onboarding.steps?.location?.useCurrentLocation ||
          false,
        preferred_language:
          formData.preferredLanguage ||
          onboarding.steps?.location?.preferredLanguage ||
          "English",
        country: formData.country || onboarding.steps?.location?.country || "",
        state: formData.state || onboarding.steps?.location?.state || "",
        city: formData.city || onboarding.steps?.location?.city || "",
        zip_code: formData.zipCode || onboarding.steps?.location?.zipCode || "",
        nationality:
          formData.nationality || onboarding.steps?.location?.nationality || "",
      },
    },
    schedule: {
      job_type,
      recurrence_pattern: {
        frequency: recurrence_frequency,
        days: recurrence_days,
      },
    },
    budget: {
      price_min,
      price_max,
    },
    message_to_provider:
      formData.messageToProvider ||
      onboarding.steps?.summary?.messageToProvider ||
      "",
  };

  // Add service-specific details
  if (serviceCategory === "housekeeping") {
    job_data.details.housekeeping_information = {
      kind_of_housekeeping:
        formData.housekeepingServices ||
        onboarding.steps?.housekeeping?.housekeepingServices ||
        [],
      size_of_your_house:
        formData.homeSize || onboarding.steps?.housekeeping?.homeSize || "",
      number_of_bedrooms:
        formData.numberOfBedrooms ||
        onboarding.steps?.housekeeping?.numberOfBedrooms ||
        "",
      number_of_bathrooms:
        formData.numberOfBathrooms ||
        onboarding.steps?.housekeeping?.numberOfBathrooms ||
        "",
      number_of_toilets:
        formData.numberOfToilets ||
        onboarding.steps?.housekeeping?.numberOfToilets ||
        "",
      pets_present:
        formData.petsPresent ||
        onboarding.steps?.housekeeping?.petsPresent ||
        "No",
      specify_pet_present:
        formData.petDetails || onboarding.steps?.housekeeping?.petDetails || "",
      additional_care:
        formData.additionalCare ||
        onboarding.steps?.housekeeping?.additionalCare ||
        [],
    };
  } else if (serviceCategory === "childcare") {
    job_data.details.child_information = {
      who_needs_care:
        formData.whoNeedsCare ||
        onboarding.steps?.childInfo?.whoNeedsCare ||
        "Nanny",
      childcare_type:
        formData.childcareType ||
        onboarding.steps?.childInfo?.childcareType ||
        "Full-Time Care",
      number_of_children:
        formData.numberOfChildren ||
        onboarding.steps?.childInfo?.numberOfChildren ||
        "1 child",
      children: (
        formData.childrenDetails ||
        onboarding.steps?.childInfo?.childrenDetails ||
        []
      ).map((child) => ({
        age: child.age || child.birthDate || "2021-05-15",
        gender: child.gender || "Male",
      })),
    };
    job_data.details.provider_experience_requirements = {
      communication_and_language: formData.communicationLanguage ||
        onboarding.steps?.experience?.communicationLanguage || [
          "Fluent in English",
        ],
      special_preferences:
        formData.specialPreferences ||
        onboarding.steps?.experience?.specialPreferences ||
        [],
      preferred_option: formData.preferredOption ||
        onboarding.steps?.experience?.preferredOption || ["Live-Out"],
      additional_care_categories:
        formData.additionalCareCategories ||
        onboarding.steps?.experience?.additionalCareCategories ||
        [],
    };
  } else if (serviceCategory === "elderly care") {
    job_data.details.elderly_information = {
      care_type:
        formData.elderlyCareType ||
        onboarding.steps?.elderlyInfo?.elderlyCareType ||
        "Companion",
      relationship:
        formData.relationshipWithElderly ||
        onboarding.steps?.elderlyInfo?.relationshipWithElderly ||
        "",
      age:
        formData.ageOfElderly ||
        onboarding.steps?.elderlyInfo?.ageOfElderly ||
        "",
      gender:
        formData.genderOfElderly ||
        onboarding.steps?.elderlyInfo?.genderOfElderly ||
        "",
      health_condition:
        formData.healthCondition ||
        onboarding.steps?.elderlyInfo?.healthCondition ||
        "",
    };
  } else if (serviceCategory === "tutoring") {
    job_data.details.tutoring_information = {
      subjects:
        formData.tutoringSubjects ||
        onboarding.steps?.tutoringInfo?.tutoringSubjects ||
        [],
      student_age:
        formData.studentAge || onboarding.steps?.tutoringInfo?.studentAge || "",
      current_grade:
        formData.currentGrade ||
        onboarding.steps?.tutoringInfo?.currentGrade ||
        "",
    };
  }

  const finalPayload = {
    job_data,
    title: onboarding.preview?.title || "Job Posting",
    summary: onboarding.preview?.summary || "Looking for care services",
    skills_and_expertise: onboarding.preview?.skills || [],
  };

  console.log(
    "📤 Sending payload to API:",
    JSON.stringify(finalPayload, null, 2)
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

      const res = await fetch(
        "https://backend.app.carenestpro.com/api/post/create/",
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data);
      }
      return data;
    } catch (err) {
      return rejectWithValue({ message: err.message || "Network error" });
    }
  }
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
