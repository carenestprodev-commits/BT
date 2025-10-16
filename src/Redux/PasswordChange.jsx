import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL, getAuthHeaders } from './config'

export const changePassword = createAsyncThunk(
  'password/changePassword',
  async ({ password, confirm_password }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/auth/profile/password_change/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ password, confirm_password }),
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
  name: 'passwordChange',
  initialState: {
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearPasswordState(state) {
      state.loading = false
      state.error = null
      state.success = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePassword.pending, (state) => { state.loading = true; state.error = null; state.success = null })
      .addCase(changePassword.fulfilled, (state, action) => { state.loading = false; state.success = action.payload || { message: 'ok' } })
      .addCase(changePassword.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })
  }
})

export const { clearPasswordState } = slice.actions
export default slice.reducer
