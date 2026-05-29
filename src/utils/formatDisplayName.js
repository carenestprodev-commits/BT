/**
 * Title-case each word in a person's name for display.
 * @param {string|null|undefined} name
 * @returns {string}
 */
export function formatDisplayName(name) {
  if (!name || typeof name !== "string") return "";
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((part) =>
      part.length === 1
        ? part.toUpperCase()
        : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join(" ");
}

/**
 * @param {{ fullName?: string, firstName?: string, lastName?: string }} params
 * @returns {string}
 */
export function formatPersonName({ fullName, firstName, lastName } = {}) {
  const combined =
    (fullName && fullName.trim()) ||
    [firstName, lastName].filter((p) => p && String(p).trim()).join(" ").trim();
  return formatDisplayName(combined);
}
