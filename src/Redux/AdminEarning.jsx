import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL } from './config'
import {fetchWithAuth} from "../lib/fetchWithAuth.js";

export const fetchEarningsStats = createAsyncThunk(
  'adminEarning/fetchEarningsStats',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/earnings/stats/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const fetchSeekerTransactions = createAsyncThunk(
  'adminEarning/fetchSeekerTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/earnings/seeker-transactions/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return Array.isArray(data) ? data : []
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const fetchPlatformTransactions = createAsyncThunk(
  'adminEarning/fetchPlatformTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/earnings/platform-transactions/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return Array.isArray(data) ? data : []
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const fetchProviderEarnings = createAsyncThunk(
  'adminEarning/fetchProviderEarnings',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/earnings/provider-transactions/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return Array.isArray(data) ? data : []
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const fetchProviderEarningById = createAsyncThunk(
  'adminEarning/fetchProviderEarningById',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/earnings/provider-transactions/${id}/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const fetchTransactionById = createAsyncThunk(
  'adminEarning/fetchTransactionById',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/earnings/transactions/${id}/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

const slice = createSlice({
  name: 'adminEarning',
  initialState: {
    stats: { care_seekers_earnings: 0, platform_earnings: 0 },
    seekerTransactions: [],
    platformTransactions: [],
    providerEarnings: [],
    currentTransaction: null,
    currentProviderEarning: null,
    loading: false,
    error: null,
    seekerLoading: false,
    seekerError: null,
    platformLoading: false,
    platformError: null,
    currentLoading: false,
    currentError: null,
  },
  reducers: {
    clearCurrentTransaction(state) {
      state.currentTransaction = null
      state.currentLoading = false
      state.currentError = null
    },
    clearCurrentProviderEarning(state) {
      state.currentProviderEarning = null
      state.currentLoading = false
      state.currentError = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEarningsStats.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchEarningsStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload })
      .addCase(fetchEarningsStats.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })

      .addCase(fetchSeekerTransactions.pending, (state) => { state.seekerLoading = true; state.seekerError = null })
      .addCase(fetchSeekerTransactions.fulfilled, (state, action) => { state.seekerLoading = false; state.seekerTransactions = action.payload })
      .addCase(fetchSeekerTransactions.rejected, (state, action) => { state.seekerLoading = false; state.seekerError = action.payload || action.error })

      .addCase(fetchPlatformTransactions.pending, (state) => { state.platformLoading = true; state.platformError = null })
      .addCase(fetchPlatformTransactions.fulfilled, (state, action) => { state.platformLoading = false; state.platformTransactions = action.payload })
      .addCase(fetchPlatformTransactions.rejected, (state, action) => { state.platformLoading = false; state.platformError = action.payload || action.error })

      .addCase(fetchProviderEarnings.pending, (state) => { state.providerLoading = true; state.providerError = null })
      .addCase(fetchProviderEarnings.fulfilled, (state, action) => { state.providerLoading = false; state.providerEarnings = action.payload })
      .addCase(fetchProviderEarnings.rejected, (state, action) => { state.providerLoading = false; state.providerError = action.payload || action.error })

      .addCase(fetchProviderEarningById.pending, (state) => { state.currentLoading = true; state.currentError = null; state.currentProviderEarning = null })
      .addCase(fetchProviderEarningById.fulfilled, (state, action) => { state.currentLoading = false; state.currentProviderEarning = action.payload })
      .addCase(fetchProviderEarningById.rejected, (state, action) => { state.currentLoading = false; state.currentError = action.payload || action.error })

      .addCase(fetchTransactionById.pending, (state) => { state.currentLoading = true; state.currentError = null })
      .addCase(fetchTransactionById.fulfilled, (state, action) => { state.currentLoading = false; state.currentTransaction = action.payload })
      .addCase(fetchTransactionById.rejected, (state, action) => { state.currentLoading = false; state.currentError = action.payload || action.error })
  }
})

export const { clearCurrentTransaction, clearCurrentProviderEarning } = slice.actions
export default slice.reducer
