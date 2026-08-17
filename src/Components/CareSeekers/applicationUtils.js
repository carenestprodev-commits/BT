export const statusLabel = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "active" || value === "ongoing" || value === "accepted") return "Accepted";
  if (value === "rejected") return "Rejected";
  return "Open";
};
