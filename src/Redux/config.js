export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAuthHeaders = () => {
  const token = localStorage.getItem("access") || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
