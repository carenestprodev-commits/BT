import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL } from './config'

export const fetchJobsFeed = createAsyncThunk(
  'jobsFeed/fetchJobsFeed',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/jobs/feed/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return Array.isArray(data) ? data : []
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const fetchJobById = createAsyncThunk(
  'jobsFeed/fetchJobById',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/jobs/feed/${encodeURIComponent(id)}/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const submitBooking = createAsyncThunk(
  'jobsFeed/submitBooking',
  async (jobRequestId, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = { 'Content-Type': 'application/json' }
      if (access) headers['Authorization'] = `Bearer ${access}`

      const res = await fetch(`${BASE_URL}/api/provider/applications/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ job_request_id: jobRequestId }),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

const slice = createSlice({
  name: 'jobsFeed',
  initialState: { jobs: [], selectedJob: null, loading: false, error: null, bookingLoading: false, bookingError: null, bookingResponse: null },
  reducers: {
    clearJobs(state) { state.jobs = []; state.selectedJob = null; state.loading = false; state.error = null },
    clearSelectedJob(state) { state.selectedJob = null }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobsFeed.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchJobsFeed.fulfilled, (state, action) => { state.loading = false; state.jobs = action.payload })
      .addCase(fetchJobsFeed.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })
      .addCase(fetchJobById.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchJobById.fulfilled, (state, action) => { state.loading = false; state.selectedJob = action.payload })
      .addCase(fetchJobById.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })
      .addCase(submitBooking.pending, (state) => { state.bookingLoading = true; state.bookingError = null; state.bookingResponse = null })
      .addCase(submitBooking.fulfilled, (state, action) => { state.bookingLoading = false; state.bookingResponse = action.payload })
      .addCase(submitBooking.rejected, (state, action) => { state.bookingLoading = false; state.bookingError = action.payload || action.error })
  }
})

export const { clearJobs, clearSelectedJob } = slice.actions
export default slice.reducer
