# Payment Localization Implementation Guide

## Overview

Implement multi-currency and country-specific payment gateway support with localized pricing display.

---

## 1. Get User's Country

### Option A: From User Profile (Recommended)

User's country should be stored in their profile data during signup/profile completion.

```javascript
// In your user profile Redux state or AuthContext
const getUserCountry = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    // Assuming user profile has country field
    return user?.country || user?.location?.country || null;
  } catch {
    return null;
  }
};

// Or from Redux state
const userCountry = useSelector((state) => state.auth?.user?.country);
```

### Option B: From Browser/IP Detection (Fallback)

```javascript
// Use a geolocation service as fallback
const getCountryFromIP = async () => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return data.country_code; // Returns ISO2 code like "NG", "US"
  } catch {
    return "NG"; // Default to Nigeria
  }
};
```

### Option C: Let User Select

Add country selection to user profile/settings.

---

## 2. Update Payment Service to Include Country

### File: `src/utils/paystackService.js`

```javascript
/**
 * Get user's country for payment localization
 */
const getUserCountry = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.country || user?.location?.country || null;
  } catch {
    return null;
  }
};

// Update initiateProviderSubscription
initiateProviderSubscription: async (planId) => {
  if (!planId) {
    throw new Error("Invalid subscription plan selected");
  }

  const country = getUserCountry();

  const response = await authRequest(
    `${BASE_URL}/api/payments/provider-plans/subscribe/`,
    {
      method: "POST",
      body: JSON.stringify({
        plan_id: planId,
        payment_gateway: "paystack",
        country: country, // ✅ ADD THIS
      }),
    }
  );

  const text = await response.text();

  if (!response.ok) {
    // ✅ Handle gateway availability errors
    let errorData = { message: "Failed to initiate subscription payment" };
    try {
      errorData = JSON.parse(text);
    } catch {
      errorData.message = text || errorData.message;
    }

    // Check for gateway availability error
    if (errorData.supported_gateways) {
      const error = new Error(errorData.error || "Payment gateway not available");
      error.country = errorData.country;
      error.supportedGateways = errorData.supported_gateways;
      throw error;
    }
    throw new Error(errorData.message);
  }

  const data = JSON.parse(text);
  return {
    authorizationUrl:
      data.authorization_url ||
      data.checkout_url ||
      data.payment_url ||
      data.url,
    reference: data.reference,
    accessCode: data.access_code,
    // ✅ Include localized pricing fields
    localizedPrice: data.localized_price,
    currencyCode: data.currency_code,
    currencySymbol: data.currency_symbol,
    countryUsed: data.country_used,
    isFallbackPrice: data.is_fallback_price,
    raw: data,
  };
},

// Update initiateSeekerCheckout
initiateSeekerCheckout: async ({
  bookingId,
  amount,
  bookingDetails = {},
}) => {
  if (amount == null) {
    throw new Error("Invalid checkout details");
  }

  const country = getUserCountry();

  const response = await authRequest(`${BASE_URL}/api/payments/checkout/`, {
    method: "POST",
    body: JSON.stringify({
      booking_id: bookingId,
      amount,
      payment_method: "paystack",
      country: country, // ✅ ADD THIS
      ...bookingDetails,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    // ✅ Handle gateway availability errors
    if (data.supported_gateways) {
      const error = new Error(data.error || "Payment gateway not available");
      error.country = data.country;
      error.supportedGateways = data.supported_gateways;
      throw error;
    }
    throw new Error(data.message || "Checkout initiation failed");
  }

  return {
    authorizationUrl: data.authorization_url || data.checkout_url,
    reference: data.reference,
    accessCode: data.access_code,
    // ✅ Include localized pricing fields
    localizedPrice: data.localized_price,
    currencyCode: data.currency_code,
    currencySymbol: data.currency_symbol,
    countryUsed: data.country_used,
    isFallbackPrice: data.is_fallback_price,
    raw: data,
  };
},

/**
 * NEW: Get subscription plans with localized pricing
 */
getSubscriptionPlans: async (countryCode = null) => {
  const country = countryCode || getUserCountry();

  let url = `${BASE_URL}/api/payments/provider-plans/`;
  if (country) {
    url += `?country=${country}`; // ✅ Add this parameter
  }

  const response = await authRequest(url, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch plans");
  }

  // Plans will include:
  // - localized_price
  // - currency_code
  // - currency_symbol
  // - country_used
  // - is_fallback_price
  return data;
},
```

---

## 3. Update Redux to Handle Localized Data

### File: `src/Redux/ProviderPayment.jsx`

```javascript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import paystackService from "../utils/paystackService.js";

export const initiateProviderSubscription = createAsyncThunk(
  "providerPayment/initiateSubscription",
  async ({ planType, amount }, { rejectWithValue }) => {
    try {
      const result = await paystackService.initiateProviderSubscription(
        planType,
        amount,
      );
      return result;
    } catch (error) {
      // ✅ Handle gateway availability errors
      if (error.supportedGateways) {
        return rejectWithValue({
          message: error.message,
          country: error.country,
          supportedGateways: error.supportedGateways,
          isGatewayError: true,
        });
      }
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  initiating: false,
  paymentInitiated: false,
  authorizationUrl: null,
  reference: null,
  accessCode: null,

  // ✅ New fields for localized pricing
  localizedPrice: null,
  currencyCode: null,
  currencySymbol: null,
  countryUsed: null,
  isFallbackPrice: false,

  // ✅ Gateway availability tracking
  gatewayError: null,
  supportedGateways: null,

  verifying: false,
  paymentVerified: false,
  paymentStatus: null,
  error: null,
  success: false,
};

const providerPaymentSlice = createSlice({
  name: "providerPayment",
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiateProviderSubscription.pending, (state) => {
        state.initiating = true;
        state.error = null;
        state.success = false;
        state.gatewayError = null;
      })
      .addCase(initiateProviderSubscription.fulfilled, (state, action) => {
        state.initiating = false;
        state.paymentInitiated = true;
        state.authorizationUrl = action.payload.authorizationUrl;
        state.reference = action.payload.reference;
        state.accessCode = action.payload.accessCode;

        // ✅ Store localized pricing
        state.localizedPrice = action.payload.localizedPrice;
        state.currencyCode = action.payload.currencyCode;
        state.currencySymbol = action.payload.currencySymbol;
        state.countryUsed = action.payload.countryUsed;
        state.isFallbackPrice = action.payload.isFallbackPrice;

        state.success = true;
      })
      .addCase(initiateProviderSubscription.rejected, (state, action) => {
        state.initiating = false;
        state.paymentInitiated = false;

        // ✅ Handle gateway errors
        if (action.payload?.isGatewayError) {
          state.gatewayError = action.payload.message;
          state.supportedGateways = action.payload.supportedGateways;
        } else {
          state.error = action.payload;
        }
        state.success = false;
      });
  },
});

export const { resetPaymentState } = providerPaymentSlice.actions;
export default providerPaymentSlice.reducer;
```

---

## 4. Update Payment Modal to Display Localized Pricing

### File: `src/Pages/CareSeekers/Dashboard/PaymentModal.jsx`

```javascript
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initiateProviderSubscription } from "../../../Redux/ProviderPayment";
import { fetchWithAuth } from "../../../lib/fetchWithAuth.js";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const PaymentModal = ({ isOpen, onClose, selectedPlan = null }) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    initiating,
    authorizationUrl,
    error,
    localizedPrice, // ✅ Get localized price
    currencySymbol, // ✅ Get currency symbol
    currencyCode, // ✅ Get currency code
    isFallbackPrice, // ✅ Check if fallback
    gatewayError, // ✅ Handle gateway errors
    supportedGateways, // ✅ Available gateways
  } = useSelector((s) => s.providerPayment || {});

  // Redirect to payment gateway
  useEffect(() => {
    if (authorizationUrl && isProcessing) {
      window.location.href = authorizationUrl;
    }
  }, [authorizationUrl, isProcessing]);

  const handleClose = () => {
    if (!isProcessing && !initiating && !gatewayError) {
      setIsProcessing(false);
      onClose();
    }
  };

  if (!isOpen || !selectedPlan) return null;

  // ✅ Use localized price if available, otherwise use selected plan price
  const displayPrice = localizedPrice || selectedPlan.price;
  const displayCurrency = currencySymbol || "₦"; // Default Naira
  const displayCode = currencyCode || "NGN";

  // Format amount based on localization
  const formatAmount = (amount) => {
    try {
      if (currencyCode === "NGN") {
        return `${displayCurrency}${parseFloat(amount).toLocaleString("en-NG")}`;
      }
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: displayCode,
      }).format(amount);
    } catch {
      return `${displayCurrency}${amount}`;
    }
  };

  const displayAmount = formatAmount(displayPrice);

  const handlePayment = async () => {
    if (!selectedPlan?.id) {
      alert("No plan selected");
      return;
    }

    try {
      setIsProcessing(true);

      const result = await dispatch(
        initiateProviderSubscription({
          planType: selectedPlan.id,
          amount: selectedPlan.price,
        }),
      ).unwrap();

      if (result?.authorizationUrl) {
        window.location.href = result.authorizationUrl;
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert(err?.message || "Payment initiation failed");
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[400px] relative">
        {/* ✅ Show gateway error if available */}
        {gatewayError && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-t-xl">
            <p className="text-red-800 font-semibold mb-2">
              Payment Gateway Not Available
            </p>
            <p className="text-red-600 text-sm mb-3">{gatewayError}</p>

            {supportedGateways && (
              <div className="text-sm">
                <p className="text-red-700 font-medium mb-2">
                  Available Payment Methods:
                </p>
                <div className="space-y-1">
                  {Object.entries(supportedGateways).map(
                    ([gateway, available]) => (
                      <label key={gateway} className="flex items-center">
                        <input
                          type="radio"
                          name="gateway"
                          disabled={!available}
                          className="mr-2"
                        />
                        <span
                          className={
                            available ? "text-green-600" : "text-gray-400"
                          }
                        >
                          {gateway.charAt(0).toUpperCase() + gateway.slice(1)}
                          {available ? " ✓" : " (unavailable)"}
                        </span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            )}
            <button
              onClick={handleClose}
              className="w-full mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        )}

        {!gatewayError && (
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Confirm Payment
            </h2>

            {/* Plan Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Plan</span>
                <span className="font-semibold">{selectedPlan.name}</span>
              </div>

              {/* ✅ Show localized price with indicator if fallback */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Amount</span>
                <div className="text-right">
                  <div className="font-semibold text-xl">{displayAmount}</div>
                  {isFallbackPrice && (
                    <div className="text-xs text-yellow-600 mt-1">
                      Note: Estimated price
                    </div>
                  )}
                </div>
              </div>

              {/* Show currency info */}
              <div className="text-xs text-gray-500 mt-2">
                Currency: {displayCode}
              </div>
            </div>

            {/* Processing indicator */}
            {(initiating || isProcessing) && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
                Processing payment... Please wait.
              </div>
            )}

            {/* Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing || initiating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {isProcessing || initiating
                ? "Processing..."
                : "Proceed to Payment"}
            </button>

            <button
              onClick={handleClose}
              disabled={isProcessing || initiating}
              className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
```

---

## 5. Display Wallet/Job Amounts with Localization

### For Wallet History

```javascript
// When displaying wallet transactions or balance
const displayWalletAmount = (transaction) => {
  if (transaction.amount_display) {
    // ✅ Use these fields from API
    return {
      amount: transaction.amount_display,
      currency: transaction.display_currency_symbol,
      code: transaction.display_currency_code,
    };
  }

  // Fallback: use raw amount with default currency
  return {
    amount: transaction.amount,
    currency: "₦",
    code: "NGN",
  };
};
```

### For Job Budget Display

```javascript
// When displaying job/request budget amount
const displayJobBudget = (job) => {
  if (job.budget_display_amount) {
    // ✅ Use these fields from API
    return {
      amount: job.budget_display_amount,
      currency: job.display_currency_symbol,
      code: job.display_currency_code,
    };
  }

  // Fallback: use budget_price with default currency
  return {
    amount: job.budget_price || job.price,
    currency: "₦",
    code: "NGN",
  };
};
```

---

## 6. Update Subscription Plan List to Show Localized Pricing

### Create a new Redux thunk for fetching plans

```javascript
// src/Redux/SubscriptionPlans.js
export const fetchSubscriptionPlans = createAsyncThunk(
  "subscriptionPlans/fetch",
  async (_, { rejectWithValue }) => {
    try {
      // Get user's country
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const country = user?.country || null;

      const url = country
        ? `${BASE_URL}/api/payments/provider-plans/?country=${country}`
        : `${BASE_URL}/api/payments/provider-plans/`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
```

### Use in component

```javascript
// In any component showing subscription plans
const { plans } = useSelector((state) => state.subscriptionPlans);

{
  plans?.map((plan) => (
    <div key={plan.id} className="border p-4 rounded-lg">
      <h3>{plan.name}</h3>

      {/* ✅ Use localized_price instead of price */}
      <div className="text-2xl font-bold">
        {plan.currency_symbol}
        {plan.localized_price}
        <span className="text-sm text-gray-500 ml-2">{plan.currency_code}</span>
      </div>

      {/* ✅ Show fallback indicator */}
      {plan.is_fallback_price && (
        <p className="text-yellow-600 text-xs">
          Estimated price for {plan.country_used}
        </p>
      )}

      <button onClick={() => selectPlan(plan)}>Select Plan</button>
    </div>
  ));
}
```

---

## 7. Backward Compatibility Checklist

- ✅ All `country` parameters are optional
- ✅ Fall back to default currency (NGN) if localized fields missing
- ✅ Use `price` field if `localized_price` not available
- ✅ Existing code without country detection still works
- ✅ Gateway errors are properly caught and displayed

---

## 8. Testing Checklist

- [ ] Test payment with country from user profile
- [ ] Test payment with fallback country detection
- [ ] Test gateway availability error display
- [ ] Test multiple gateway selection (if supported)
- [ ] Test fallback pricing display
- [ ] Test without country parameter (backward compat)
- [ ] Test wallet amount display
- [ ] Test job budget display
- [ ] Test plan list with different countries

---

## 9. Summary of Changes

| File                    | Changes                                                                  |
| ----------------------- | ------------------------------------------------------------------------ |
| `paystackService.js`    | Add country to requests, handle gateway errors, include localized fields |
| `ProviderPayment.jsx`   | Store localized pricing, handle gateway errors                           |
| `PaymentModal.jsx`      | Display localized prices, show gateway errors, format based on currency  |
| `Wallet components`     | Use `amount_display` fields                                              |
| `Job components`        | Use `budget_display_amount` fields                                       |
| `SubscriptionPlans.jsx` | Create new, pass country to API                                          |

---

## Questions?

For each payment initiation, you now:

1. ✅ Get user's country from profile
2. ✅ Send country in payment request
3. ✅ Receive localized pricing
4. ✅ Handle gateway availability
5. ✅ Display with correct currency/symbol
6. ✅ Maintain backward compatibility
