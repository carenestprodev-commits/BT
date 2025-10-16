import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL } from './config'

const LS_KEY = 'seeker_onboarding'

const readLS = () => {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : { steps: {}, preview: null }
  } catch (e) {
    return { steps: {}, preview: null }
  }
}

const writeLS = (data) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  } catch (e) {
    // ignore
  }
}

// Async thunk to generate preview
export const generatePreview = createAsyncThunk(
  'careSeeker/generatePreview',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/seeker/public-onboarding/generate-preview/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text()
        return rejectWithValue(text)
      }
      const data = await res.json()
      // append response to localStorage flow
      const ls = readLS()
      ls.preview = data
      writeLS(ls)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// Async thunk to register and publish
export const registerAndPublish = createAsyncThunk(
  'careSeeker/registerAndPublish',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/seeker/public-onboarding/register-and-publish/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text()
        return rejectWithValue(text)
      }
      const data = await res.json()
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const initialState = readLS()

// Helper to build API payload from current steps
export const buildPayloadFromSteps = (steps) => {
  const payload = {
    service_category: steps.careCategory?.toLowerCase() || "childcare",
    details: {
      location_information: {
        use_current_location: steps.location?.useCurrentLocation || false,
        preferred_language: steps.location?.preferredLanguage || "Select language",
        country: steps.location?.country || "Select country", 
        state: steps.location?.state || "Select state",
        city: steps.location?.city || "Input city",
        zip_code: steps.location?.zipCode || "Input zip code",
        nationality: steps.location?.nationality || "Input nationality"
      }
    },
    job_type: steps.timeDetails?.scheduleType?.toLowerCase() === 'one-off' ? 'one-time' : 'recurring',
    start_date: steps.timeDetails?.startDate || "2025-11-10",
    end_date: steps.timeDetails?.endDate || "2026-02-10", 
    start_time: steps.timeDetails?.startTime || "09:00:00",
    end_time: steps.timeDetails?.endTime || "17:00:00",
    recurrence_pattern: {
      frequency: steps.timeDetails?.repeatFrequency?.toLowerCase() || "weekly",
      days: steps.timeDetails?.repeatDays || ["Monday", "Wednesday", "Friday"]
    },
    price_min: steps.timeDetails?.priceMin || "35.00",
    price_max: steps.timeDetails?.priceMax || "55.00"
  }

  // Add service-specific details
  if (steps.careCategory === 'Childcare') {
    payload.details.child_information = {
      care_type: steps.childInfo?.childcareType || "Nanny",
      number_of_children: steps.childInfo?.numberOfChildren || "1 child",
      children: (steps.childInfo?.childrenDetails || []).map(child => ({
        age: parseInt(child.age) || 15,
        gender: child.gender || "Male"
      }))
    }
    payload.details.provider_experience = {
      languages: steps.experience?.communicationLanguage || ["English"],
      special_preferences: steps.experience?.specialPreferences || [],
      preferred_option: (steps.experience?.preferredOption || ["Live-Out"])[0] || "Live-Out"
    }
  }

  return payload
}

const slice = createSlice({
  name: 'careSeeker',
  initialState,
  reducers: {
    saveStep(state, action) {
      // action.payload: { stepName: string, data: object }
      const { stepName, data } = action.payload
      state.steps = { ...state.steps, [stepName]: data }
      writeLS(state)
    },
    clearOnboarding(state) {
      state.steps = {}
      state.preview = null
      writeLS(state)
    },
    appendPreview(state, action) {
      state.preview = action.payload
      writeLS(state)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generatePreview.fulfilled, (state, action) => {
        state.preview = action.payload
        writeLS(state)
      })
      .addCase(registerAndPublish.fulfilled, (state, action) => {
        state.registerResponse = action.payload
        writeLS(state)
      })
  }
})

export const { saveStep, clearOnboarding, appendPreview } = slice.actions

export default slice.reducer
