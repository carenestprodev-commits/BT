export const BASE_URL = "https://backend.app.carenestpro.com";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("access") || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
