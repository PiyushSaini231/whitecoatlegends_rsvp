import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  DEFAULT_CAMPAIGN_ID,
  getCampaignDetails,
} from "../../api/services/campaignService";
import { getApiErrorMessage } from "../../api/axiosInstance";
import type { Campaign } from "../../types/campaign";

export interface CampaignState {
  isCampaignLoading: boolean;
  isCampaignError: boolean;
  campaignData: Campaign | null;
  campaignError: string | null;
}

const initialState: CampaignState = {
  isCampaignLoading: false,
  isCampaignError: false,
  campaignData: null,
  campaignError: null,
};

export const fetchCampaignDetails = createAsyncThunk<
  Campaign,
  string | void,
  { rejectValue: string }
>("campaign/fetchCampaignDetails", async (campaignId, { rejectWithValue }) => {
  try {
    const id = typeof campaignId === "string" ? campaignId : DEFAULT_CAMPAIGN_ID;
    return await getCampaignDetails(id);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to load campaign details."));
  }
});

const campaignSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {
    resetCampaignState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaignDetails.pending, (state) => {
        state.isCampaignLoading = true;
        state.isCampaignError = false;
        state.campaignError = null;
      })
      .addCase(fetchCampaignDetails.fulfilled, (state, action) => {
        state.isCampaignLoading = false;
        state.isCampaignError = false;
        state.campaignData = action.payload;
        state.campaignError = null;
      })
      .addCase(fetchCampaignDetails.rejected, (state, action) => {
        state.isCampaignLoading = false;
        state.isCampaignError = true;
        state.campaignError = action.payload ?? "Failed to load campaign details.";
      });
  },
});

export const { resetCampaignState } = campaignSlice.actions;
export default campaignSlice.reducer;
