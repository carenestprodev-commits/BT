const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const storages = [localStorage, sessionStorage];

const readKey = (key) => {
  for (const storage of storages) {
    const value = storage.getItem(key);
    if (value) {
      return value;
    }
  }
  return null;
};

const getAuthStorage = () => {
  for (const storage of storages) {
    if (
      storage.getItem("refresh") ||
      storage.getItem("refreshToken") ||
      storage.getItem("access") ||
      storage.getItem("accessToken")
    ) {
      return storage;
    }
  }
  return localStorage;
};

const clearAuthStorage = () => {
  for (const storage of storages) {
    storage.removeItem("access");
    storage.removeItem("refresh");
    storage.removeItem("accessToken");
    storage.removeItem("refreshToken");
    storage.removeItem("access_token");
    storage.removeItem("refresh_token");
    storage.removeItem("user");
    storage.removeItem("rememberMe");
  }

  localStorage.removeItem("seeker_user");
  localStorage.removeItem("provider_user");
  localStorage.removeItem("seeker_register_response");
  localStorage.removeItem("provider_register_response");
  localStorage.removeItem("is_subscribed");
  localStorage.removeItem("just_logged_in");
  localStorage.removeItem("subscription_modal_shown");
};

const setSession = ({ access, refresh, user }) => {
  const storage = getAuthStorage();

  if (access) {
    storage.setItem("access", access);
    storage.setItem("accessToken", access);
  }

  if (refresh) {
    storage.setItem("refresh", refresh);
    storage.setItem("refreshToken", refresh);
  }

  if (user) {
    storage.setItem("user", JSON.stringify(user));
  }
};

export const tokenService = {
  getAccessToken: () => readKey("access") || readKey("accessToken"),

  getRefreshToken: () => readKey("refresh") || readKey("refreshToken"),

  setSession,

  clearAuthStorage,

  refreshToken: async () => {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (!data.access) {
        return null;
      }

      setSession({ access: data.access });
      return data.access;
    } catch {
      return null;
    }
  },

  logout: async () => {
    const refreshToken = tokenService.getRefreshToken();

    if (refreshToken) {
      try {
        await fetch(`${BASE_URL}/api/auth/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        });
      } catch {}
    }

    clearAuthStorage();
    window.location.href = "/login";
  },
};

export default tokenService;
