import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "./config";
import { getUserCurrencyInfo } from "../utils/countryHelper";

export const fetchProviders = createAsyncThunk(
  "careProviderNearYou/fetchProviders",
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("access");
      const headers = access ? { Authorization: `Bearer ${access}` } : {};
      const { countryIso2 } = getUserCurrencyInfo();
      const url = new URL(`${BASE_URL}/api/browse-providers/`);
      if (countryIso2) {
        url.searchParams.set("country", countryIso2);
      }
      const res = await fetch(url.toString(), { headers });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);
      return Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];
    } catch {
      return rejectWithValue({ error: "Network error" });
    }
  },
);

const slice = createSlice({
  name: "careProviderNearYou",
  initialState: {
    providers: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProviders(state) {
      state.providers = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.providers = action.payload;
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      });
  },
});

export const { clearProviders } = slice.actions;
export default slice.reducer;
