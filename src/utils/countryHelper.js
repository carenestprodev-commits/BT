/**
 * Country Helper Utilities
 * Handles user country detection and localization
 */

export const COUNTRY_NAME_TO_ISO2 = {
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

export const COUNTRY_TO_CURRENCY = {
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

let countryNameToIsoCache = null;

const normalizeCountryInput = (value) =>
  (value || "").toString().trim().toLowerCase().replace(/\s+/g, " ");

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
 * Resolve ISO2 code from an input string.
 * Supports direct ISO2 values and locale formats like en_US / en-US.
 * @param {string|null|undefined} input
 * @returns {string|null}
 */
export const resolveCountryIso2 = (input) => {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[a-z]{2}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const localeMatch = trimmed.match(/[_-]([a-z]{2})$/i);
  if (localeMatch?.[1]) {
    return localeMatch[1].toUpperCase();
  }

  return null;
};

const buildCountryNameCache = () => {
  if (countryNameToIsoCache) return countryNameToIsoCache;
  countryNameToIsoCache = new Map();

  const add = (name, code) => {
    const key = normalizeCountryInput(name);
    if (key && code) countryNameToIsoCache.set(key, code.toUpperCase());
  };

  Object.entries(COUNTRY_NAME_TO_ISO2).forEach(([name, code]) =>
    add(name, code),
  );

  try {
    if (
      typeof Intl !== "undefined" &&
      typeof Intl.DisplayNames === "function" &&
      typeof Intl.supportedValuesOf === "function"
    ) {
      const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
      Intl.supportedValuesOf("region").forEach((code) => {
        add(regionNames.of(code), code);
      });
    }
  } catch (error) {
    console.warn("Failed to initialize country ISO cache:", error);
  }

  return countryNameToIsoCache;
};

/**
 * Convert country name to ISO2 when possible.
 * @param {string|null|undefined} countryName
 * @returns {Promise<string|null>}
 */
export const getIso2FromCountryName = async (countryName) => {
  const normalized = normalizeCountryInput(countryName);
  if (!normalized) return null;

  const cache = buildCountryNameCache();
  return cache.get(normalized) || null;
};

export const resolveCountryIso2Sync = (input) => {
  const iso2 = resolveCountryIso2(input);
  if (iso2) return iso2;
  return COUNTRY_NAME_TO_ISO2[normalizeCountryInput(input)] || null;
};

export const getCurrencyCodeForCountry = (countryInput) => {
  const countryIso2 = resolveCountryIso2Sync(countryInput);
  return COUNTRY_TO_CURRENCY[countryIso2] || null;
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
 * @returns {Promise<string|null>} ISO2 country code or null
 */
export const detectUserCountry = async () => {
  // Try user profile first
  const profileCountry = getUserCountry();
  const profileIso2 =
    resolveCountryIso2(profileCountry) ||
    (await getIso2FromCountryName(profileCountry));
  if (profileIso2) {
    return profileIso2;
  }

  // Fallback to IP detection
  const ipCountry = await getCountryFromIP();
  if (ipCountry && /^[A-Za-z]{2}$/.test(ipCountry)) {
    return ipCountry.toUpperCase();
  }

  return null;
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
  currencyCode = "",
  currencySymbol = "",
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
    if (!currencyCode) return `${currencySymbol}${numericAmount.toLocaleString()}`;
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
    CAD: "C$",
    AUD: "A$",
    INR: "₹",
    GHS: "₵",
    KES: "KSh",
    ZAR: "R",
  };

  return symbols[currencyCode] || currencyCode;
};

export const getCurrencyInfoForCountry = (countryInput) => {
  const countryIso2 = resolveCountryIso2Sync(countryInput) || "";
  const currencyCode = COUNTRY_TO_CURRENCY[countryIso2] || "";
  return {
    countryIso2,
    currencyCode,
    currencySymbol: getCurrencySymbol(currencyCode),
  };
};

export const getUserCurrencyInfo = () =>
  getCurrencyInfoForCountry(getUserCountry());

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
  resolveCountryIso2,
  getIso2FromCountryName,
  resolveCountryIso2Sync,
  getCountryFromIP,
  detectUserCountry,
  getCurrencyCodeForCountry,
  formatCurrencyAmount,
  getCurrencySymbol,
  getCurrencyInfoForCountry,
  getUserCurrencyInfo,
  isGatewayAvailabilityError,
};
