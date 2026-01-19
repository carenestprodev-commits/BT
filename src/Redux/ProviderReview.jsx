import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL, getAuthHeaders } from './config'
import {fetchWithAuth} from "../lib/fetchWithAuth.js";

export const postProviderReview = createAsyncThunk(
  'providerReview/post',
  async ({ booking_id, rating, comment }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders()
      const res = await fetchWithAuth(`${BASE_URL}/api/reviews/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ booking_id, rating, comment })
      })
      const text = await res.text()
      let parsed
      try { parsed = JSON.parse(text) } catch { parsed = text }
      if (!res.ok) return rejectWithValue(parsed)
      return parsed
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const slice = createSlice({
  name: 'providerReview',
  initialState: {
    submit: {
      loading: false,
      error: null,
      response: null,
    }
  },
  reducers: {
    clearReviewState(state) {
      state.submit = { loading: false, error: null, response: null }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(postProviderReview.pending, (state) => {
        state.submit.loading = true
        state.submit.error = null
        state.submit.response = null
      })
      .addCase(postProviderReview.fulfilled, (state, action) => {
        state.submit.loading = false
        state.submit.response = action.payload
      })
      .addCase(postProviderReview.rejected, (state, action) => {
        state.submit.loading = false
        state.submit.error = action.payload || action.error
      })
  }
})

export const { clearReviewState } = slice.actions
export default slice.reducer
