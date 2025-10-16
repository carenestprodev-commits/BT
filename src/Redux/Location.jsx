import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL } from './config'

// Helper to get current position as a Promise
function getCurrentPositionPromise(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator || !navigator.geolocation) {
      return reject(new Error('Geolocation not available'))
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

export const reverseGeocode = createAsyncThunk(
  'location/reverseGeocode',
  async (_, { rejectWithValue }) => {
    try {
      const pos = await getCurrentPositionPromise({ enableHighAccuracy: true, timeout: 10000 })
      const { latitude: lat, longitude: lon } = pos.coords

      const res = await fetch(`${BASE_URL}/api/location/reverse-geocode/?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`)
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)

      // attach coords
      return { lat, lon, ...data }
    } catch (err) {
      return rejectWithValue({ error: err?.message || 'Failed to get location' })
    }
  }
)

const slice = createSlice({
  name: 'location',
  initialState: { lat: null, lon: null, data: null, loading: false, error: null },
  reducers: {
    clearLocation(state) {
      state.lat = null; state.lon = null; state.data = null; state.loading = false; state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(reverseGeocode.pending, (state) => { state.loading = true; state.error = null })
      .addCase(reverseGeocode.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.lat = action.payload.lat
        state.lon = action.payload.lon
        state.data = action.payload
      })
      .addCase(reverseGeocode.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error
      })
  }
})

export const { clearLocation } = slice.actions
export default slice.reducer
