import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL, getAuthHeaders } from './config'
import {fetchWithAuth} from "../lib/fetchWithAuth.js";

export const fetchSupportTickets = createAsyncThunk(
  'adminSupport/fetchSupportTickets',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/support-tickets/`, { headers: getAuthHeaders() })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        return rejectWithValue(data || 'Failed')
      }
      const data = await res.json()
      return Array.isArray(data) ? data : data.results || []
    } catch (err) {
      return rejectWithValue({ error: 'Network error', details: err.message })
    }
  }
)

export const fetchSupportTicketById = createAsyncThunk(
  'adminSupport/fetchSupportTicketById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/support-tickets/${id}/`, { headers: getAuthHeaders() })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        return rejectWithValue(data || 'Failed')
      }
      const data = await res.json()
      return data
    } catch (err) {
      return rejectWithValue({ error: 'Network error', details: err.message })
    }
  }
)

export const postSupportAction = createAsyncThunk(
  'adminSupport/postSupportAction',
  async ({ id, action, message }, { rejectWithValue, dispatch }) => {
    try {
      const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() }
      const body = JSON.stringify({ action, ...(message ? { message } : {}) })
      const res = await fetch(`${BASE_URL}/api/admin/support-tickets/${id}/`, {
        method: 'POST',
        headers,
        body,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        return rejectWithValue(data || 'Failed')
      }
      const data = await res.json()
      // refresh list so UI reflects updated statuses
  try { dispatch(fetchSupportTickets()) } catch { /* ignore */ }
      return data
    } catch (err) {
      return rejectWithValue({ error: 'Network error', details: err.message })
    }
  }
)

const slice = createSlice({
  name: 'adminSupport',
  initialState: {
    tickets: [],
    current: null,
    loading: false,
    error: null,
    currentLoading: false,
    currentError: null,
    actionLoading: false,
    actionError: null,
    actionSuccess: null,
  },
  reducers: {
    clearCurrentTicket(state) {
      state.current = null
      state.currentLoading = false
      state.currentError = null
    },
    clearActionStatus(state) {
      state.actionLoading = false
      state.actionError = null
      state.actionSuccess = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupportTickets.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchSupportTickets.fulfilled, (state, action) => { state.loading = false; state.tickets = action.payload })
      .addCase(fetchSupportTickets.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })

      .addCase(fetchSupportTicketById.pending, (state) => { state.currentLoading = true; state.currentError = null })
      .addCase(fetchSupportTicketById.fulfilled, (state, action) => { state.currentLoading = false; state.current = action.payload })
      .addCase(fetchSupportTicketById.rejected, (state, action) => { state.currentLoading = false; state.currentError = action.payload || action.error })

      .addCase(postSupportAction.pending, (state) => { state.actionLoading = true; state.actionError = null; state.actionSuccess = null })
      .addCase(postSupportAction.fulfilled, (state, action) => { state.actionLoading = false; state.actionSuccess = action.payload || { status: 'ok' } })
      .addCase(postSupportAction.rejected, (state, action) => { state.actionLoading = false; state.actionError = action.payload || action.error })
  }
})

export const { clearCurrentTicket, clearActionStatus } = slice.actions
export default slice.reducer
