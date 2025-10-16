import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL } from './config'

// Fetch seeker dashboard summary
export const fetchSeekerDashboard = createAsyncThunk(
  'seekerDashboard/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/seeker/dashboard/`, { headers })
      const text = await res.text()
      // try to parse json, otherwise return text
      let parsed
      try { parsed = JSON.parse(text) } catch { parsed = text }
      if (!res.ok) return rejectWithValue(parsed)
      return parsed
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const initialState = {
  loading: false,
  error: null,
  greeting_name: null,
  new_care_provider_requests: 0,
  total_amount_spent: 0,
}

const slice = createSlice({
  name: 'seekerDashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeekerDashboard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSeekerDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.greeting_name = action.payload.greeting_name || state.greeting_name
        state.new_care_provider_requests = action.payload.new_care_provider_requests ?? state.new_care_provider_requests
        state.total_amount_spent = action.payload.total_amount_spent ?? state.total_amount_spent
      })
      .addCase(fetchSeekerDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })
  }
})

export default slice.reducer
