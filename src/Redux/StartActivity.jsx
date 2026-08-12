import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL, getAuthHeaders } from "./config";
import { getCurrencySymbol } from "../utils/countryHelper";

const COUNTRY_NAME_TO_ISO2 = {
  nigeria: "NG",
  "united states": "US",
  usa: "US",
  "united kingdom": "GB",
  uk: "GB",
  ghana: "GH",
  kenya: "KE",
  "south africa": "ZA",
  canada: "CA",
  australia: "AU",
  india: "IN",
};

const COUNTRY_TO_CURRENCY = {
  NG: "NGN",
  US: "USD",
  GB: "GBP",
  GH: "GHS",
  KE: "KES",
  ZA: "ZAR",
  CA: "CAD",
  AU: "AUD",
  IN: "INR",
};

const getProfileCountryIso2 = () => {
  try {
    if (typeof localStorage === "undefined") return null;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const raw =
      user?.country_code ||
      user?.country ||
      user?.location?.country ||
      user?.profile?.country ||
      null;
    if (!raw) return null;
    const normalized = String(raw).trim();
    const normalizedLower = normalized.toLowerCase();
    const aliasMatch = COUNTRY_NAME_TO_ISO2[normalizedLower];
    if (aliasMatch) {
      return aliasMatch;
    }
    if (/^[A-Za-z]{2}$/.test(normalized)) {
      return normalized.toUpperCase();
    }
    return null;
  } catch {
    return null;
  }
};

const getPaymentDefaults = () => {
  const countryIso2 = getProfileCountryIso2();
  const currencyCode = COUNTRY_TO_CURRENCY[countryIso2] || "USD";
  return {
    currencyCode,
    currencySymbol: getCurrencySymbol(currencyCode),
    countryUsed: countryIso2,
  };
};

const normalizeApiError = (
  errorPayload,
  fallback = "Something went wrong. Please try again.",
) => {
  if (!errorPayload) return fallback;

  const extractFromObject = (obj) => {
    if (!obj || typeof obj !== "object") return null;

    if (typeof obj.detail === "string" && obj.detail.trim()) return obj.detail;
    if (typeof obj.message === "string" && obj.message.trim())
      return obj.message;
    if (typeof obj.error === "string" && obj.error.trim()) return obj.error;

    const entries = Object.entries(obj);
    for (const [, value] of entries) {
      if (Array.isArray(value) && value.length > 0) {
        const first = value.find((item) => typeof item === "string");
        if (first) return first;
      }
      if (typeof value === "string" && value.trim()) return value;
    }

    return null;
  };

  if (typeof errorPayload === "string") {
    const trimmed = errorPayload.trim();
    if (!trimmed) return fallback;
    try {
      const parsed = JSON.parse(trimmed);
      const extracted = extractFromObject(parsed);
      if (extracted) {
        return extracted;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  if (typeof errorPayload === "object") {
    const extracted = extractFromObject(errorPayload);
    if (extracted) {
      return extracted;
    }
  }

  return fallback;
};

// Fetch the server-calculated final payment preview.
export const fetchActivityPaymentPreview = createAsyncThunk(
  "startActivity/fetchPaymentPreview",
  async ({ bookingId }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/bookings/${bookingId}/initiate-payment/`,
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

// Initiate the final booking payment after the server creates the settlement.
export const initiateActivityPayment = createAsyncThunk(
  "startActivity/initiatePayment",
  async (
    { bookingId, paymentGateway = "stripe" },
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
          body: JSON.stringify({ payment_gateway: paymentGateway }),
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
  async ({ bookingId, endCode }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/bookings/${bookingId}/end-activity/`,
        {
          method: "POST",
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ end_code: endCode }),
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
  ...getPaymentDefaults(),
  localizedPerHourRate: null,
  localizedScheduledHours: null,
  localizedOvertimeHours: null,
  localizedExtraHours: null,
  localizedSubtotal: null,
  localizedServiceFee: null,
  localizedVerificationFee: null,
  localizedTotalAmount: null,
  isFallbackPrice: false,
  // Ending activity
  endingActivity: false,
  endActivityError: null,
  endActivityResponse: null,

  // Activity state
  activityStarted: false,
  lastBookingId: null,
  scheduledEndAt: null,
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
      const defaults = getPaymentDefaults();
      state.loadingPaymentPreview = false;
      state.paymentPreviewError = null;
      state.initiatingPayment = false;
      state.paymentError = null;
      state.checkoutUrl = null;
      state.currencyCode = defaults.currencyCode;
      state.currencySymbol = defaults.currencySymbol;
      state.countryUsed = defaults.countryUsed;
      state.localizedPerHourRate = null;
      state.localizedScheduledHours = null;
      state.localizedOvertimeHours = null;
      state.localizedExtraHours = null;
      state.localizedSubtotal = null;
      state.localizedServiceFee = null;
      state.localizedVerificationFee = null;
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
        state.currencyCode = payload.currency_code || state.currencyCode;
        state.currencySymbol = payload.currency_symbol || state.currencySymbol;
        state.countryUsed =
          payload.country_used || payload.country || state.countryUsed;
        state.localizedPerHourRate = payload.hourly_rate ?? payload.per_hour_rate ?? null;
        state.localizedScheduledHours = payload.scheduled_hours ?? null;
        state.localizedOvertimeHours = payload.overtime_hours ?? null;
        state.localizedExtraHours = payload.extra_hours ?? null;
        state.localizedSubtotal = payload.work_subtotal ?? payload.subtotal ?? null;
        state.localizedServiceFee = payload.platform_fee ?? payload.service_fee ?? null;
        state.localizedVerificationFee = payload.seeker_verification_fee ?? null;
        state.localizedTotalAmount = payload.total_amount ?? null;
        state.isFallbackPrice = payload.is_fallback_price || false;
      })
      .addCase(fetchActivityPaymentPreview.rejected, (state, action) => {
        state.loadingPaymentPreview = false;
        state.paymentPreviewError = normalizeApiError(
          action.payload,
          "Failed to load payment preview",
        );
      })
      // Initiate payment
      .addCase(initiateActivityPayment.pending, (state) => {
        const defaults = getPaymentDefaults();
        state.initiatingPayment = true;
        state.paymentError = null;
        state.checkoutUrl = null;
        state.currencyCode = defaults.currencyCode;
        state.currencySymbol = defaults.currencySymbol;
        state.countryUsed = defaults.countryUsed;
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
        state.countryUsed =
          payload.country_used || payload.country || state.countryUsed;
        state.localizedPerHourRate =
          payload.hourly_rate ?? payload.localized_per_hour_rate ?? payload.per_hour_rate ?? null;
        state.localizedSubtotal =
          payload.work_subtotal ?? payload.localized_subtotal ?? payload.subtotal ?? null;
        state.localizedServiceFee =
          payload.platform_fee ?? payload.localized_service_fee ??
          payload.service_fee ??
          payload.fee ??
          null;
        state.localizedScheduledHours = payload.scheduled_hours ?? null;
        state.localizedOvertimeHours = payload.overtime_hours ?? null;
        state.localizedExtraHours = payload.extra_hours ?? null;
        state.localizedVerificationFee = payload.seeker_verification_fee ?? null;
        state.localizedTotalAmount =
          payload.localized_total_amount ??
          payload.total_amount ??
          payload.amount ??
          null;
        state.isFallbackPrice = payload.is_fallback_price || false;
      })
      .addCase(initiateActivityPayment.rejected, (state, action) => {
        state.initiatingPayment = false;
        state.paymentError = normalizeApiError(
          action.payload,
          "Failed to initiate payment",
        );
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
        state.scheduledEndAt = action.payload?.scheduled_end_at || null;
      })
      .addCase(startActivity.rejected, (state, action) => {
        state.startingActivity = false;
        state.startActivityError = normalizeApiError(
          action.payload || action.error?.message,
          "Failed to start activity",
        );
      })
      .addCase(endActivity.fulfilled, (state, action) => {
        state.endingActivity = false;
        state.endActivityResponse = action.payload || null;
        // mark activity ended using booking id from arg or payload
        const bookingIdFromArg = action.meta?.arg?.bookingId;
        const bookingIdFromPayload =
          action.payload?.booking_id || action.payload?.id || null;
        state.activityEnded = true;
        state.lastEndedBookingId =
          bookingIdFromArg || bookingIdFromPayload || null;
        state.scheduledEndAt = null;
      })
      .addCase(endActivity.rejected, (state, action) => {
        state.endingActivity = false;
        state.endActivityError = normalizeApiError(
          action.payload || action.error?.message,
          "Failed to end activity",
        );
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
