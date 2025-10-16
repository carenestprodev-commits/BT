import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL, getAuthHeaders } from './config'

export const fetchWalletDashboard = createAsyncThunk('providerWallet/fetchDashboard', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/payments/wallet/provider-dashboard/`, { headers: getAuthHeaders() })
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

export const fetchWalletHistory = createAsyncThunk('providerWallet/fetchHistory', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/payments/wallet/history/`, { headers: getAuthHeaders() })
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
  name: 'providerWallet',
  initialState: {
    dashboard: { current_balance: 0, total_hours: 0 },
    history: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletDashboard.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchWalletDashboard.fulfilled, (state, action) => { state.loading = false; state.dashboard = action.payload || { current_balance: 0, total_hours: 0 } })
      .addCase(fetchWalletDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message })

      .addCase(fetchWalletHistory.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchWalletHistory.fulfilled, (state, action) => { state.loading = false; state.history = action.payload || [] })
      .addCase(fetchWalletHistory.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message })
  }
})

export default slice.reducer
