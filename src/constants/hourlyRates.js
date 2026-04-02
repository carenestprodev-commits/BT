import { useSyncExternalStore } from "react";
import { BASE_URL } from "../Redux/config";
import {
  getCurrencyInfoForCountry,
  resolveCountryIso2Sync,
} from "../utils/countryHelper";

const hourlyRateCache = {};
const hourlyRateListeners = new Set();
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

const notifyHourlyRateListeners = () => {
  hourlyRateListeners.forEach((listener) => listener());
};

export const loadHourlyRatePolicies = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/payments/hourly-rate-policies/`,
    );
    if (!response.ok) return;

    const policies = await response.json();
    Object.keys(hourlyRateCache).forEach((key) => delete hourlyRateCache[key]);

    policies.forEach((policy) => {
      const countryCode = normalizeCountryCode(
        policy.country_code || policy.countryCode,
      );
      if (!countryCode) return;
      hourlyRateCache[countryCode] = toHourlyRateConfig(policy, countryCode);
    });

    notifyHourlyRateListeners();
  } catch {
    return;
  }
};

/**
 * Get hourly rate config for a country.
 */
export const getHourlyRateConfig = (countryInput = "NG") => {
  const countryCode = normalizeCountryCode(countryInput);
  return hourlyRateCache[countryCode] || DEFAULT_HOURLY_RATE_CONFIG;
};

export const useHourlyRateConfig = (countryInput = "NG") =>
  useSyncExternalStore(
    (listener) => {
      hourlyRateListeners.add(listener);
      return () => hourlyRateListeners.delete(listener);
    },
    () => getHourlyRateConfig(countryInput),
    () => getHourlyRateConfig(countryInput),
  );

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
