import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "./config";
import { fetchWithAuth } from "../lib/fetchWithAuth.js";

export const fetchVerifications = createAsyncThunk(
  "verification/fetchVerifications",
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = access ? { Authorization: `Bearer ${access}` } : {};
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/verifications/`, {
        headers,
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      return Array.isArray(data) ? data : data.results || [];
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  },
);

export const fetchVerificationById = createAsyncThunk(
  "verification/fetchVerificationById",
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = access ? { Authorization: `Bearer ${access}` } : {};
      const res = await fetchWithAuth(
        `${BASE_URL}/api/admin/verifications/${id}/`,
        {
          headers,
        },
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      return data;
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  },
);

export const postVerificationAction = createAsyncThunk(
  "verification/postVerificationAction",
  async (
    { id, action, feedback, manualPayment },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const access = localStorage.getItem("access");
      const headers = { "Content-Type": "application/json" };
      if (access) headers["Authorization"] = `Bearer ${access}`;
      const body = JSON.stringify({
        action,
        ...(feedback ? { feedback } : {}),
        ...(manualPayment ? manualPayment : {}),
      });
      const res = await fetchWithAuth(
        `${BASE_URL}/api/admin/verifications/${id}/`,
        {
          method: "PATCH",
          headers,
          body,
        },
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);

      // ✅ Refresh verifications list
      try {
        dispatch(fetchVerifications());
      } catch {
        /* ignore refresh error */
      }

      // ✅ NEW: Broadcast approval event so user's session can update
      if (action === "approve" && res.ok) {
        // Store approval event in localStorage so the user's browser can detect it
        try {
          const approvalEvent = {
            userId: id,
            timestamp: Date.now(),
            action: "approved",
          };
          localStorage.setItem(
            "verification_approval",
            JSON.stringify(approvalEvent),
          );
        } catch {
          /* ignore */
        }
      }

      return data;
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  },
);

export const uploadVerificationId = createAsyncThunk(
  "verification/uploadVerificationId",
  async ({ file, type = "id" }, { rejectWithValue, dispatch }) => {
    // type: 'id' -> government id upload (existing behavior)
    // type: 'image' -> profile image upload (PATCH to upload_image endpoint)
    try {
      const access = localStorage.getItem("access");
      const headers = {};
      if (access) headers["Authorization"] = `Bearer ${access}`;

      const form = new FormData();
      let url = `${BASE_URL}/api/auth/profile/upload-verification-id/`;
      let method = "POST";
      if (type === "image") {
        // API specified: PATCH http://10.10.13.75:8088/api/auth/profile/upload_image/
        url = `${BASE_URL}/api/auth/profile/upload_image/`;
        method = "PATCH";
        // use field name 'image' for profile image
        form.append("image", file);
      } else {
        // government id upload
        form.append("government_id", file);
      }

      const res = await fetchWithAuth(url, {
        method,
        headers,
        body: form,
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      // optionally refresh list
      try {
        dispatch(fetchVerifications());
      } catch {
        /* ignore */
      }
      return data;
    } catch (err) {
      console.error("uploadVerificationId error", err);
      return rejectWithValue({ error: "Network error" });
    }
  },
);

const slice = createSlice({
  name: "verification",
  initialState: {
    items: [],
    loading: false,
    error: null,
    current: null,
    currentLoading: false,
    currentError: null,
    actionLoading: false,
    actionError: null,
    actionSuccess: null,
    uploadLoading: false,
    uploadError: null,
    uploadSuccess: null,
  },
  reducers: {
    clearCurrentVerification(state) {
      state.current = null;
      state.currentLoading = false;
      state.currentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVerifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVerifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchVerifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      })

      .addCase(fetchVerificationById.pending, (state) => {
        state.currentLoading = true;
        state.currentError = null;
      })
      .addCase(fetchVerificationById.fulfilled, (state, action) => {
        state.currentLoading = false;
        state.current = action.payload;
      })
      .addCase(fetchVerificationById.rejected, (state, action) => {
        state.currentLoading = false;
        state.currentError = action.payload || action.error;
      })

      .addCase(postVerificationAction.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(postVerificationAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload || { status: "ok" };
      })
      .addCase(postVerificationAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || action.error;
      })

      .addCase(uploadVerificationId.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
        state.uploadSuccess = null;
      })
      .addCase(uploadVerificationId.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadSuccess = action.payload || { message: "ok" };
      })
      .addCase(uploadVerificationId.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload || action.error;
      });
  },
});

export const { clearCurrentVerification } = slice.actions;
export const clearActionStatus = () => ({
  type: "verification/clearActionStatus",
});
// simple reducer to clear action flags handled below in a small reducer injection
const originalReducer = slice.reducer;

const wrappedReducer = (state, action) => {
  if (action.type === "verification/clearActionStatus") {
    return {
      ...state,
      actionLoading: false,
      actionError: null,
      actionSuccess: null,
    };
  }
  return originalReducer(state, action);
};

export default wrappedReducer;
