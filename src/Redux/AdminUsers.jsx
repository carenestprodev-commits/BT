import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "./config";
import { fetchWithAuth } from "../lib/fetchWithAuth.js";

const fetchUserCollection = async (path, params = {}) => {
  const query = new URLSearchParams(
    Object.entries({ page: 1, page_size: 20, ...params }).reduce(
      (result, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          result[key] = Array.isArray(value) ? value.join(",") : String(value);
        }
        return result;
      },
      {},
    ),
  );
  const res = await fetchWithAuth(`${BASE_URL}${path}?${query}`);
  const data = await res.json();
  if (!res.ok) throw data;
  if (Array.isArray(data)) {
    return { results: data, count: data.length, page: 1, page_size: data.length };
  }
  return {
    results: Array.isArray(data.results) ? data.results : [],
    count: Number(data.count || 0),
    page: Number(data.page || params.page || 1),
    page_size: Number(data.page_size || params.page_size || 20),
  };
};

const collectionError = (error) =>
  error && typeof error === "object" ? error : { error: "Network error" };

export const fetchAdminStats = createAsyncThunk(
  "adminUsers/fetchAdminStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/stats/`);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      return data;
    } catch (error) {
      return rejectWithValue(collectionError(error));
    }
  },
);

export const fetchAllUsers = createAsyncThunk(
  "adminUsers/fetchAllUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await fetchUserCollection("/api/admin/users/all/", params);
    } catch (error) {
      return rejectWithValue(collectionError(error));
    }
  },
);

export const fetchProviders = createAsyncThunk(
  "adminUsers/fetchProviders",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await fetchUserCollection("/api/admin/users/providers/", params);
    } catch (error) {
      return rejectWithValue(collectionError(error));
    }
  },
);

export const fetchSeekers = createAsyncThunk(
  "adminUsers/fetchSeekers",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await fetchUserCollection("/api/admin/users/seekers/", params);
    } catch (error) {
      return rejectWithValue(collectionError(error));
    }
  },
);

export const fetchNewSignups = createAsyncThunk(
  "adminUsers/fetchNewSignups",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await fetchUserCollection("/api/admin/users/new-signups/", params);
    } catch (error) {
      return rejectWithValue(collectionError(error));
    }
  },
);

export const fetchUserById = createAsyncThunk(
  "adminUsers/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const access =
        localStorage.getItem("accessToken") || localStorage.getItem("access");
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

export const updateUser = createAsyncThunk(
  "adminUsers/updateUser",
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("accessToken") || localStorage.getItem("access");
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/users/${id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
        body: JSON.stringify(changes),
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
      const access =
        localStorage.getItem("accessToken") || localStorage.getItem("access");
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

export const deleteUserImage = createAsyncThunk(
  "adminUsers/deleteUserImage",
  async (id, { rejectWithValue }) => {
    try {
      const access =
        localStorage.getItem("accessToken") || localStorage.getItem("access");
      const headers = access ? { Authorization: `Bearer ${access}` } : {};
      const res = await fetchWithAuth(
        `${BASE_URL}/api/admin/users/${id}/delete-image/`,
        { method: "DELETE", headers },
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      return { id };
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  },
);

export const uploadUserImage = createAsyncThunk(
  "adminUsers/uploadUserImage",
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("accessToken") || localStorage.getItem("access");
      const form = new FormData();
      form.append("profile_image", file);
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/users/${id}/upload-image/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${access}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      return data;
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  },
);

export const suspendUser = createAsyncThunk(
  "adminUsers/suspendUser",
  async (id, { rejectWithValue }) => {
    try {
      const access =
        localStorage.getItem("accessToken") || localStorage.getItem("access");
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
      const access =
        localStorage.getItem("accessToken") || localStorage.getItem("access");
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

export const verifyProvider = createAsyncThunk(
  "adminUsers/verifyProvider",
  async (id, { rejectWithValue }) => {
    try {
      const access =
        localStorage.getItem("accessToken") || localStorage.getItem("access");
      const headers = access
        ? {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        }
        : { "Content-Type": "application/json" };
      const res = await fetchWithAuth(
        `${BASE_URL}/api/admin/users/providers/${id}/verify/`,
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

export const updateUserScreening = createAsyncThunk(
  "adminUsers/updateUserScreening",
  async ({ id, status, action }, { rejectWithValue }) => {
    try {
      const access =
        localStorage.getItem("accessToken") || localStorage.getItem("access");
      const headers = {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      };
      const res = await fetchWithAuth(
        `${BASE_URL}/api/admin/users/${id}/screening/`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status, action }),
        },
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      return { id, data };
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  },
);

export const bulkUpdateUserScreening = createAsyncThunk(
  "adminUsers/bulkUpdateUserScreening",
  async ({ userIds, status }, { rejectWithValue }) => {
    try {
      const access =
        localStorage.getItem("accessToken") || localStorage.getItem("access");
      const headers = {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      };
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/users/screening/bulk/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ user_ids: userIds, status }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      return data;
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  },
);

/**
 * ✅ NEW: Mark Physical Documents as Received
 *
 * This action creates or updates a verification record for a user
 * when their physical documents are submitted offline.
 *
 * FLOW:
 * 1. Admin receives physical documents in person
 * 2. Admin clicks "Mark Documents Received" in the users table
 * 3. This creates/updates a verification record with status "documents_received"
 * 4. Now admin can approve the user
 *
 * BENEFIT:
 * - Supports offline document verification
 * - Creates the verification record needed by the backend
 * - User now shows as "Documents Received" in the table
 */
export const markDocumentsReceived = createAsyncThunk(
  "adminUsers/markDocumentsReceived",
  async ({ userId, documentDetails }, { rejectWithValue }) => {
    try {
      const access =
        localStorage.getItem("accessToken") || localStorage.getItem("access");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      };

      // First, try to find existing verification record for this user
      let verificationId = null;
      try {
        const verRes = await fetchWithAuth(
          `${BASE_URL}/api/admin/verifications/`,
          { headers },
        );
        const verData = await verRes.json();
        const verifications = Array.isArray(verData)
          ? verData
          : verData.results || [];
        const userVerification = verifications.find(
          (v) => v.user_id === userId,
        );
        if (userVerification) {
          verificationId = userVerification.id;
        }
      } catch (err) {
        console.error("Error checking for existing verification:", err);
      }

      const payload = {
        user_id: userId,
        verification_status: "documents_received",
        verification_method: "physical_documents",
        notes: documentDetails?.notes || "Physical documents received",
        received_date:
          documentDetails?.received_date ||
          new Date().toISOString().split("T")[0],
      };

      let result;

      if (verificationId) {
        // Update existing verification record
        const res = await fetchWithAuth(
          `${BASE_URL}/api/admin/verifications/${verificationId}/`,
          {
            method: "PATCH",
            headers,
            body: JSON.stringify(payload),
          },
        );
        const data = await res.json();
        if (!res.ok) return rejectWithValue(data);
        result = data;
      } else {
        // Create new verification record for physical documents
        const res = await fetchWithAuth(
          `${BASE_URL}/api/admin/verifications/`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          },
        );
        const data = await res.json();
        if (!res.ok) return rejectWithValue(data);
        result = data;
      }

      return { userId, data: result };
    } catch (error) {
      console.error("markDocumentsReceived error:", error);
      return rejectWithValue({
        error: "Failed to mark documents as received",
      });
    }
  },
);

/**
 * ✅ UPDATED: Approve User (Now works with physical documents)
 *
 * This has been updated to support the new flow:
 * 1. User's physical documents are marked as received
 * 2. Verification record now exists with status "documents_received"
 * 3. Admin can now approve the user
 *
 * The approval now has better error handling and logs
 */
export const approveUser = createAsyncThunk(
  "adminUsers/approveUser",
  async ({ id, manualPayment }, { rejectWithValue }) => {
    try {
      const access =
        localStorage.getItem("accessToken") || localStorage.getItem("access");
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

        const userVerification = verifications.find((v) => v.user_id === id);
        if (userVerification) {
          verificationId = userVerification.id;
          console.log(
            "Found verification record:",
            verificationId,
            "with status:",
            userVerification.verification_status,
          );
        } else {
          console.log("No verification record found for user:", id);
        }
      } catch (err) {
        console.error("Error fetching verifications:", err);
      }

      let approvalResult = null;

      if (verificationId) {
        // Approve via verification endpoint
        console.log("Approving user via verification endpoint...");
        const body = JSON.stringify({
          action: "approve",
          verification_status: "verified",
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
        approvalResult = data;
      } else {
        // No verification record - this shouldn't happen after markDocumentsReceived
        console.error(
          "ERROR: No verification record found. User must mark documents as received first!",
        );
        return rejectWithValue({
          detail:
            "User must have physical documents marked as received before approval. Please mark documents first.",
          error_code: "NO_VERIFICATION_RECORD",
        });
      }

      // Fetch the updated user profile
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

      return { id, data: approvalResult, verified: true, updatedUser };
    } catch (error) {
      console.error("approveUser error:", error);
      return rejectWithValue({ error: "Network error during approval" });
    }
  },
);

const applyUserCollection = (state, payload) => {
  state.users = payload?.results || [];
  state.userCount = Number(payload?.count || 0);
  state.userPage = Number(payload?.page || 1);
  state.userPageSize = Number(payload?.page_size || 20);
};

const slice = createSlice({
  name: "adminUsers",
  initialState: {
    stats: {
      total_users: 0,
      total_providers: 0,
      total_seekers: 0,
      new_sign_ups: 0,
      verified_users: 0,
      incomplete_profiles: 0,
      profiles_awaiting_verification: 0,
    },
    users: [],
    userCount: 0,
    userPage: 1,
    userPageSize: 20,
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
    verificationLoading: false,
    verificationError: null,
    screeningLoading: false,
    screeningError: null,
    documentsLoading: false,
    documentsError: null,
    lastFetchType: null, // Track which fetch was last initiated
    latestUserRequestId: null,
  },
  reducers: {
    clearAdminUsers(state) {
      state.users = [];
      state.userCount = 0;
      state.userPage = 1;
      state.stats = {
        total_users: 0,
        total_providers: 0,
        total_seekers: 0,
        new_sign_ups: 0,
        verified_users: 0,
        incomplete_profiles: 0,
        profiles_awaiting_verification: 0,
      };
      state.loading = false;
      state.error = null;
      state.usersLoading = false;
      state.usersError = null;
      state.latestUserRequestId = null;
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

      .addCase(fetchAllUsers.pending, (state, action) => {
        state.usersLoading = true;
        state.usersError = null;
        state.lastFetchType = "all";
        state.latestUserRequestId = action.meta.requestId;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        if (state.lastFetchType === "all" && state.latestUserRequestId === action.meta.requestId) {
          state.usersLoading = false;
          applyUserCollection(state, action.payload);
        }
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        if (state.lastFetchType === "all" && state.latestUserRequestId === action.meta.requestId) {
          state.usersLoading = false;
          state.usersError = action.payload || action.error;
        }
      })

      .addCase(fetchUserById.pending, (state) => {
        state.currentUserLoading = true;
        state.currentUserError = null;
        state.currentUser = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.currentUserLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.currentUserLoading = false;
        state.currentUserError = action.payload || action.error;
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        const user = action.payload;
        state.users = state.users.map((item) => item.id === user.id ? { ...item, ...user } : item);
        if (state.currentUser?.id === user.id) state.currentUser = user;
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
        if (id != null) {
          state.users = state.users.map((u) =>
            u.id === id ? { ...u, is_active: false } : u,
          );
        }
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

      // Handlers for fetchProviders
      .addCase(fetchProviders.pending, (state, action) => {
        state.usersLoading = true;
        state.usersError = null;
        state.lastFetchType = "providers";
        state.latestUserRequestId = action.meta.requestId;
      })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        // Only update if this is still the expected fetch type
        if (state.lastFetchType === "providers" && state.latestUserRequestId === action.meta.requestId) {
          state.usersLoading = false;
          applyUserCollection(state, action.payload);
        }
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        if (state.lastFetchType === "providers" && state.latestUserRequestId === action.meta.requestId) {
          state.usersLoading = false;
          state.usersError = action.payload || action.error;
        }
      })

      // Handlers for fetchSeekers
      .addCase(fetchSeekers.pending, (state, action) => {
        state.usersLoading = true;
        state.usersError = null;
        state.lastFetchType = "seekers";
        state.latestUserRequestId = action.meta.requestId;
      })
      .addCase(fetchSeekers.fulfilled, (state, action) => {
        // Only update if this is still the expected fetch type
        if (state.lastFetchType === "seekers" && state.latestUserRequestId === action.meta.requestId) {
          state.usersLoading = false;
          applyUserCollection(state, action.payload);
        }
      })
      .addCase(fetchSeekers.rejected, (state, action) => {
        if (state.lastFetchType === "seekers" && state.latestUserRequestId === action.meta.requestId) {
          state.usersLoading = false;
          state.usersError = action.payload || action.error;
        }
      })

      // Handlers for fetchNewSignups
      .addCase(fetchNewSignups.pending, (state, action) => {
        state.usersLoading = true;
        state.usersError = null;
        state.lastFetchType = "signups";
        state.latestUserRequestId = action.meta.requestId;
      })
      .addCase(fetchNewSignups.fulfilled, (state, action) => {
        // Only update if this is still the expected fetch type
        if (state.lastFetchType === "signups" && state.latestUserRequestId === action.meta.requestId) {
          state.usersLoading = false;
          applyUserCollection(state, action.payload);
        }
      })
      .addCase(fetchNewSignups.rejected, (state, action) => {
        if (state.lastFetchType === "signups" && state.latestUserRequestId === action.meta.requestId) {
          state.usersLoading = false;
          state.usersError = action.payload || action.error;
        }
      })

      // Handlers for verifyProvider
      .addCase(verifyProvider.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
      })
      .addCase(verifyProvider.fulfilled, (state, action) => {
        state.verificationLoading = false;
        const id = action.payload?.id;
        if (id != null) {
          state.users = state.users.map((u) =>
            u.id === id
              ? { ...u, is_verified: true, verification_status: "verified" }
              : u,
          );
        }
      })
      .addCase(verifyProvider.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload || action.error;
      })

      .addCase(updateUserScreening.fulfilled, (state, action) => {
        state.screeningLoading = false;
        const id = action.payload?.id;
        const screening = action.payload?.data || {};
        if (id != null) {
          state.users = state.users.map((u) =>
            u.id === id
              ? {
                ...u,
                screening_status: screening.status || screening.status_label || u.screening_status,
              }
              : u,
          );
        }
        if (state.currentUser && state.currentUser.id === id) {
          state.currentUser = {
            ...state.currentUser,
            screening: {
              ...(state.currentUser.screening || {}),
              ...screening,
            },
          };
        }
      })
      .addCase(updateUserScreening.rejected, (state, action) => {
        state.screeningLoading = false;
        state.screeningError = action.payload || action.error;
      })

      .addCase(bulkUpdateUserScreening.fulfilled, (state, action) => {
        state.screeningLoading = false;
        const updated = action.payload?.updated || [];
        if (Array.isArray(updated) && updated.length) {
          const updatedIds = new Set(updated.map((item) => item.user_id));
          state.users = state.users.map((u) =>
            updatedIds.has(u.id)
              ? {
                ...u,
                screening_status:
                  updated.find((item) => item.user_id === u.id)?.status || u.screening_status,
              }
              : u,
          );
          if (state.currentUser && updatedIds.has(state.currentUser.id)) {
            const match = updated.find((item) => item.user_id === state.currentUser.id);
            state.currentUser = {
              ...state.currentUser,
              screening: {
                ...(state.currentUser.screening || {}),
                status: match?.status || state.currentUser.screening?.status,
              },
            };
          }
        }
      })
      .addCase(bulkUpdateUserScreening.rejected, (state, action) => {
        state.screeningLoading = false;
        state.screeningError = action.payload || action.error;
      })

      .addCase(updateUserScreening.pending, (state) => {
        state.screeningLoading = true;
        state.screeningError = null;
      })
      .addCase(bulkUpdateUserScreening.pending, (state) => {
        state.screeningLoading = true;
        state.screeningError = null;
      })

      // ✅ NEW: Mark Documents Received handlers
      .addCase(markDocumentsReceived.pending, (state) => {
        state.documentsLoading = true;
        state.documentsError = null;
      })
      .addCase(markDocumentsReceived.fulfilled, (state, action) => {
        state.documentsLoading = false;
        const userId = action.payload?.userId;
        if (userId != null) {
          state.users = state.users.map((u) =>
            u.id === userId
              ? {
                ...u,
                verification_status: "documents_received",
                documents_received: true,
              }
              : u,
          );
        }
      })
      .addCase(markDocumentsReceived.rejected, (state, action) => {
        state.documentsLoading = false;
        state.documentsError = action.payload || action.error;
      })

      .addCase(approveUser.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        state.verificationLoading = false;
        const id = action.payload?.id;
        if (id != null) {
          state.users = state.users.map((u) =>
            u.id === id
              ? {
                ...u,
                is_verified: true,
                verification_status: "verified",
              }
              : u,
          );
        }
        if (state.currentUser && state.currentUser.id === id) {
          state.currentUser = {
            ...state.currentUser,
            is_verified: true,
            verification_status: "verified",
          };
        }
      })
      .addCase(approveUser.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload || action.error;
      })
      .addCase(deleteUserImage.fulfilled, (state, action) => {
        const id = action.payload?.id;
        if (id != null) {
          state.users = state.users.map((u) =>
            u.id === id
              ? {
                ...u,
                profileImageUrl: "",
                profile_image_url: "",
                has_profile_picture: false,
              }
              : u,
          );
        }
        if (state.currentUser && state.currentUser.id === id) {
          state.currentUser = {
            ...state.currentUser,
            profileImageUrl: "",
            profile_image_url: "",
            profile_image: "",
          };
        }
      });
  },
});

export const { clearAdminUsers, clearCurrentUser } = slice.actions;
export default slice.reducer;
