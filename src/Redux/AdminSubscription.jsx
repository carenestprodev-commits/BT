import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL } from './config'
import {fetchWithAuth} from "../lib/fetchWithAuth.js";

export const fetchSubscriptions = createAsyncThunk(
  'adminSubscription/fetchSubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/subscriptions/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return Array.isArray(data) ? data : (data.results || [])
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const fetchSubscriptionById = createAsyncThunk(
  'adminSubscription/fetchSubscriptionById',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/subscriptions/${id}/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

const slice = createSlice({
  name: 'adminSubscription',
  initialState: {
    subscriptions: [],
    loading: false,
    error: null,
    current: null,
    currentLoading: false,
    currentError: null,
  },
  reducers: {
    clearSubscriptions(state) {
      state.subscriptions = []
      state.loading = false
      state.error = null
    },
    clearCurrentSubscription(state) {
      state.current = null
      state.currentLoading = false
      state.currentError = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => { state.loading = false; state.subscriptions = action.payload })
      .addCase(fetchSubscriptions.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })

      .addCase(fetchSubscriptionById.pending, (state) => { state.currentLoading = true; state.currentError = null })
      .addCase(fetchSubscriptionById.fulfilled, (state, action) => { state.currentLoading = false; state.current = action.payload })
      .addCase(fetchSubscriptionById.rejected, (state, action) => { state.currentLoading = false; state.currentError = action.payload || action.error })
  }
})

export const { clearSubscriptions, clearCurrentSubscription } = slice.actions
export default slice.reducer
