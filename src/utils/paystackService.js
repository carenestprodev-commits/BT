/**
 * Paystack Payment Service
 * Handles provider subscriptions & seeker payments
 */

import tokenService from "./tokenService";
import { fetchWithAuth } from "../lib/fetchWithAuth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ----------------------------------------
 * Internal helper: authenticated request
 * --------------------------------------*/
const authRequest = async (url, options = {}) => {
  let accessToken =
      localStorage.getItem("accessToken") || localStorage.getItem("access");

  if (!accessToken) {
    throw new Error("Authentication required. Please log in.");
  }

  let response = await fetchWithAuth(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });

  // Retry once on token expiration
  if (response.status === 401) {
    accessToken = await tokenService.refreshToken();
    if (!accessToken) {
      throw new Error("Session expired. Please log in again.");
    }

    response = await fetchWithAuth(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(options.headers || {}),
      },
    });
  }

  return response;
};

export const paystackService = {
  /* ======================================================
   * PROVIDER SUBSCRIPTION PAYMENT
   * ===================================================== */

  /**
   * Initiate provider subscription payment
   * @param {number} planId - subscription_plan.id from backend
   */
  initiateProviderSubscription: async (planId) => {
    if (!planId) {
      throw new Error("Invalid subscription plan selected");
    }

    const response = await authRequest(
        `${BASE_URL}/api/payments/provider-plans/subscribe/`,
        {
          method: "POST",
          body: JSON.stringify({
            plan_id: planId, // ✅ THIS IS WHAT YOU PASS
            payment_gateway: "paystack",
          }),
        }
    );

    const text = await response.text();

    if (!response.ok) {
      let message = "Failed to initiate subscription payment";
      try {
        const err = JSON.parse(text);
        message = err.message || err.detail || message;
      } catch {
        message = text || message;
      }
      throw new Error(message);
    }

    const data = JSON.parse(text);

    const authorizationUrl =
        data.authorization_url ||
        data.checkout_url ||
        data.payment_url ||
        data.url;

    if (!authorizationUrl) {
      throw new Error("Payment URL not returned from server");
    }

    return {
      authorizationUrl,
      reference: data.reference,
      accessCode: data.access_code,
      raw: data,
    };
  },

  /* ======================================================
   * CARE SEEKER CHECKOUT PAYMENT
   * ===================================================== */

  initiateSeekerCheckout: async ({
    bookingId,
    amount,
    bookingDetails = {},
  }) => {

    console.log("Initiate Seeker Checkout");
    console.log(bookingId);
    console.log(amount)
    console.log(bookingDetails);
    if (amount == null) {
      throw new Error("Invalid checkout details");
    }

    const response = await authRequest(
        `${BASE_URL}/api/payments/checkout/`,
        {
          method: "POST",
          body: JSON.stringify({
            booking_id: bookingId, // can be 0 for subscription
            amount,
            payment_method: "paystack",
            ...bookingDetails,
          }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Checkout initiation failed");
    }

    return {
      authorizationUrl: data.authorization_url || data.checkout_url,
      reference: data.reference,
      accessCode: data.access_code,
      raw: data,
    };
  },


  /* ======================================================
   * VERIFY PAYMENT
   * ===================================================== */

  verifyPayment: async (reference) => {
    if (!reference) {
      throw new Error("Payment reference is required");
    }

    const response = await authRequest(
        `${BASE_URL}/api/payments/verify/?reference=${reference}`,
        { method: "GET" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Payment verification failed");
    }

    return data;
  },

  /* ======================================================
   * PAYSTACK CONFIG
   * ===================================================== */

  getPublicKey: async () => {
    const response = await fetch(`${BASE_URL}/api/payments/config/`);
    if (!response.ok) return null;

    const data = await response.json();
    return data.paystack_public_key || data.public_key || null;
  },
};

/* ======================================================
 * HELPERS
 * ===================================================== */

export const nairaToKobo = (amount) => Math.round(amount * 100);
export const koboToNaira = (amount) => amount / 100;

export default paystackService;
