export const WALLET_REASON_OPTIONS = [
  ["outstanding_verification", "Outstanding verification"],
  ["service_fee", "Service fee"],
  ["other", "Other"],
];

export const money = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

export const humanize = (value) =>
  String(value || "—")
    .replaceAll("_", " ")
    .replace(
      /(^| )([a-z])/g,
      (_, prefix, character) => prefix + character.toUpperCase(),
    );
