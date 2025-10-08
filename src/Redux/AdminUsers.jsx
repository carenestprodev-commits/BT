import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const BASE_URL = 'http://10.10.13.75:8088'

export const fetchAdminStats = createAsyncThunk(
  'adminUsers/fetchAdminStats',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/admin/stats`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const fetchAllUsers = createAsyncThunk(
  'adminUsers/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/admin/users/all/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return Array.isArray(data) ? data : []
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const fetchUserById = createAsyncThunk(
  'adminUsers/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/admin/users/${id}/`, { headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const deleteUser = createAsyncThunk(
  'adminUsers/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/admin/users/${id}/`, { method: 'DELETE', headers })
      if (res.status === 204 || res.ok) {
        return id
      }
      const data = await res.json()
      return rejectWithValue(data)
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const suspendUser = createAsyncThunk(
  'adminUsers/suspendUser',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
      const res = await fetch(`${BASE_URL}/api/admin/users/${id}/suspend/`, { method: 'POST', headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      // return the id so reducers can update the store
      return { id, data }
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

export const activateUser = createAsyncThunk(
  'adminUsers/activateUser',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
      const res = await fetch(`${BASE_URL}/api/admin/users/${id}/activate/`, { method: 'POST', headers })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return { id, data }
    } catch {
      return rejectWithValue({ error: 'Network error' })
    }
  }
)

const slice = createSlice({
  name: 'adminUsers',
  initialState: {
    stats: { total_users: 0, total_providers: 0, total_seekers: 0, new_sign_ups: 0 },
    users: [],
    currentUser: null,
    loading: false,
    error: null,
    usersLoading: false,
    usersError: null,
    currentUserLoading: false,
    currentUserError: null,
    deleteLoading: false,
    deleteError: null,
    suspendLoading: false,
    suspendError: null,
  },
  reducers: {
    clearAdminUsers(state) {
      state.users = []
      state.stats = { total_users: 0, total_providers: 0, total_seekers: 0, new_sign_ups: 0 }
      state.loading = false
      state.error = null
    }
    ,
    clearCurrentUser(state) {
      state.currentUser = null
      state.currentUserLoading = false
      state.currentUserError = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchAdminStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload })
      .addCase(fetchAdminStats.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })

      .addCase(fetchAllUsers.pending, (state) => { state.usersLoading = true; state.usersError = null })
      .addCase(fetchAllUsers.fulfilled, (state, action) => { state.usersLoading = false; state.users = action.payload })
      .addCase(fetchAllUsers.rejected, (state, action) => { state.usersLoading = false; state.usersError = action.payload || action.error })

      .addCase(fetchUserById.pending, (state) => { state.currentUserLoading = true; state.currentUserError = null })
      .addCase(fetchUserById.fulfilled, (state, action) => { state.currentUserLoading = false; state.currentUser = action.payload })
      .addCase(fetchUserById.rejected, (state, action) => { state.currentUserLoading = false; state.currentUserError = action.payload || action.error })

      .addCase(deleteUser.pending, (state) => { state.deleteLoading = true; state.deleteError = null })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteLoading = false
        const id = action.payload
        state.users = state.users.filter(u => u.id !== id)
      })
      .addCase(deleteUser.rejected, (state, action) => { state.deleteLoading = false; state.deleteError = action.payload || action.error })

      .addCase(suspendUser.pending, (state) => { state.suspendLoading = true; state.suspendError = null })
      .addCase(suspendUser.fulfilled, (state, action) => {
        state.suspendLoading = false
        const id = action.payload?.id
        // mark the user as not active in the users list
        if (id != null) {
          state.users = state.users.map(u => u.id === id ? { ...u, is_active: false } : u)
        }
        // also update currentUser if it's the same
        if (state.currentUser && state.currentUser.id === id) {
          state.currentUser = { ...state.currentUser, is_active: false }
        }
      })
      .addCase(suspendUser.rejected, (state, action) => { state.suspendLoading = false; state.suspendError = action.payload || action.error })

      .addCase(activateUser.pending, (state) => { state.suspendLoading = true; state.suspendError = null })
      .addCase(activateUser.fulfilled, (state, action) => {
        state.suspendLoading = false
        const id = action.payload?.id
        if (id != null) {
          state.users = state.users.map(u => u.id === id ? { ...u, is_active: true } : u)
        }
        if (state.currentUser && state.currentUser.id === id) {
          state.currentUser = { ...state.currentUser, is_active: true }
        }
      })
      .addCase(activateUser.rejected, (state, action) => { state.suspendLoading = false; state.suspendError = action.payload || action.error })
  }
})

export const { clearAdminUsers, clearCurrentUser } = slice.actions
export default slice.reducer
