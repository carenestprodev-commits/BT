/**
 * Hourly Rates Configuration by Country
 * This allows easy addition of new countries and their rates
 *
 * Product Manager Note:
 * "For now, we do the equivalent conversion.
 * Till I can get a survey feedback on the average hourly cost for different countries"
 *
 * TODO: Replace rates with actual survey data once available
 */

export const HOURLY_RATES_BY_COUNTRY = {
  NG: {
    country: "Nigeria",
    currency: "NGN",
    symbol: "₦",
    averageHourlyRate: 1000,
    minRate: 500,
    maxRate: 5000,
    description: "Average hourly rate is ₦1000",
  },
  US: {
    country: "United States",
    currency: "USD",
    symbol: "$",
    // TODO: Update with actual survey data
    averageHourlyRate: 15, // Estimated equivalent
    minRate: 10,
    maxRate: 50,
    description: "Average hourly rate is $15",
  },
  GB: {
    country: "United Kingdom",
    currency: "GBP",
    symbol: "£",
    // TODO: Update with actual survey data
    averageHourlyRate: 12, // Estimated equivalent
    minRate: 8,
    maxRate: 40,
    description: "Average hourly rate is £12",
  },
  GH: {
    country: "Ghana",
    currency: "GHS",
    symbol: "₵",
    // TODO: Update with actual survey data
    averageHourlyRate: 50, // Estimated equivalent
    minRate: 25,
    maxRate: 200,
    description: "Average hourly rate is ₵50",
  },
  KE: {
    country: "Kenya",
    currency: "KES",
    symbol: "KSh",
    // TODO: Update with actual survey data
    averageHourlyRate: 500, // Estimated equivalent
    minRate: 300,
    maxRate: 2000,
    description: "Average hourly rate is KSh 500",
  },
};

/**
 * Get hourly rate config for a country
 * Defaults to Nigeria (NG) if country not found
 *
 * @param {string} countryCode - ISO2 country code (e.g., "NG", "US")
 * @returns {Object} Hourly rate configuration for the country
 */
export const getHourlyRateConfig = (countryCode = "NG") => {
  return HOURLY_RATES_BY_COUNTRY[countryCode] || HOURLY_RATES_BY_COUNTRY["NG"];
};

/**
 * Get hourly rate description for a country
 * Used in UI to display pricing information
 *
 * @param {string} countryCode - ISO2 country code
 * @returns {string} Human-readable description
 */
export const getHourlyRateDescription = (countryCode = "NG") => {
  const config = getHourlyRateConfig(countryCode);
  return config.description;
};

/**
 * Get slider range for a country
 * Returns [minRate, maxRate, averageRate]
 *
 * @param {string} countryCode - ISO2 country code
 * @returns {Array} [min, max, average] hourly rates
 */
export const getSliderRange = (countryCode = "NG") => {
  const config = getHourlyRateConfig(countryCode);
  return [config.minRate, config.maxRate, config.averageHourlyRate];
};

export default {
  HOURLY_RATES_BY_COUNTRY,
  getHourlyRateConfig,
  getHourlyRateDescription,
  getSliderRange,
};
