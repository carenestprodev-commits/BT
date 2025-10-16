import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL } from './config'

export const fetchActivitiesStats = createAsyncThunk(
  'adminActivities/fetchActivitiesStats',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/admin/activities/stats/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const fetchAllActivities = createAsyncThunk(
  'adminActivities/fetchAllActivities',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/admin/activities/all/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return Array.isArray(data) ? data : []
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const fetchActivityById = createAsyncThunk(
  'adminActivities/fetchActivityById',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/admin/activities/${id}/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const deleteActivity = createAsyncThunk(
  'adminActivities/deleteActivity',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/admin/activities/${id}/`, { method: 'DELETE', headers })
      if (res.status === 204 || res.ok) return id
      const data = await res.json()
      return rejectWithValue(data)
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

const slice = createSlice({
  name: 'adminActivities',
  initialState: {
    stats: { all_activities: 0, fulfilled_requests: 0, pending_approval: 0, ongoing_activities: 0 },
    activities: [],
    currentActivity: null,
    loading: false,
    error: null,
    activitiesLoading: false,
    activitiesError: null,
    currentLoading: false,
    currentError: null,
    deleteLoading: false,
    deleteError: null,
  },
  reducers: {
    clearCurrentActivity(state) {
      state.currentActivity = null
      state.currentLoading = false
      state.currentError = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivitiesStats.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchActivitiesStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload })
      .addCase(fetchActivitiesStats.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })

      .addCase(fetchAllActivities.pending, (state) => { state.activitiesLoading = true; state.activitiesError = null })
      .addCase(fetchAllActivities.fulfilled, (state, action) => { state.activitiesLoading = false; state.activities = action.payload })
      .addCase(fetchAllActivities.rejected, (state, action) => { state.activitiesLoading = false; state.activitiesError = action.payload || action.error })

      .addCase(fetchActivityById.pending, (state) => { state.currentLoading = true; state.currentError = null })
      .addCase(fetchActivityById.fulfilled, (state, action) => { state.currentLoading = false; state.currentActivity = action.payload })
      .addCase(fetchActivityById.rejected, (state, action) => { state.currentLoading = false; state.currentError = action.payload || action.error })

      .addCase(deleteActivity.pending, (state) => { state.deleteLoading = true; state.deleteError = null })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.deleteLoading = false
        const id = action.payload
        state.activities = state.activities.filter(a => String(a.request_id) !== String(id))
      })
      .addCase(deleteActivity.rejected, (state, action) => { state.deleteLoading = false; state.deleteError = action.payload || action.error })
  }
})

export const { clearCurrentActivity } = slice.actions
export default slice.reducer
