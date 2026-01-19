/* eslint-disable no-unused-vars */
/**
 * Paystack Payment Service
 * Handles all Paystack integration for both CareProviders and CareSeekers
 */

import tokenService from "./tokenService";
import {fetchWithAuth} from "../lib/fetchWithAuth.js";

const BASE_URL = "https://backend.app.carenestpro.com";

export const paystackService = {
  /**
   * Initiate Provider Subscription Payment
   * @param {string} planType - 'monthly', 'quarterly', etc. (or plan_id if you have it)
   * @param {number} amount - Amount in kobo (Paystack uses kobo)
   * @returns {Promise<Object>} - Payment authorization data
   */
  initiateProviderSubscription: async (planType, amount) => {
    try {
      let accessToken =
        localStorage.getItem("accessToken") || localStorage.getItem("access");

      if (!accessToken) {
        throw new Error("Authentication required. Please log in.");
      }

      // Prepare the payload based on what backend expects
      const payload = {
        plan_id: 4, // The ₦80,000 subscription plan ID
        payment_gateway: "paystack",
      };

      console.log("Initiating payment with:", payload);

      let response = await fetchWithAuth(
        `${BASE_URL}/api/payments/provider-plans/subscribe/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      // If token expired, try to refresh and retry
      if (response.status === 401) {
        console.log("Token expired, attempting refresh...");
        accessToken = await tokenService.refreshToken();

        if (!accessToken) {
          throw new Error("Your session has expired. Please log in again.");
        }

        // Retry the request with new token
        response = await fetchWithAuth(
          `${BASE_URL}/api/payments/provider-plans/subscribe/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
          }
        );
      }

      // Get response text first to handle both JSON and non-JSON responses
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (!response.ok) {
        let errorMessage = "Failed to initiate provider payment";
        try {
          const errorData = JSON.parse(responseText);

          // Handle authentication errors
          if (response.status === 401 || errorData.code === "token_not_valid") {
            errorMessage = "Your session has expired. Please log in again.";
            // Optionally redirect to login
            // window.location.href = '/login';
          } else {
            errorMessage =
              errorData.message ||
              errorData.error ||
              errorData.detail ||
              errorMessage;

            // Handle specific error types
            if (errorData.plan_type) {
              errorMessage = `Plan type error: ${errorData.plan_type}`;
            }
            if (errorData.amount) {
              errorMessage = `Amount error: ${errorData.amount}`;
            }
          }
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Invalid response format from server");
      }

      console.log("Payment initiated successfully:", data);

      // Handle different possible response formats
      const authUrl =
        data.checkout_url ||
        data.authorization_url ||
        data.payment_url ||
        data.url;

      if (!authUrl) {
        throw new Error("No payment URL received from server");
      }

      return {
        success: true,
        authorizationUrl: authUrl,
        accessCode: data.access_code,
        reference: data.reference,
        ...data,
      };
    } catch (error) {
      console.error("Provider payment initiation error:", error);
      throw error; // Re-throw to be caught by Redux thunk
    }
  },

  /**
   * Initiate CareSeeker Booking Payment (Checkout)
   * @param {number} bookingId - The booking ID
   * @param {number} amount - Amount in kobo
   * @param {Object} bookingDetails - Additional booking details
   * @returns {Promise<Object>} - Payment authorization data
   */
  initiateSeekerCheckout: async (bookingId, amount, bookingDetails = {}) => {
    try {
      const accessToken =
        localStorage.getItem("accessToken") || localStorage.getItem("access");

      if (!accessToken) {
        throw new Error("Authentication required");
      }

      const response = await fetchWithAuth(`${BASE_URL}/api/payments/checkout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          booking_id: bookingId,
          amount: amount,
          payment_method: "paystack",
          ...bookingDetails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to initiate checkout payment"
        );
      }

      const data = await response.json();
      return {
        success: true,
        authorizationUrl: data.authorization_url || data.payment_url,
        accessCode: data.access_code,
        reference: data.reference,
        ...data,
      };
    } catch (error) {
      console.error("Seeker checkout payment error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Verify Payment Status
   * @param {string} reference - Payment reference from Paystack
   * @returns {Promise<Object>} - Payment verification data
   */
  verifyPayment: async (reference) => {
    try {
      const accessToken =
        localStorage.getItem("accessToken") || localStorage.getItem("access");

      if (!accessToken) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${BASE_URL}/api/payments/verify/?reference=${reference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment verification failed");
      }

      const data = await response.json();
      return {
        success: true,
        status: data.status,
        ...data,
      };
    } catch (error) {
      console.error("Payment verification error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Open Paystack payment modal/redirect
   * @param {Object} options - Configuration options
   */
  openPaystackModal: (options) => {
    if (!window.PaystackPop) {
      console.error("Paystack script not loaded");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: options.publicKey,
      email: options.email,
      amount: options.amount, // in kobo
      ref: options.reference,
      onClose: () => {
        if (options.onClose) options.onClose();
      },
      onSuccess: (response) => {
        if (options.onSuccess) options.onSuccess(response);
      },
    });

    handler.openIframe();
  },

  /**
   * Get Paystack public key from backend
   * @returns {Promise<string>} - Paystack public key
   */
  getPublicKey: async () => {
    try {
      const accessToken =
        localStorage.getItem("accessToken") || localStorage.getItem("access");

      const response = await fetch(`${BASE_URL}/api/payments/config/`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Paystack config");
      }

      const data = await response.json();
      return data.paystack_public_key || data.public_key;
    } catch (error) {
      console.error("Error fetching Paystack public key:", error);
      return null;
    }
  },
};

/**
 * Helper function to convert Naira to Kobo
 * Paystack uses kobo as the smallest unit (1 Naira = 100 Kobo)
 */
export const nairaToKobo = (amount) => {
  return Math.round(amount * 100);
};

/**
 * Helper function to convert Kobo to Naira
 */
export const koboToNaira = (amount) => {
  return amount / 100;
};

export default paystackService;
