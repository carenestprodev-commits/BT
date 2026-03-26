# Paystack Payment Integration - Complete Implementation Guide

## 📋 Overview

A complete Paystack payment integration for both CareProviders (subscription payments) and CareSeekers (booking checkout). All payments are verified before processing to ensure only verified users can make payments.

---

## 🏗️ Architecture

### Files Created/Modified

1. **Utility Service:** `src/utils/paystackService.js` (NEW)

   - Centralized Paystack API calls
   - Helper functions for amount conversion (Naira ↔ Kobo)
   - Verification handling

2. **Redux Slices:**

   - `src/Redux/ProviderPayment.jsx` (NEW) - Provider subscription payments
   - `src/Redux/SeekerPayment.jsx` (NEW) - Seeker checkout payments
   - `src/Redux/store.js` (UPDATED) - Added new reducers

3. **UI Components:**
   - `src/Pages/CareProviders/Dashboard/PaymentModal.jsx` (UPDATED)
   - `src/Pages/CareProviders/Dashboard/Payment.jsx` (UPDATED)
   - `src/Pages/CareSeekers/Dashboard/SubscriptionModal.jsx` (UPDATED)

---

## 🔄 Payment Flow

### For CareProviders (Subscription)

```
1. User clicks "Make Payment" button
   ↓
2. PaymentModal opens with plan details
   ↓
3. User clicks "Proceed to Payment"
   ↓
4. dispatch(initiateProviderSubscription)
   ↓
5. API Call: POST /api/payments/provider-plans/subscribe/
   ├─ Headers: Authorization: Bearer {accessToken}
   └─ Body: {plan_type, amount (in kobo), payment_method: "paystack"}
   ↓
6. Backend returns: {authorization_url, access_code, reference}
   ↓
7. Redirect to Paystack payment page
   ↓
8. User completes payment on Paystack
   ↓
9. Return to app with payment reference
   ↓
10. dispatch(verifyProviderPayment) to confirm
```

### For CareSeekers (Checkout)

```
1. User selects subscription plan
   ↓
2. SubscriptionModal shows plan details
   ↓
3. User clicks "Continue"
   ↓
4. dispatch(initiateSeekerCheckout)
   ↓
5. API Call: POST /api/payments/checkout/
   ├─ Headers: Authorization: Bearer {accessToken}
   └─ Body: {booking_id, amount (in kobo), payment_method: "paystack", plan_type}
   ↓
6. Backend returns: {authorization_url, access_code, reference}
   ↓
7. Redirect to Paystack payment page
   ↓
8. User completes payment on Paystack
   ↓
9. Return to app with payment reference
   ↓
10. dispatch(verifySeekerPayment) to confirm
```

---

## 💰 API Endpoints

### 1. Provider Subscription Payment

```
POST /api/payments/provider-plans/subscribe/

Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json

Body:
{
  "plan_type": "monthly" | "quarterly",
  "amount": 150000,              // Amount in kobo (1 Naira = 100 Kobo)
  "payment_method": "paystack"
}

Response:
{
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "abc123xyz",
  "reference": "unique-reference-123",
  "status": "pending"
}
```

### 2. Seeker Checkout Payment

```
POST /api/payments/checkout/

Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json

Body:
{
  "booking_id": 0,                // Or specific booking ID
  "amount": 120000,               // Amount in kobo
  "payment_method": "paystack",
  "plan_type": "quarterly",       // Optional
  "plan_id": 1                    // Optional
}

Response:
{
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "abc123xyz",
  "reference": "unique-reference-123",
  "status": "pending"
}
```

### 3. Verify Payment

```
GET /api/payments/verify/?reference={reference}

Headers:
  Authorization: Bearer {accessToken}

Response:
{
  "status": "success" | "failed" | "pending",
  "amount": 120000,
  "reference": "unique-reference-123",
  "payment_method": "paystack"
}
```

### 4. Get Paystack Config (Optional)

```
GET /api/payments/config/

Response:
{
  "paystack_public_key": "pk_live_...",
  "paystack_secret_key": "sk_live_..." // Backend only
}
```

---

## 🛠️ Using the Paystack Service

### Import the service

```javascript
import paystackService, {
  nairaToKobo,
  koboToNaira,
} from "../utils/paystackService";
```

### Initiate Provider Payment

```javascript
const result = await paystackService.initiateProviderSubscription(
  "monthly", // plan type
  150000 // amount in kobo
);

if (result.success) {
  window.location.href = result.authorizationUrl;
} else {
  console.error(result.error);
}
```

### Initiate Seeker Payment

```javascript
const result = await paystackService.initiateSeekerCheckout(
  bookingId,
  120000, // amount in kobo
  {
    plan_type: "quarterly",
    plan_id: 1,
  }
);

if (result.success) {
  window.location.href = result.authorizationUrl;
} else {
  console.error(result.error);
}
```

### Verify Payment

```javascript
const result = await paystackService.verifyPayment("reference-123");

if (result.success && result.status === "success") {
  // Payment confirmed
} else {
  // Payment failed
}
```

### Convert Units

```javascript
const kobo = nairaToKobo(5000); // 500000
const naira = koboToNaira(500000); // 5000
```

---

## 🔐 Redux Integration

### Provider Payment Redux

```javascript
import {
  initiateProviderSubscription,
  verifyProviderPayment,
  resetPaymentState,
} from "../Redux/ProviderPayment";

// In your component
const dispatch = useDispatch();
const { initiating, authorizationUrl, paymentStatus, error } = useSelector(
  (s) => s.providerPayment
);

// Initiate payment
await dispatch(
  initiateProviderSubscription({
    planType: "monthly",
    amount: 150000,
  })
);

// Verify payment
await dispatch(
  verifyProviderPayment({
    reference: "ref-123",
  })
);

// Reset state
dispatch(resetPaymentState());
```

### Seeker Payment Redux

```javascript
import {
  initiateSeekerCheckout,
  verifySeekerPayment,
  resetPaymentState,
} from "../Redux/SeekerPayment";

// In your component
const dispatch = useDispatch();
const { initiating, authorizationUrl, paymentStatus, error } = useSelector(
  (s) => s.seekerPayment
);

// Initiate checkout
await dispatch(
  initiateSeekerCheckout({
    bookingId: 123,
    amount: 120000,
    bookingDetails: { plan_type: "quarterly" },
  })
);

// Verify payment
await dispatch(
  verifySeekerPayment({
    reference: "ref-123",
  })
);

// Reset state
dispatch(resetPaymentState());
```

---

## 🎯 Usage Examples

### Example 1: Provider Payment Button Click

```javascript
import PaymentModal from "./PaymentModal";
import { useState } from "react";

function ProviderPaymentPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [amount, setAmount] = useState(5000);

  const handlePayment = () => {
    setSelectedPlan("monthly");
    setAmount(5000);
    setShowModal(true);
  };

  return (
    <>
      <button onClick={handlePayment}>Subscribe Now</button>

      <PaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        planType={selectedPlan}
        amount={amount}
      />
    </>
  );
}
```

### Example 2: Seeker Subscription

```javascript
import SubscriptionModal from "./SubscriptionModal";
import { useState } from "react";

function SubscriptionPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>View Plans</button>

      <SubscriptionModal onClose={() => setShowModal(false)} />
    </>
  );
}
```

---

## ⚙️ Configuration

### Add Paystack Script to HTML

In your `index.html`, add the Paystack script:

```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

### Environment Variables

Make sure your backend base URL is correctly set in `Redux/config.js`:

```javascript
export const BASE_URL = "https://backend.app.carenestpro.com";
```

### Authentication

The service automatically uses tokens from localStorage:

```javascript
localStorage.getItem("accessToken"); // or
localStorage.getItem("access");
```

---

## 🔒 Security Features

1. **Token-Based Authentication:** All API calls include Bearer token
2. **Amount in Kobo:** Prevents precision issues with currency
3. **Payment Verification:** Verify payment status before confirming
4. **Error Handling:** Comprehensive error responses
5. **User Verification Check:** Users must be verified (implemented earlier)

---

## 🚨 Error Handling

### Common Errors

```javascript
// Missing authentication
"Authentication required";

// Invalid plan
"Invalid plan selected";

// Payment initiation failed
"Failed to initiate provider payment";

// Payment verification failed
"Payment verification failed";
```

### Handling Errors in Components

```javascript
const [error, setError] = useState(null);

const handlePayment = async () => {
  try {
    const result = await dispatch(initiateProviderSubscription(...));
    if (result.payload?.error) {
      setError(result.payload.error);
    }
  } catch (err) {
    setError(err.message);
  }
};

// Display error
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
    <p className="text-red-600 text-sm">{error}</p>
  </div>
)}
```

---

## 📊 Payment State Management

### Provider Payment State

```javascript
{
  initiating: boolean,          // Payment initiation in progress
  paymentInitiated: boolean,    // Payment URL received
  authorizationUrl: string,     // Paystack checkout URL
  reference: string,            // Payment reference
  accessCode: string,           // Paystack access code
  verifying: boolean,           // Verification in progress
  paymentVerified: boolean,     // Payment confirmed
  paymentStatus: string,        // 'success' | 'failed' | 'pending'
  error: string,                // Error message
  success: boolean              // Overall success flag
}
```

---

## ✅ Testing Checklist

- [ ] User is verified before payment modal appears
- [ ] Payment modal shows correct plan details
- [ ] Amount is correctly converted to kobo
- [ ] Redirect to Paystack works
- [ ] Payment reference is stored
- [ ] Payment verification succeeds
- [ ] Error messages display correctly
- [ ] Loading states work properly
- [ ] Both provider and seeker flows work

---

## 🔄 Next Steps

1. **Verify Backend Endpoints:** Ensure your backend implements all three endpoints
2. **Test with Paystack:** Use Paystack test keys initially
3. **Payment Verification Callback:** Implement callback to verify payments after redirect
4. **Success Page:** Create a payment success redirect page
5. **Subscription Management:** Track user subscription status

---

## 📞 Support

If you encounter any issues:

1. Check Redux DevTools for state
2. Check browser console for errors
3. Verify authentication token is present
4. Ensure backend endpoints are returning correct format
5. Check Paystack integration script is loaded

---

## 📝 Notes

- Amounts are in **Kobo** (multiply Naira by 100)
- All payments require **valid authentication token**
- Users must be **verified** before payment (implemented earlier)
- Payment reference is used for verification
- After successful payment, update user subscription status
