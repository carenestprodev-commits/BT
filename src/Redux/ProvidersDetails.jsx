import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL } from './config'
import {fetchWithAuth} from "../lib/fetchWithAuth.js";

export const fetchProviderDetails = createAsyncThunk(
  'providersDetails/fetchProviderDetails',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetchWithAuth(`${BASE_URL}/api/providers_details/${encodeURIComponent(id)}/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

const slice = createSlice({
  name: 'providersDetails',
  initialState: {
    details: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProviderDetails(state) {
      state.details = null
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviderDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProviderDetails.fulfilled, (state, action) => {
        state.loading = false
        state.details = action.payload
      })
      .addCase(fetchProviderDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error
      })
  }
})

export const { clearProviderDetails } = slice.actions
export default slice.reducer
