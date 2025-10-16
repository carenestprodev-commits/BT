import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL } from './config'

// Helpers to map server responses into the UI-friendly shape expected by Requests.jsx
const formatDateShort = (iso) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch { return '' }
}

const formatTimeRange = (start, end) => {
  try {
    const format = (s) => {
      if (!s) return ''
      if (s.includes(':')) {
        const [hh, mm] = s.split(':')
        return `${hh}:${mm}`
      }
      const d = new Date(s)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    const sStr = format(start)
    const eStr = format(end)
    if (sStr && eStr) return `${sStr} - ${eStr}`
    return sStr || eStr || ''
  } catch { return '' }
}

const avatarFromName = (name) => {
  const safe = encodeURIComponent(name || 'User')
  return `https://ui-avatars.com/api/?name=${safe}&background=E5E7EB&color=374151&size=64`
}

export const fetchSeekerActiveRequests = createAsyncThunk(
  'seekerRequests/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/seeker/requests/active/`, { headers })
      const text = await res.text()
      let parsed
      try { parsed = JSON.parse(text) } catch { parsed = text }
      if (!res.ok) return rejectWithValue(parsed)
      const arr = Array.isArray(parsed) ? parsed : []
      // normalize to UI shape
      const mapped = arr.map(item => ({
        id: item.id,
        day: formatDateShort(item.date || item.created_at),
        date: item.date ? (new Date(item.date).getDate()) : (item.created_at ? new Date(item.created_at).getDate() : ''),
        title: item.title || item.job_title || (item.job && item.job.title) || '',
        time: formatTimeRange(item.start_time || item.hired_at, item.end_time || item.completed_at) || '',
        avatar: item.provider?.user?.full_name ? avatarFromName(item.provider.user.full_name) : avatarFromName('Provider'),
        provider: item.provider,
      }))
      return mapped
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchSeekerClosedRequests = createAsyncThunk(
  'seekerRequests/fetchClosed',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/seeker/requests/closed/`, { headers })
      const text = await res.text()
      let parsed
      try { parsed = JSON.parse(text) } catch { parsed = text }
      if (!res.ok) return rejectWithValue(parsed)
      const arr = Array.isArray(parsed) ? parsed : []
      const mapped = arr.map(item => ({
        id: item.id,
        name: item.provider?.user?.full_name || item.title || 'Provider',
        dateRange: item.hired_at || item.completed_at ? `${formatDateShort(item.hired_at)} - ${formatDateShort(item.completed_at)}` : (item.posted_ago || item.posted || ''),
        rating: Math.round(item.provider?.average_rating ?? item.review?.rating ?? 0),
        review: item.review?.text || item.provider?.about_me || item.summary || '',
        avatar: item.provider?.user?.full_name ? avatarFromName(item.provider.user.full_name) : avatarFromName('Provider'),
        provider: item.provider,
      }))
      return mapped
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchSeekerPendingRequests = createAsyncThunk(
  'seekerRequests/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/seeker/requests/pending/`, { headers })
      const text = await res.text()
      let parsed
      try { parsed = JSON.parse(text) } catch { parsed = text }
      if (!res.ok) return rejectWithValue(parsed)
      const arr = Array.isArray(parsed) ? parsed : []
      const mapped = arr.map(item => ({
        id: item.id,
        posted: item.posted_ago || item.posted || 'Posted just now',
        title: item.title || item.summary || '',
        desc: item.summary || item.message_to_provider || '',
        price_min: item.price_min,
        price_max: item.price_max,
      }))
      return mapped
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchSeekerRequestDetails = createAsyncThunk(
  'seekerRequests/fetchRequestDetails',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/seeker/requests/closed/${encodeURIComponent(id)}/`, { headers })
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

export const fetchPendingRequestById = createAsyncThunk(
  'seekerRequests/fetchPendingById',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/seeker/requests/pending/${encodeURIComponent(id)}/`, { headers })
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

export const deletePendingRequest = createAsyncThunk(
  'seekerRequests/deletePending',
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = access ? { 'Authorization': `Bearer ${access}` } : {}
      const res = await fetch(`${BASE_URL}/api/seeker/requests/pending/${encodeURIComponent(id)}/`, { method: 'DELETE', headers })
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

export const patchPendingRequest = createAsyncThunk(
  'seekerRequests/patchPending',
  async ({ id, summary, skills }, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = {
        'Content-Type': 'application/json',
        ...(access ? { 'Authorization': `Bearer ${access}` } : {})
      }
      const body = { summary, skills_and_expertise: skills }
      const res = await fetch(`${BASE_URL}/api/seeker/requests/pending/${encodeURIComponent(id)}/`, { method: 'PATCH', headers, body: JSON.stringify(body) })
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

export const submitReview = createAsyncThunk(
  'seekerRequests/submitReview',
  async ({ booking_id, rating, comment }, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem('access')
      const headers = {
        'Content-Type': 'application/json',
        ...(access ? { 'Authorization': `Bearer ${access}` } : {})
      }
      const res = await fetch(`${BASE_URL}/api/reviews/`, {
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
  name: 'seekerRequests',
  initialState: {
    active: [],
    closed: [],
    currentRequest: null,
    pending: [],
    loading: false,
    error: null,
    submit: {
      loading: false,
      error: null,
      response: null,
    }
    ,
    edit: {
      loading: false,
      error: null,
      response: null,
    },
    remove: {
      loading: false,
      error: null,
      response: null,
    }
  },
  reducers: {
    clearCurrentRequest(state) {
      state.currentRequest = null
      state.submit = { loading: false, error: null, response: null }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeekerActiveRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSeekerActiveRequests.fulfilled, (state, action) => {
        state.loading = false
        state.active = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchSeekerActiveRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error
      })

      .addCase(fetchSeekerClosedRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSeekerClosedRequests.fulfilled, (state, action) => {
        state.loading = false
        state.closed = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchSeekerClosedRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error
      })

      .addCase(fetchSeekerPendingRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSeekerPendingRequests.fulfilled, (state, action) => {
        state.loading = false
        state.pending = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchSeekerPendingRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error
      })
      
      // single request details
      .addCase(fetchSeekerRequestDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSeekerRequestDetails.fulfilled, (state, action) => {
        state.loading = false
        state.currentRequest = action.payload
      })
      .addCase(fetchSeekerRequestDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error
      })

      // submit review
      .addCase(submitReview.pending, (state) => {
        state.submit.loading = true
        state.submit.error = null
        state.submit.response = null
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submit.loading = false
        state.submit.response = action.payload
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submit.loading = false
        state.submit.error = action.payload || action.error
      })

      // fetch single pending request by id
      .addCase(fetchPendingRequestById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPendingRequestById.fulfilled, (state, action) => {
        state.loading = false
        state.currentRequest = action.payload
      })
      .addCase(fetchPendingRequestById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error
      })

      // delete pending request
      .addCase(deletePendingRequest.pending, (state) => {
        state.remove.loading = true
        state.remove.error = null
        state.remove.response = null
      })
      .addCase(deletePendingRequest.fulfilled, (state, action) => {
        state.remove.loading = false
        state.remove.response = action.payload
        // also remove from pending list if present
        if (state.pending) state.pending = state.pending.filter(p => p.id !== (action.meta.arg))
      })
      .addCase(deletePendingRequest.rejected, (state, action) => {
        state.remove.loading = false
        state.remove.error = action.payload || action.error
      })

      // patch pending request (edit)
      .addCase(patchPendingRequest.pending, (state) => {
        state.edit.loading = true
        state.edit.error = null
        state.edit.response = null
      })
      .addCase(patchPendingRequest.fulfilled, (state, action) => {
        state.edit.loading = false
        state.edit.response = action.payload
        // update currentRequest and pending list where applicable
        state.currentRequest = action.payload
        if (state.pending) {
          state.pending = state.pending.map(p => p.id === action.payload.id ? ({ ...p, title: action.payload.title || action.payload.summary || p.title, desc: action.payload.summary || p.desc }) : p)
        }
      })
      .addCase(patchPendingRequest.rejected, (state, action) => {
        state.edit.loading = false
        state.edit.error = action.payload || action.error
      })
  }
})

export const { clearCurrentRequest } = slice.actions
export default slice.reducer
