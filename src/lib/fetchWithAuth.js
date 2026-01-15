const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("token");

    const response = await fetchWithAuth(API_URL + url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: token ? `Bearer ${token}` : "",
        },
    });

    // 🚨 TOKEN EXPIRED OR INVALID
    if (response.status === 401) {
        logout();
        throw new Error("Session expired. Logged out.");
    }

    return response;
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // hard redirect to clear state
    window.location.href = "/login";
}
