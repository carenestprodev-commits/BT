import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "./config";
import {fetchWithAuth} from "../lib/fetchWithAuth.js";

export const fetchNotifications = createAsyncThunk(
  "adminMessage/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = access ? { Authorization: `Bearer ${access}` } : {};
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/notifications/`, {
        headers,
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      return Array.isArray(data) ? data : data.results || [];
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  }
);

export const fetchNotificationById = createAsyncThunk(
  "adminMessage/fetchNotificationById",
  async (id, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = access ? { Authorization: `Bearer ${access}` } : {};
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/notifications/${id}/`, {
        headers,
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      return data;
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  }
);

export const resendNotification = createAsyncThunk(
  "adminMessage/resendNotification",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = access ? { Authorization: `Bearer ${access}` } : {};
      const res = await fetchWithAuth(
        `${BASE_URL}/api/admin/notifications/${id}/resend/`,
        {
          method: "POST",
          headers,
        }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      try {
        dispatch(fetchNotifications());
      } catch {
        /* ignore refresh error */
      }
      return data;
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  }
);

export const archiveNotification = createAsyncThunk(
  "adminMessage/archiveNotification",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = access ? { Authorization: `Bearer ${access}` } : {};
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/notifications/${id}/`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        let data;
        try {
          data = await res.json();
        } catch {
          data = { error: "Delete failed" };
        }
        return rejectWithValue(data);
      }
      try {
        dispatch(fetchNotifications());
      } catch {
        /* ignore refresh error */
      }
      return { status: "deleted" };
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  }
);

export const createNotification = createAsyncThunk(
  "adminMessage/createNotification",
  async ({ title, body, audience }, { rejectWithValue, dispatch }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = { "Content-Type": "application/json" };
      if (access) headers["Authorization"] = `Bearer ${access}`;
      const res = await fetchWithAuth(`${BASE_URL}/api/admin/notifications/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title, body, audience }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      try {
        dispatch(fetchNotifications());
      } catch {
        /* ignore */
      }
      return data;
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  }
);

const slice = createSlice({
  name: "adminMessage",
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
  },
  reducers: {
    clearCurrentNotification(state) {
      state.current = null;
      state.currentLoading = false;
      state.currentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      })

      .addCase(fetchNotificationById.pending, (state) => {
        state.currentLoading = true;
        state.currentError = null;
      })
      .addCase(fetchNotificationById.fulfilled, (state, action) => {
        state.currentLoading = false;
        state.current = action.payload;
      })
      .addCase(fetchNotificationById.rejected, (state, action) => {
        state.currentLoading = false;
        state.currentError = action.payload || action.error;
      })

      .addCase(resendNotification.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(resendNotification.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload;
      })
      .addCase(resendNotification.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || action.error;
      })

      .addCase(archiveNotification.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(archiveNotification.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionSuccess = { status: "deleted" };
      })
      .addCase(archiveNotification.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || action.error;
      })
      .addCase(createNotification.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload;
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || action.error;
      });
  },
});

export const { clearCurrentNotification } = slice.actions;
export const clearActionStatus = () => ({
  type: "adminMessage/clearActionStatus",
});

const originalReducer = slice.reducer;
const wrappedReducer = (state, action) => {
  if (action.type === "adminMessage/clearActionStatus") {
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
