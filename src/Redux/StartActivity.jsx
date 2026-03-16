import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL, getAuthHeaders } from "./config";

// Fetch server-calculated payment preview for an activity booking
export const fetchActivityPaymentPreview = createAsyncThunk(
  "startActivity/fetchPaymentPreview",
  async ({ bookingId, totalHours }, { rejectWithValue }) => {
    try {
      const previewUrl = new URL(
        `${BASE_URL}/api/bookings/${bookingId}/initiate-payment/`,
      );
      if (totalHours !== undefined && totalHours !== null && totalHours !== "") {
        previewUrl.searchParams.set("total_hours", String(totalHours));
      }

      const res = await fetch(
        previewUrl.toString(),
        {
          method: "GET",
          headers: {
            ...getAuthHeaders(),
          },
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        return rejectWithValue(errorText);
      }

      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Initiate payment for starting an activity
export const initiateActivityPayment = createAsyncThunk(
  "startActivity/initiatePayment",
  async (
    { bookingId, totalHours, paymentGateway = "stripe", perHourRate = null },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/bookings/${bookingId}/initiate-payment/`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(perHourRate !== null ? { per_hour_rate: perHourRate } : {}),
            ...(totalHours !== undefined ? { total_hours: totalHours } : {}),
            payment_gateway: paymentGateway,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        return rejectWithValue(errorText);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Start an activity for a booking (POST to /api/bookings/{bookingId}/start-activity/)
export const startActivity = createAsyncThunk(
  "startActivity/startActivity",
  async (bookingId, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/bookings/${bookingId}/start-activity/`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(text);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// End an activity (POST to /api/bookings/{bookingId}/end-activity/)
export const endActivity = createAsyncThunk(
  "startActivity/endActivity",
  async (bookingId, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/bookings/${bookingId}/end-activity/`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(text);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  // Payment initiation
  loadingPaymentPreview: false,
  paymentPreviewError: null,
  initiatingPayment: false,
  paymentError: null,
  checkoutUrl: null,
  currencyCode: "USD",
  currencySymbol: "$",
  countryUsed: null,
  localizedPerHourRate: null,
  localizedTotalHours: null,
  localizedSubtotal: null,
  localizedServiceFee: null,
  localizedTotalAmount: null,
  isFallbackPrice: false,
  // Ending activity
  endingActivity: false,
  endActivityError: null,
  endActivityResponse: null,

  // Activity state
  activityStarted: false,
  lastBookingId: null,
  // Starting activity API state
  startingActivity: false,
  startActivityError: null,
  // Activity end state
  activityEnded: false,
  lastEndedBookingId: null,
};

const startActivitySlice = createSlice({
  name: "startActivity",
  initialState,
  reducers: {
    // Reset payment state
    clearPaymentState: (state) => {
      state.loadingPaymentPreview = false;
      state.paymentPreviewError = null;
      state.initiatingPayment = false;
      state.paymentError = null;
      state.checkoutUrl = null;
      state.currencyCode = "USD";
      state.currencySymbol = "$";
      state.countryUsed = null;
      state.localizedPerHourRate = null;
      state.localizedTotalHours = null;
      state.localizedSubtotal = null;
      state.localizedServiceFee = null;
      state.localizedTotalAmount = null;
      state.isFallbackPrice = false;
    },

    // Mark activity as started (called when returning from Stripe)
    setActivityStarted: (state, action) => {
      state.activityStarted = true;
      state.lastBookingId = action.payload;
    },
    // Mark activity as ended
    setActivityEnded: (state, action) => {
      state.activityEnded = true;
      state.lastEndedBookingId = action.payload;
    },

    // Clear activity started flag
    clearActivityStarted: (state) => {
      state.activityStarted = false;
      state.lastBookingId = null;
    },
    // Clear activity ended flag
    clearActivityEnded: (state) => {
      state.activityEnded = false;
      state.lastEndedBookingId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payment preview
      .addCase(fetchActivityPaymentPreview.pending, (state) => {
        state.loadingPaymentPreview = true;
        state.paymentPreviewError = null;
        state.paymentError = null;
      })
      .addCase(fetchActivityPaymentPreview.fulfilled, (state, action) => {
        state.loadingPaymentPreview = false;
        const payload = action.payload || {};
        // Backend returns system-calculated values from activity logs
        state.localizedPerHourRate = payload.per_hour_rate ?? null;
        state.localizedTotalHours = payload.total_hours ?? null;
        state.localizedSubtotal = payload.subtotal ?? null;
        state.localizedServiceFee = payload.service_fee ?? null;
        state.localizedTotalAmount = payload.total_amount ?? null;
      })
      .addCase(fetchActivityPaymentPreview.rejected, (state, action) => {
        state.loadingPaymentPreview = false;
        state.paymentPreviewError =
          action.payload || "Failed to load payment preview";
      })
      // Initiate payment
      .addCase(initiateActivityPayment.pending, (state) => {
        state.initiatingPayment = true;
        state.paymentError = null;
        state.checkoutUrl = null;
        state.currencyCode = "USD";
        state.currencySymbol = "$";
        state.countryUsed = null;
        state.isFallbackPrice = false;
      })
      .addCase(initiateActivityPayment.fulfilled, (state, action) => {
        state.initiatingPayment = false;
        const payload = action.payload || {};
        state.checkoutUrl =
          payload.checkout_url ||
          payload.authorization_url ||
          payload.payment_url ||
          payload.url ||
          null;
        state.currencyCode = payload.currency_code || state.currencyCode;
        state.currencySymbol = payload.currency_symbol || state.currencySymbol;
        state.countryUsed = payload.country_used || null;
        state.localizedPerHourRate =
          payload.localized_per_hour_rate ?? payload.per_hour_rate ?? null;
        state.localizedSubtotal =
          payload.localized_subtotal ?? payload.subtotal ?? null;
        state.localizedServiceFee =
          payload.localized_service_fee ??
          payload.service_fee ??
          payload.fee ??
          null;
        state.localizedTotalAmount =
          payload.localized_total_amount ??
          payload.total_amount ??
          payload.amount ??
          null;
        state.isFallbackPrice = payload.is_fallback_price || false;
      })
      .addCase(initiateActivityPayment.rejected, (state, action) => {
        state.initiatingPayment = false;
        state.paymentError = action.payload || "Failed to initiate payment";
      })
      // End activity
      .addCase(endActivity.pending, (state) => {
        state.endingActivity = true;
        state.endActivityError = null;
        state.endActivityResponse = null;
      })
      // Start activity
      .addCase(startActivity.pending, (state) => {
        state.startingActivity = true;
        state.startActivityError = null;
      })
      .addCase(startActivity.fulfilled, (state, action) => {
        state.startingActivity = false;
        // prefer arg (bookingId) then payload booking id
        const bookingIdFromArg = action.meta?.arg;
        const bookingIdFromPayload =
          action.payload?.booking_id || action.payload?.id || null;
        state.activityStarted = true;
        state.lastBookingId = bookingIdFromArg || bookingIdFromPayload || null;
      })
      .addCase(startActivity.rejected, (state, action) => {
        state.startingActivity = false;
        state.startActivityError =
          action.payload || action.error?.message || "Failed to start activity";
      })
      .addCase(endActivity.fulfilled, (state, action) => {
        state.endingActivity = false;
        state.endActivityResponse = action.payload || null;
        // mark activity ended using booking id from arg or payload
        const bookingIdFromArg = action.meta?.arg;
        const bookingIdFromPayload =
          action.payload?.booking_id || action.payload?.id || null;
        state.activityEnded = true;
        state.lastEndedBookingId =
          bookingIdFromArg || bookingIdFromPayload || null;
      })
      .addCase(endActivity.rejected, (state, action) => {
        state.endingActivity = false;
        state.endActivityError =
          action.payload || action.error?.message || "Failed to end activity";
      });
  },
});

export const {
  clearPaymentState,
  setActivityStarted,
  clearActivityStarted,
  setActivityEnded,
  clearActivityEnded,
} = startActivitySlice.actions;

export default startActivitySlice.reducer;
