import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL } from './config'

export const fetchVerifications = createAsyncThunk(
  'verification/fetchVerifications',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/admin/verifications/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return Array.isArray(data) ? data : data.results || []
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const fetchVerificationById = createAsyncThunk(
  'verification/fetchVerificationById',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/admin/verifications/${id}/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const postVerificationAction = createAsyncThunk(
  'verification/postVerificationAction',
  async ({ id, action, feedback }, { rejectWithValue, dispatch }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = { 'Content-Type': 'application/json' }
      if (access) headers['Authorization'] = `Bearer ${access}`
      const body = JSON.stringify({ action, ...(feedback ? { feedback } : {}) })
      const res = await fetch(`${BASE_URL}/api/admin/verifications/${id}/`, {
        method: 'POST',
        headers,
        body,
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
  try { dispatch(fetchVerifications()) } catch { /* ignore refresh error */ }
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const uploadVerificationId = createAsyncThunk(
  'verification/uploadVerificationId',
  async (file, { rejectWithValue, dispatch }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = {}
      if (access) headers['Authorization'] = `Bearer ${access}`

      const form = new FormData()
      form.append('government_id', file)

      const res = await fetch(`${BASE_URL}/api/auth/profile/upload-verification-id/`, {
        method: 'POST',
        headers,
        body: form,
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      // optionally refresh list
      try { dispatch(fetchVerifications()) } catch { /* ignore */ }
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

const slice = createSlice({
  name: 'verification',
  initialState: {
    items: [],
    loading: false,
    error: null,
    current: null,
    currentLoading: false,
    currentError: null,
    actionLoading: false,
    actionError: null,
    actionSuccess: null,
    uploadLoading: false,
    uploadError: null,
    uploadSuccess: null,
  },
  reducers: {
    clearCurrentVerification(state) {
      state.current = null
      state.currentLoading = false
      state.currentError = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVerifications.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchVerifications.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchVerifications.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })

      .addCase(fetchVerificationById.pending, (state) => { state.currentLoading = true; state.currentError = null })
      .addCase(fetchVerificationById.fulfilled, (state, action) => { state.currentLoading = false; state.current = action.payload })
      .addCase(fetchVerificationById.rejected, (state, action) => { state.currentLoading = false; state.currentError = action.payload || action.error })

      .addCase(postVerificationAction.pending, (state) => { state.actionLoading = true; state.actionError = null; state.actionSuccess = null })
      .addCase(postVerificationAction.fulfilled, (state, action) => { state.actionLoading = false; state.actionSuccess = action.payload || { status: 'ok' } })
      .addCase(postVerificationAction.rejected, (state, action) => { state.actionLoading = false; state.actionError = action.payload || action.error })

  .addCase(uploadVerificationId.pending, (state) => { state.uploadLoading = true; state.uploadError = null; state.uploadSuccess = null })
  .addCase(uploadVerificationId.fulfilled, (state, action) => { state.uploadLoading = false; state.uploadSuccess = action.payload || { message: 'ok' } })
  .addCase(uploadVerificationId.rejected, (state, action) => { state.uploadLoading = false; state.uploadError = action.payload || action.error })
  }
})

export const { clearCurrentVerification } = slice.actions
export const clearActionStatus = () => ({ type: 'verification/clearActionStatus' })
// simple reducer to clear action flags handled below in a small reducer injection
const originalReducer = slice.reducer

const wrappedReducer = (state, action) => {
  if (action.type === 'verification/clearActionStatus') {
    return { ...state, actionLoading: false, actionError: null, actionSuccess: null }
  }
  return originalReducer(state, action)
}

export default wrappedReducer
