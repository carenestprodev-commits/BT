import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL, getAuthHeaders } from './config'

// Initiate payment for starting an activity
export const initiateActivityPayment = createAsyncThunk(
  'startActivity/initiatePayment',
  async ({ bookingId, totalHours, paymentGateway = 'stripe' }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/bookings/${bookingId}/initiate-payment/`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          total_hours: totalHours,
          payment_gateway: paymentGateway
        })
      })
      
      if (!res.ok) {
        const errorText = await res.text()
        return rejectWithValue(errorText)
      }
      
      const data = await res.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

  // End an activity (POST to /api/bookings/{bookingId}/end-activity/)
  export const endActivity = createAsyncThunk(
    'startActivity/endActivity',
    async (bookingId, { rejectWithValue }) => {
      try {
        const res = await fetch(`${BASE_URL}/api/bookings/${bookingId}/end-activity/`, {
          method: 'POST',
          headers: getAuthHeaders()
        })

        if (!res.ok) {
          const text = await res.text()
          return rejectWithValue(text)
        }

        const data = await res.json()
        return data
      } catch (err) {
        return rejectWithValue(err.message)
      }
    }
  )

const initialState = {
  // Payment initiation
  initiatingPayment: false,
  paymentError: null,
  checkoutUrl: null,
  // Ending activity
  endingActivity: false,
  endActivityError: null,
  endActivityResponse: null,
  
  // Activity state
  activityStarted: false,
  lastBookingId: null,
  // Activity end state
  activityEnded: false,
  lastEndedBookingId: null,
}

const startActivitySlice = createSlice({
  name: 'startActivity',
  initialState,
  reducers: {
    // Reset payment state
    clearPaymentState: (state) => {
      state.initiatingPayment = false
      state.paymentError = null
      state.checkoutUrl = null
    },
    
    // Mark activity as started (called when returning from Stripe)
    setActivityStarted: (state, action) => {
      state.activityStarted = true
      state.lastBookingId = action.payload
    },
      // Mark activity as ended
      setActivityEnded: (state, action) => {
        state.activityEnded = true
        state.lastEndedBookingId = action.payload
      },
    
    // Clear activity started flag
    clearActivityStarted: (state) => {
      state.activityStarted = false
      state.lastBookingId = null
    },
    // Clear activity ended flag
    clearActivityEnded: (state) => {
      state.activityEnded = false
      state.lastEndedBookingId = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Initiate payment
      .addCase(initiateActivityPayment.pending, (state) => {
        state.initiatingPayment = true
        state.paymentError = null
        state.checkoutUrl = null
      })
      .addCase(initiateActivityPayment.fulfilled, (state, action) => {
        state.initiatingPayment = false
        state.checkoutUrl = action.payload?.checkout_url || null
      })
      .addCase(initiateActivityPayment.rejected, (state, action) => {
        state.initiatingPayment = false
        state.paymentError = action.payload || 'Failed to initiate payment'
      })
      // End activity
      .addCase(endActivity.pending, (state) => {
        state.endingActivity = true
        state.endActivityError = null
        state.endActivityResponse = null
      })
      .addCase(endActivity.fulfilled, (state, action) => {
        state.endingActivity = false
        state.endActivityResponse = action.payload || null
        // mark activity ended using booking id from arg or payload
        const bookingIdFromArg = action.meta?.arg
        const bookingIdFromPayload = action.payload?.booking_id || action.payload?.id || null
        state.activityEnded = true
        state.lastEndedBookingId = bookingIdFromArg || bookingIdFromPayload || null
      })
      .addCase(endActivity.rejected, (state, action) => {
        state.endingActivity = false
        state.endActivityError = action.payload || action.error?.message || 'Failed to end activity'
      })
  }
})

export const {
  clearPaymentState,
  setActivityStarted,
  clearActivityStarted,
  setActivityEnded,
  clearActivityEnded
} = startActivitySlice.actions

export default startActivitySlice.reducer
