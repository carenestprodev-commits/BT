import { BASE_URL } from "../Redux/config";
import {
  getCurrencyInfoForCountry,
  resolveCountryIso2Sync,
} from "../utils/countryHelper";

const SUPPORTED_COUNTRIES = ["NG", "US", "GB", "GH", "KE"];
const hourlyRateCache = {};
const DEFAULT_COUNTRY_CODE = "NG";
const DEFAULT_HOURLY_RATE_POLICY = {
  country_name: "Nigeria",
  currency_code: "NGN",
  currency_symbol: "₦",
  min_rate: 900,
  max_rate: 1200,
  average_rate: 1000,
};

const normalizeCountryCode = (countryInput = "NG") =>
  resolveCountryIso2Sync(countryInput) ||
  (countryInput || "").toString().trim().toUpperCase() ||
  "";

const toHourlyRateConfig = (policy, countryCode) => {
  const currencyInfo = getCurrencyInfoForCountry(countryCode);
  const minRate = Number(policy.min_rate ?? 0);
  const maxRate = Number(policy.max_rate ?? 0);
  const averageHourlyRate = Number(policy.average_rate ?? 0);
  return {
    country: policy.country_name || currencyInfo.countryIso2,
    currency: policy.currency_code || currencyInfo.currencyCode,
    symbol: policy.currency_symbol || currencyInfo.currencySymbol,
    averageHourlyRate,
    minRate,
    maxRate,
    description:
      policy.description ||
      `Average range in your area is ${
        policy.currency_symbol || currencyInfo.currencySymbol
      }${minRate.toLocaleString()} - ${
        policy.currency_symbol || currencyInfo.currencySymbol
      }${maxRate.toLocaleString()}`,
    countryCode,
  };
};

const DEFAULT_HOURLY_RATE_CONFIG = toHourlyRateConfig(
  DEFAULT_HOURLY_RATE_POLICY,
  DEFAULT_COUNTRY_CODE,
);

export const loadHourlyRatePolicies = async (
  countries = SUPPORTED_COUNTRIES,
) => {
  const uniqueCountries = [...new Set(countries.map(normalizeCountryCode))];
  const responses = await Promise.all(
    uniqueCountries.map(async (countryCode) => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/payments/hourly-rate-policy/?country=${encodeURIComponent(countryCode)}`,
        );
        if (!response.ok) return null;
        const policy = await response.json();
        return [countryCode, policy];
      } catch {
        return null;
      }
    }),
  );

  responses.forEach((entry) => {
    if (!entry) return;
    const [countryCode, policy] = entry;
    hourlyRateCache[countryCode] = toHourlyRateConfig(policy, countryCode);
  });
};

/**
 * Get hourly rate config for a country.
 */
export const getHourlyRateConfig = (countryInput = "NG") => {
  const countryCode = normalizeCountryCode(countryInput);
  return hourlyRateCache[countryCode] || DEFAULT_HOURLY_RATE_CONFIG;
};

export const getHourlyRateDescription = (countryCode = "NG") =>
  getHourlyRateConfig(countryCode).description;

export const getSliderRange = (countryCode = "NG") => {
  const config = getHourlyRateConfig(countryCode);
  return [config.minRate, config.maxRate, config.averageHourlyRate];
};

export default {
  loadHourlyRatePolicies,
  getHourlyRateConfig,
  getHourlyRateDescription,
  getSliderRange,
};
