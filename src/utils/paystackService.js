/**
 * Paystack Payment Service
 * Handles provider subscriptions & seeker payments
 * Includes support for multi-currency and localized pricing
 */

import tokenService from "./tokenService";
import { fetchWithAuth } from "../lib/fetchWithAuth";
import { getUserCountry, detectUserCountry } from "./countryHelper";

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
   * @returns {Promise<Object>} Payment initialization response with localized fields
   */
  initiateProviderSubscription: async (planId) => {
    if (!planId) {
      throw new Error("Invalid subscription plan selected");
    }

    // Detect user's country for localized pricing
    let country = getUserCountry();
    if (!country) {
      try {
        country = await detectUserCountry();
      } catch (error) {
        console.warn("Country detection failed, using default:", error);
        country = "NG"; // Default to Nigeria
      }
    }

    const response = await authRequest(
      `${BASE_URL}/api/payments/provider-plans/subscribe/`,
      {
        method: "POST",
        body: JSON.stringify({
          plan_id: planId,
          payment_gateway: "paystack",
          country: country, // ✅ Include country for localized pricing
        }),
      },
    );

    const text = await response.text();

    if (!response.ok) {
      let message = "Failed to initiate subscription payment";
      let supportedGateways = null;

      try {
        const err = JSON.parse(text);
        message = err.message || err.detail || message;
        // Check for gateway availability error
        supportedGateways = err.supported_gateways || err.supportedGateways;
      } catch {
        message = text || message;
      }

      const error = new Error(message);
      if (supportedGateways) {
        error.supportedGateways = supportedGateways;
      }
      throw error;
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

    // Extract localized pricing fields from response
    return {
      authorizationUrl,
      reference: data.reference,
      accessCode: data.access_code,
      // Localized pricing fields
      localizedPrice: data.localized_price || data.amount,
      currencyCode: data.currency_code || "NGN",
      currencySymbol: data.currency_symbol || "₦",
      countryUsed: data.country_used || country,
      isFallbackPrice: data.is_fallback_price || false,
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
    console.log(amount);
    console.log(bookingDetails);

    if (amount == null) {
      throw new Error("Invalid checkout details");
    }

    // Detect user's country for localized pricing
    let country = getUserCountry();
    if (!country) {
      try {
        country = await detectUserCountry();
      } catch (error) {
        console.warn("Country detection failed, using default:", error);
        country = "NG"; // Default to Nigeria
      }
    }

    const response = await authRequest(`${BASE_URL}/api/payments/checkout/`, {
      method: "POST",
      body: JSON.stringify({
        booking_id: bookingId,
        amount,
        payment_method: "paystack",
        country: country, // ✅ Include country for localized pricing
        ...bookingDetails,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      let message = data.message || "Checkout initiation failed";
      let supportedGateways = null;

      // Check for gateway availability error
      if (data.supported_gateways || data.supportedGateways) {
        supportedGateways = data.supported_gateways || data.supportedGateways;
      }

      const error = new Error(message);
      if (supportedGateways) {
        error.supportedGateways = supportedGateways;
      }
      throw error;
    }

    // Extract localized pricing fields from response
    return {
      authorizationUrl: data.authorization_url || data.checkout_url,
      reference: data.reference,
      accessCode: data.access_code,
      // Localized pricing fields
      localizedPrice: data.localized_price || data.amount,
      currencyCode: data.currency_code || "NGN",
      currencySymbol: data.currency_symbol || "₦",
      countryUsed: data.country_used || country,
      isFallbackPrice: data.is_fallback_price || false,
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
      { method: "GET" },
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
