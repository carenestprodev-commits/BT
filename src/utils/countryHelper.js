/**
 * Country Helper Utilities
 * Handles user country detection and localization
 */

/**
 * Get user's country from profile
 * Supports multiple country field names for flexibility
 * @returns {string|null} ISO2 country code (e.g., "NG", "US") or null
 */
export const getUserCountry = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Try multiple country field sources
    return (
      user?.country ||
      user?.location?.country ||
      user?.profile?.country ||
      user?.country_code ||
      null
    );
  } catch (error) {
    console.warn("Failed to get user country from profile:", error);
    return null;
  }
};

/**
 * Get country from IP address (fallback detection)
 * Uses ipapi.co free API
 * @returns {Promise<string|null>} ISO2 country code or null
 */
export const getCountryFromIP = async () => {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      timeout: 5000, // 5 second timeout
    });

    if (!response.ok) {
      console.warn("Failed to fetch country from IP");
      return null;
    }

    const data = await response.json();
    return data.country_code || null; // Returns ISO2 code
  } catch (error) {
    console.warn("Country detection from IP failed:", error);
    return null;
  }
};

/**
 * Detect user's country with fallback chain
 * 1. Check user profile
 * 2. Fallback to IP detection
 * 3. Default to Nigeria
 * @returns {Promise<string>} ISO2 country code (guaranteed non-null)
 */
export const detectUserCountry = async () => {
  // Try user profile first (no async needed)
  const profileCountry = getUserCountry();
  if (profileCountry) {
    return profileCountry;
  }

  // Fallback to IP detection
  const ipCountry = await getCountryFromIP();
  if (ipCountry) {
    return ipCountry;
  }

  // Default fallback
  return "NG"; // Default to Nigeria
};

/**
 * Format amount for display based on currency code
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - ISO currency code (e.g., "NGN", "USD")
 * @param {string} currencySymbol - Currency symbol (e.g., "₦", "$")
 * @returns {string} Formatted amount string
 */
export const formatCurrencyAmount = (
  amount,
  currencyCode = "NGN",
  currencySymbol = "₦",
) => {
  try {
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount)) {
      return `${currencySymbol}0`;
    }

    // For NGN, use Nigerian locale
    if (currencyCode === "NGN") {
      return `${currencySymbol}${numericAmount.toLocaleString("en-NG")}`;
    }

    // For other currencies, use standard Intl formatting
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (error) {
    console.warn("Currency formatting failed:", error);
    return `${currencySymbol}${amount}`;
  }
};

/**
 * Map currency code to symbol
 * @param {string} currencyCode - ISO currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode) => {
  const symbols = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
    EUR: "€",
    GHS: "₵",
    KES: "KSh",
    ZAR: "R",
  };

  return symbols[currencyCode] || currencyCode;
};

/**
 * Validate if error response contains gateway availability info
 * @param {Error|Object} error - Error object
 * @returns {boolean} True if error is gateway availability error
 */
export const isGatewayAvailabilityError = (error) => {
  return (
    error?.supportedGateways ||
    error?.supported_gateways ||
    (error?.response?.status === 400 &&
      error?.response?.data?.supported_gateways)
  );
};

export default {
  getUserCountry,
  getCountryFromIP,
  detectUserCountry,
  formatCurrencyAmount,
  getCurrencySymbol,
  isGatewayAvailabilityError,
};
