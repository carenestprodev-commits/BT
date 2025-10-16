import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL, getAuthHeaders } from './config'

export const fetchActiveRequests = createAsyncThunk('careProviderRequests/fetchActive', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/provider/requests/active/`, { headers: getAuthHeaders() })
    if (!res.ok) {
      const text = await res.text()
      return rejectWithValue(text)
    }
    const data = await res.json()
    return data
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const fetchClosedRequests = createAsyncThunk('careProviderRequests/fetchClosed', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/provider/requests/closed/`, { headers: getAuthHeaders() })
    if (!res.ok) {
      const text = await res.text()
      return rejectWithValue(text)
    }
    const data = await res.json()
    return data
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const fetchPendingRequests = createAsyncThunk('careProviderRequests/fetchPending', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/provider/requests/pending/`, { headers: getAuthHeaders() })
    if (!res.ok) {
      const text = await res.text()
      return rejectWithValue(text)
    }
    const data = await res.json()
    return data
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const fetchRequestById = createAsyncThunk('careProviderRequests/fetchById', async ({ id, status = 'closed' }, { rejectWithValue }) => {
  try {
    // status typically 'closed' but can be 'active' or 'pending' depending on endpoint
    const res = await fetch(`${BASE_URL}/api/provider/requests/${status}/${id}/`, { headers: getAuthHeaders() })
    if (!res.ok) {
      const text = await res.text()
      return rejectWithValue(text)
    }
    const data = await res.json()
    return data
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const postReview = createAsyncThunk('careProviderRequests/postReview', async ({ booking_id, rating, comment }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/reviews/for-seeker/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ booking_id, rating, comment })
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
})

const slice = createSlice({
  name: 'careProviderRequests',
  initialState: {
    active: [],
    closed: [],
    pending: [],
    current: null,
    currentLoading: false,
    currentError: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveRequests.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchActiveRequests.fulfilled, (state, action) => { state.loading = false; state.active = action.payload || [] })
      .addCase(fetchActiveRequests.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message })

      .addCase(fetchClosedRequests.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchClosedRequests.fulfilled, (state, action) => { state.loading = false; state.closed = action.payload || [] })
      .addCase(fetchClosedRequests.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message })

      .addCase(fetchPendingRequests.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => { state.loading = false; state.pending = action.payload || [] })
      .addCase(fetchPendingRequests.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message })

      .addCase(fetchRequestById.pending, (state) => { state.currentLoading = true; state.currentError = null })
      .addCase(fetchRequestById.fulfilled, (state, action) => { state.currentLoading = false; state.current = action.payload })
      .addCase(fetchRequestById.rejected, (state, action) => { state.currentLoading = false; state.currentError = action.payload || action.error.message })
  }
})

export default slice.reducer
