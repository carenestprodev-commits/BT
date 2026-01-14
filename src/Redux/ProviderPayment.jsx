import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import paystackService from "../utils/paystackService.js";

/**
 * Async thunk to initiate provider subscription payment
 */
export const initiateProviderSubscription = createAsyncThunk(
  "providerPayment/initiateSubscription",
  async ({ planType, amount }, { rejectWithValue }) => {
    try {
      const result = await paystackService.initiateProviderSubscription(
        planType,
        amount
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

/**
 * Async thunk to verify provider payment
 */
export const verifyProviderPayment = createAsyncThunk(
  "providerPayment/verify",
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
  // Subscription payment state
  initiating: false,
  paymentInitiated: false,
  authorizationUrl: null,
  reference: null,
  accessCode: null,

  // Payment verification state
  verifying: false,
  paymentVerified: false,
  paymentStatus: null,

  // Error handling
  error: null,
  success: false,
};

const providerPaymentSlice = createSlice({
  name: "providerPayment",
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.initiating = false;
      state.paymentInitiated = false;
      state.authorizationUrl = null;
      state.reference = null;
      state.accessCode = null;
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
    // Initiate subscription
    builder
      .addCase(initiateProviderSubscription.pending, (state) => {
        state.initiating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(initiateProviderSubscription.fulfilled, (state, action) => {
        state.initiating = false;
        state.paymentInitiated = true;
        state.authorizationUrl = action.payload.authorizationUrl;
        state.reference = action.payload.reference;
        state.accessCode = action.payload.accessCode;
        state.success = true;
      })
      .addCase(initiateProviderSubscription.rejected, (state, action) => {
        state.initiating = false;
        state.paymentInitiated = false;
        state.error = action.payload;
        state.success = false;
      });

    // Verify payment
    builder
      .addCase(verifyProviderPayment.pending, (state) => {
        state.verifying = true;
        state.error = null;
      })
      .addCase(verifyProviderPayment.fulfilled, (state, action) => {
        state.verifying = false;
        state.paymentVerified = true;
        state.paymentStatus = action.payload.status;
        state.success = true;
      })
      .addCase(verifyProviderPayment.rejected, (state, action) => {
        state.verifying = false;
        state.paymentVerified = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetPaymentState, setPaymentReference } =
  providerPaymentSlice.actions;
export default providerPaymentSlice.reducer;
