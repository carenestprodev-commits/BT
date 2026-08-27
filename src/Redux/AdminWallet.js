import { BASE_URL } from "./config";
import { fetchWithAuth } from "../lib/fetchWithAuth";

function errorMessage(data) {
  if (data?.detail) return data.detail;
  for (const value of Object.values(data || {})) {
    if (Array.isArray(value) && value[0]) return value[0];
    if (typeof value === "string") return value;
  }
  return "Unable to update the wallet.";
}

export async function deductAdminWallet({
  userId,
  amount,
  reason,
  description,
}) {
  const response = await fetchWithAuth(
    BASE_URL + "/api/admin/wallets/" + userId + "/deduct/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        reason,
        ...(description ? { description } : {}),
      }),
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(errorMessage(data));
  return data;
}
