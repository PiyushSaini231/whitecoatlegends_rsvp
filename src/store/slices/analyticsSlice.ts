import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../config";

const MASTER_PASSWORD = "wsl_docflix@123";

export interface CampaignAnalytics {
  totalSubmissions: number;
  notInterested: number;
  interested: number;
}

interface AnalyticsApiResponse {
  totalSubmissions: number;
  "0": number;
  "1": number;
}

export interface AnalyticsState {
  isAnalyticsLoading: boolean;
  isAnalyticsError: boolean;
  analyticsData: CampaignAnalytics | null;
  analyticsError: string | null;
}

const initialState: AnalyticsState = {
  isAnalyticsLoading: false,
  isAnalyticsError: false,
  analyticsData: null,
  analyticsError: null,
};

export const fetchCampaignAnalytics = createAsyncThunk<
  CampaignAnalytics,
  string,
  { rejectValue: string }
>("analytics/fetchCampaignAnalytics", async (campaignId, { rejectWithValue }) => {
  try {
    const { data } = await axios.get<AnalyticsApiResponse>(
      `${API_BASE_URL}/api/v1/admin/campaigns/${encodeURIComponent(campaignId)}/analytics`,
      { params: { adminPassword: MASTER_PASSWORD } },
    );
    return {
      totalSubmissions: data.totalSubmissions,
      notInterested: data["0"] ?? 0,
      interested: data["1"] ?? 0,
    };
  } catch (error) {
    const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
    return rejectWithValue(
      typeof detail === "string" && detail.trim()
        ? detail
        : "Failed to load analytics.",
    );
  }
});

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    resetAnalyticsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaignAnalytics.pending, (state) => {
        state.isAnalyticsLoading = true;
        state.isAnalyticsError = false;
        state.analyticsError = null;
      })
      .addCase(fetchCampaignAnalytics.fulfilled, (state, action) => {
        state.isAnalyticsLoading = false;
        state.isAnalyticsError = false;
        state.analyticsData = action.payload;
        state.analyticsError = null;
      })
      .addCase(fetchCampaignAnalytics.rejected, (state, action) => {
        state.isAnalyticsLoading = false;
        state.isAnalyticsError = true;
        state.analyticsError = action.payload ?? "Failed to load analytics.";
      });
  },
});

export const { resetAnalyticsState } = analyticsSlice.actions;
export default analyticsSlice.reducer;
