import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "./config";
import { fetchWithAuth } from "../lib/fetchWithAuth.js";

export const fetchAdminStats = createAsyncThunk(
  "adminUsers/fetchAdminStats",
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = access ? { Authorization: `Bearer ${access}` } : {};
      const res = await fetch(`${BASE_URL}/api/admin/stats`, { headers });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      return data;
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  },
);

export const fetchAllUsers = createAsyncThunk(
  "adminUsers/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = access ? { Authorization: `Bearer ${access}` } : {};
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/users/all/`, {
        headers,
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      return Array.isArray(data) ? data : [];
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  },
);

export const fetchUserById = createAsyncThunk(
  "adminUsers/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = access ? { Authorization: `Bearer ${access}` } : {};
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/users/${id}/`, {
        headers,
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      return data;
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  },
);

export const deleteUser = createAsyncThunk(
  "adminUsers/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = access ? { Authorization: `Bearer ${access}` } : {};
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/users/${id}/`, {
        method: "DELETE",
        headers,
      });
      if (res.status === 204 || res.ok) {
        return id;
      }
      const data = await res.json();
      return rejectWithValue(data);
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  },
);

export const suspendUser = createAsyncThunk(
  "adminUsers/suspendUser",
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = access
        ? {
            Authorization: `Bearer ${access}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" };
      const res = await fetchWithAuth(
        `${BASE_URL}/api/admin/users/${id}/suspend/`,
        { method: "POST", headers },
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      // return the id so reducers can update the store
      return { id, data };
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  },
);

export const activateUser = createAsyncThunk(
  "adminUsers/activateUser",
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = access
        ? {
            Authorization: `Bearer ${access}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" };
      const res = await fetchWithAuth(
        `${BASE_URL}/api/admin/users/${id}/activate/`,
        { method: "POST", headers },
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      return { id, data };
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  },
);

export const approveUser = createAsyncThunk(
  "adminUsers/approveUser",
  async ({ id, manualPayment }, { rejectWithValue, dispatch }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = { "Content-Type": "application/json" };
      if (access) headers["Authorization"] = `Bearer ${access}`;

      // First, fetch all verifications to find the one for this user
      let verificationId = null;
      try {
        const verRes = await fetchWithAuth(
          `${BASE_URL}/api/admin/verifications/`,
          {
            headers: { Authorization: `Bearer ${access}` },
          },
        );
        const verData = await verRes.json();
        const verifications = Array.isArray(verData)
          ? verData
          : verData.results || [];

        // Find the verification record for this user
        const userVerification = verifications.find((v) => v.user_id === id);
        if (userVerification) {
          verificationId = userVerification.id;
        }
      } catch (err) {
        console.error("Error fetching verifications:", err);
      }

      // If no verification found, return error
      if (!verificationId) {
        return rejectWithValue({
          detail:
            "User has not started verification process yet. Please ask them to start verification.",
        });
      }

      const body = JSON.stringify({
        action: "approve",
        ...(manualPayment ? manualPayment : {}),
      });

      const res = await fetchWithAuth(
        `${BASE_URL}/api/admin/verifications/${verificationId}/`,
        {
          method: "PATCH",
          headers,
          body,
        },
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);

      // Refresh the admin's user list
      try {
        dispatch(fetchAllUsers());
      } catch {
        /* ignore refresh error */
      }

      // Fetch the updated user profile to get the latest is_verified status
      let updatedUser = null;
      try {
        const userRes = await fetchWithAuth(`${BASE_URL}/api/auth/user/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        updatedUser = await userRes.json();
        console.log("Updated user after verification:", updatedUser);
      } catch (err) {
        console.error("Error fetching updated user:", err);
      }

      return { id, data, verified: true, updatedUser };
    } catch (error) {
      console.error("approveUser error:", error);
      return rejectWithValue({ error: "Network error" });
    }
  },
);

const slice = createSlice({
  name: "adminUsers",
  initialState: {
    stats: {
      total_users: 0,
      total_providers: 0,
      total_seekers: 0,
      new_sign_ups: 0,
    },
    users: [],
    currentUser: null,
    loading: false,
    error: null,
    usersLoading: false,
    usersError: null,
    currentUserLoading: false,
    currentUserError: null,
    deleteLoading: false,
    deleteError: null,
    suspendLoading: false,
    suspendError: null,
  },
  reducers: {
    clearAdminUsers(state) {
      state.users = [];
      state.stats = {
        total_users: 0,
        total_providers: 0,
        total_seekers: 0,
        new_sign_ups: 0,
      };
      state.loading = false;
      state.error = null;
    },
    clearCurrentUser(state) {
      state.currentUser = null;
      state.currentUserLoading = false;
      state.currentUserError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      })

      .addCase(fetchAllUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload || action.error;
      })

      .addCase(fetchUserById.pending, (state) => {
        state.currentUserLoading = true;
        state.currentUserError = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.currentUserLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.currentUserLoading = false;
        state.currentUserError = action.payload || action.error;
      })

      .addCase(deleteUser.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const id = action.payload;
        state.users = state.users.filter((u) => u.id !== id);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || action.error;
      })

      .addCase(suspendUser.pending, (state) => {
        state.suspendLoading = true;
        state.suspendError = null;
      })
      .addCase(suspendUser.fulfilled, (state, action) => {
        state.suspendLoading = false;
        const id = action.payload?.id;
        // mark the user as not active in the users list
        if (id != null) {
          state.users = state.users.map((u) =>
            u.id === id ? { ...u, is_active: false } : u,
          );
        }
        // also update currentUser if it's the same
        if (state.currentUser && state.currentUser.id === id) {
          state.currentUser = { ...state.currentUser, is_active: false };
        }
      })
      .addCase(suspendUser.rejected, (state, action) => {
        state.suspendLoading = false;
        state.suspendError = action.payload || action.error;
      })

      .addCase(activateUser.pending, (state) => {
        state.suspendLoading = true;
        state.suspendError = null;
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        state.suspendLoading = false;
        const id = action.payload?.id;
        if (id != null) {
          state.users = state.users.map((u) =>
            u.id === id ? { ...u, is_active: true } : u,
          );
        }
        if (state.currentUser && state.currentUser.id === id) {
          state.currentUser = { ...state.currentUser, is_active: true };
        }
      })
      .addCase(activateUser.rejected, (state, action) => {
        state.suspendLoading = false;
        state.suspendError = action.payload || action.error;
      })

      .addCase(approveUser.pending, (state) => {
        state.suspendLoading = true;
        state.suspendError = null;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        state.suspendLoading = false;
        const id = action.payload?.id;
        if (id != null) {
          state.users = state.users.map((u) =>
            u.id === id ? { ...u, is_verified: true } : u,
          );
        }
        if (state.currentUser && state.currentUser.id === id) {
          state.currentUser = { ...state.currentUser, is_verified: true };
        }
      })
      .addCase(approveUser.rejected, (state, action) => {
        state.suspendLoading = false;
        state.suspendError = action.payload || action.error;
      });
  },
});

export const { clearAdminUsers, clearCurrentUser } = slice.actions;
export default slice.reducer;
