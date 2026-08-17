import { BASE_URL } from "../../Redux/config";
import { fetchWithAuth } from "../../lib/fetchWithAuth";

async function postApplicationAction(bookingId, action) {
  const response = await fetchWithAuth(
    `${BASE_URL}/api/bookings/${bookingId}/${action}/`,
    { method: "POST" },
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Could not ${action} application`);
  }

  return response.json().catch(() => ({}));
}

export const acceptApplication = (bookingId) =>
  postApplicationAction(bookingId, "accept");

export const rejectApplication = (bookingId) =>
  postApplicationAction(bookingId, "reject");

export const removeApplication = (bookingId) =>
  postApplicationAction(bookingId, "remove");
