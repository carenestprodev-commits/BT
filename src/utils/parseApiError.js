/**
 * Extract a human-readable message from a failed fetch Response body.
 */
export async function readApiErrorMessage(res, fallback = "Save failed") {
  try {
    const data = await res.clone().json();

    if (typeof data === "string" && data.trim()) {
      return data.trim();
    }

    if (data?.message) {
      return String(data.message);
    }

    if (data?.error) {
      return String(data.error);
    }

    if (data?.detail) {
      return String(data.detail);
    }

    if (data && typeof data === "object") {
      const parts = [];
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value) && value.length > 0) {
          parts.push(`${key}: ${value[0]}`);
        } else if (typeof value === "string" && value.trim()) {
          parts.push(`${key}: ${value}`);
        }
      }
      if (parts.length > 0) {
        return parts.join("\n");
      }
    }
  } catch {
    // ignore JSON parse errors
  }

  return fallback;
}
