import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
const BASE_URL = 'http://10.10.13.75:8088'

export const fetchSupportTickets = createAsyncThunk(
  'adminSupport/fetchSupportTickets',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/admin/support-tickets/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return Array.isArray(data) ? data : data.results || []
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const fetchSupportTicketById = createAsyncThunk(
  'adminSupport/fetchSupportTicketById',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/admin/support-tickets/${id}/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
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
  },
  reducers: {
    clearCurrentTicket(state) {
      state.current = null
      state.currentLoading = false
      state.currentError = null
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
  }
})

export const { clearCurrentTicket } = slice.actions
export default slice.reducer
