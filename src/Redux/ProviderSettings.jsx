import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL, getAuthHeaders } from './config'
import {fetchWithAuth} from "../lib/fetchWithAuth.js";

export const fetchProviderProfile = createAsyncThunk('providerSettings/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}/api/auth/profile/info/`, { headers: getAuthHeaders() })
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
  name: 'providerSettings',
  initialState: {
    profile: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviderProfile.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchProviderProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload })
      .addCase(fetchProviderProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message })
  }
})

export default slice.reducer
