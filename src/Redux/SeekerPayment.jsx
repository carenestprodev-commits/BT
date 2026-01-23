import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import paystackService from "../utils/paystackService.js";

/**
 * Async thunk to initiate seeker checkout payment
 */
export const initiateSeekerCheckoutOld = createAsyncThunk(
  "seekerPayment/initiateCheckout",
  async ({ bookingId, amount, bookingDetails }, { rejectWithValue }) => {
    try {
      const result = await paystackService.initiateSeekerCheckout(
        bookingId,
        amount,
        bookingDetails
      );

      if (!result.success) {
        return rejectWithValue(result.error);
      }

      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const initiateSeekerCheckout = createAsyncThunk(
    "seekerPayment/initiateCheckout",
    async ({ bookingId, amount, bookingDetails }, { rejectWithValue }) => {
      try {
        const result = await paystackService.initiateSeekerCheckout({
          bookingId,
          amount,
          bookingDetails,
        });

        return result;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
);


/**
 * Async thunk to verify seeker payment
 */
export const verifySeekerPayment = createAsyncThunk(
  "seekerPayment/verify",
  async ({ reference }, { rejectWithValue }) => {
    try {
      const result = await paystackService.verifyPayment(reference);

      if (!result.success) {
        return rejectWithValue(result.error);
      }

      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Checkout payment state
  initiating: false,
  checkoutInitiated: false,
  authorizationUrl: null,
  reference: null,
  accessCode: null,
  bookingId: null,

  // Payment verification state
  verifying: false,
  paymentVerified: false,
  paymentStatus: null,

  // Error handling
  error: null,
  success: false,
};

const seekerPaymentSlice = createSlice({
  name: "seekerPayment",
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.initiating = false;
      state.checkoutInitiated = false;
      state.authorizationUrl = null;
      state.reference = null;
      state.accessCode = null;
      state.bookingId = null;
      state.verifying = false;
      state.paymentVerified = false;
      state.paymentStatus = null;
      state.error = null;
      state.success = false;
    },
    setPaymentReference: (state, action) => {
      state.reference = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Initiate checkout
    builder
      .addCase(initiateSeekerCheckout.pending, (state) => {
        state.initiating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(initiateSeekerCheckout.fulfilled, (state, action) => {
        state.initiating = false;
        state.checkoutInitiated = true;
        state.authorizationUrl = action.payload.authorizationUrl;
        state.reference = action.payload.reference;
        state.accessCode = action.payload.accessCode;
        state.bookingId = action.payload.booking_id;
        state.success = true;
      })
      .addCase(initiateSeekerCheckout.rejected, (state, action) => {
        state.initiating = false;
        state.checkoutInitiated = false;
        state.error = action.payload;
        state.success = false;
      });

    // Verify payment
    builder
      .addCase(verifySeekerPayment.pending, (state) => {
        state.verifying = true;
        state.error = null;
      })
      .addCase(verifySeekerPayment.fulfilled, (state, action) => {
        state.verifying = false;
        state.paymentVerified = true;
        state.paymentStatus = action.payload.status;
        state.success = true;
      })
      .addCase(verifySeekerPayment.rejected, (state, action) => {
        state.verifying = false;
        state.paymentVerified = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetPaymentState, setPaymentReference } =
  seekerPaymentSlice.actions;
export default seekerPaymentSlice.reducer;
