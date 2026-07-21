import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Campaign } from "../../types/campaign";
import { API_BASE_URL } from "../config";

const MASTER_PASSWORD = "wsl_docflix@123";

export interface CampaignStatusState {
  enabled: boolean | null;
  isToggling: boolean;
  toggleError: string | null;
}

const initialState: CampaignStatusState = {
  enabled: null,
  isToggling: false,
  toggleError: null,
};

export const enableCampaign = createAsyncThunk<
  Campaign,
  string,
  { rejectValue: string }
>("campaignStatus/enableCampaign", async (campaignId, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<Campaign>(
      `${API_BASE_URL}/api/v1/admin/campaigns/${encodeURIComponent(campaignId)}/enable`,
      { adminPassword: MASTER_PASSWORD },
    );
    return data;
  } catch (error) {
    const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
    return rejectWithValue(
      typeof detail === "string" && detail.trim()
        ? detail
        : "Failed to enable campaign.",
    );
  }
});

export const disableCampaign = createAsyncThunk<
  Campaign,
  string,
  { rejectValue: string }
>("campaignStatus/disableCampaign", async (campaignId, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<Campaign>(
      `${API_BASE_URL}/api/v1/admin/campaigns/${encodeURIComponent(campaignId)}/disable`,
      { adminPassword: MASTER_PASSWORD },
    );
    return data;
  } catch (error) {
    const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
    return rejectWithValue(
      typeof detail === "string" && detail.trim()
        ? detail
        : "Failed to disable campaign.",
    );
  }
});

const campaignStatusSlice = createSlice({
  name: "campaignStatus",
  initialState,
  reducers: {
    setCampaignEnabled: (state, action: { payload: boolean }) => {
      state.enabled = action.payload;
      state.toggleError = null;
    },
    resetCampaignStatus: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(enableCampaign.pending, (state) => {
        state.isToggling = true;
        state.toggleError = null;
      })
      .addCase(enableCampaign.fulfilled, (state, action) => {
        state.isToggling = false;
        state.enabled = action.payload.enabled ?? true;
      })
      .addCase(enableCampaign.rejected, (state, action) => {
        state.isToggling = false;
        state.toggleError = action.payload ?? "Failed to enable campaign.";
      })
      .addCase(disableCampaign.pending, (state) => {
        state.isToggling = true;
        state.toggleError = null;
      })
      .addCase(disableCampaign.fulfilled, (state, action) => {
        state.isToggling = false;
        state.enabled = action.payload.enabled ?? false;
      })
      .addCase(disableCampaign.rejected, (state, action) => {
        state.isToggling = false;
        state.toggleError = action.payload ?? "Failed to disable campaign.";
      });
  },
});

export const { setCampaignEnabled, resetCampaignStatus } = campaignStatusSlice.actions;
export default campaignStatusSlice.reducer;
