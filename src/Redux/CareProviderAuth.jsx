import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const BASE_URL = 'http://10.10.13.75:8088'
const LS_KEY = 'provider_onboarding'

const readLS = () => {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : { steps: {} }
  } catch {
    return { steps: {} }
  }
}

const writeLS = (data) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

export const registerAndCreateProfile = createAsyncThunk(
  'careProvider/registerAndCreateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/provider/public-onboarding/register-and-create-profile/`, {
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

const slice = createSlice({
  name: 'careProvider',
  initialState,
  reducers: {
    saveStep(state, action) {
      const { stepName, data } = action.payload
      state.steps = { ...state.steps, [stepName]: data }
      writeLS(state)
    },
    clearOnboarding(state) {
      state.steps = {}
      writeLS(state)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerAndCreateProfile.fulfilled, (state, action) => {
        state.registerResponse = action.payload
        writeLS(state)
      })
  }
})

export const { saveStep, clearOnboarding } = slice.actions

export default slice.reducer
