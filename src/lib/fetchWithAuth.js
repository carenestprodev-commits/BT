import tokenService from "../utils/tokenService";

const withAuthHeaders = (options, token) => ({
  ...options,
  headers: {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});

export async function fetchWithAuth(url, options = {}) {
  const accessToken = tokenService.getAccessToken();
  let response = await fetch(url, withAuthHeaders(options, accessToken));

  if (response.status !== 401 || !accessToken) {
    return response;
  }

  const refreshedToken = await tokenService.refreshToken();
  if (!refreshedToken) {
    await tokenService.logout();
    throw new Error("Session expired");
  }

  response = await fetch(url, withAuthHeaders(options, refreshedToken));

  if (response.status === 401) {
    await tokenService.logout();
    throw new Error("Session expired");
  }

  return response;
}
