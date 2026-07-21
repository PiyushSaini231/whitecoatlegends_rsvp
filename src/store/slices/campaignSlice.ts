import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Campaign, CampaignsListResponse, CreateCampaignPayload } from "../../types/campaign";
import { API_BASE_URL } from "../config";

const MASTER_PASSWORD = "wsl_docflix@123";

/** Static campaign used by the RSVP experience for now. */
export const DEFAULT_CAMPAIGN_ID = "V3eMmpPLejNCn2S1EDbrJ";

export interface CampaignState {
  isCampaignLoading: boolean;
  isCampaignError: boolean;
  campaignData: Campaign | null;
  campaignError: string | null;
  campaignsList: CampaignsListResponse | null;
  isCampaignsListLoading: boolean;
  campaignsListError: string | null;
  isCreatingCampaign: boolean;
  createCampaignError: string | null;
  isUpdatingCampaign: boolean;
  updateCampaignError: string | null;
}

const initialState: CampaignState = {
  isCampaignLoading: false,
  isCampaignError: false,
  campaignData: null,
  campaignError: null,
  campaignsList: null,
  isCampaignsListLoading: false,
  campaignsListError: null,
  isCreatingCampaign: false,
  createCampaignError: null,
  isUpdatingCampaign: false,
  updateCampaignError: null,
};

export const fetchCampaignDetails = createAsyncThunk<
  Campaign,
  string | void,
  { rejectValue: string }
>("campaign/fetchCampaignDetails", async (campaignId, { rejectWithValue }) => {
  try {
    const id = typeof campaignId === "string" ? campaignId : DEFAULT_CAMPAIGN_ID;
    const { data } = await axios.get<Campaign>(
      `${API_BASE_URL}/api/v1/campaigns/${encodeURIComponent(id)}`,
    );
    return data;
  } catch (error) {
    const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
    return rejectWithValue(
      typeof detail === "string" && detail.trim()
        ? detail
        : "Failed to load campaign details.",
    );
  }
});

export const fetchCampaignsList = createAsyncThunk<
  CampaignsListResponse,
  { cursor?: string | null } | void,
  { rejectValue: string }
>("campaign/fetchCampaignsList", async (args, { rejectWithValue }) => {
  try {
    const params: Record<string, string> = { adminPassword: MASTER_PASSWORD };
    const cursor = args && "cursor" in args ? args.cursor : null;
    if (cursor) params.cursor = cursor;
    const { data } = await axios.get<CampaignsListResponse>(
      `${API_BASE_URL}/api/v1/admin/campaigns`,
      { params },
    );
    return data;
  } catch (error) {
    const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
    return rejectWithValue(
      typeof detail === "string" && detail.trim()
        ? detail
        : "Failed to load campaigns.",
    );
  }
});

export const createCampaign = createAsyncThunk<
  Campaign,
  Omit<CreateCampaignPayload, "adminPassword">,
  { rejectValue: string }
>("campaign/createCampaign", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<Campaign>(`${API_BASE_URL}/api/v1/admin/campaigns`, {
      ...payload,
      adminPassword: MASTER_PASSWORD,
    });
    return data;
  } catch (error) {
    const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
    return rejectWithValue(
      typeof detail === "string" && detail.trim()
        ? detail
        : "Failed to create campaign.",
    );
  }
});

export const updateCampaign = createAsyncThunk<
  Campaign,
  { campaignId: string; payload: Omit<CreateCampaignPayload, "adminPassword"> },
  { rejectValue: string }
>("campaign/updateCampaign", async ({ campaignId, payload }, { rejectWithValue }) => {
  try {
    const { data } = await axios.put<Campaign>(
      `${API_BASE_URL}/api/v1/admin/campaigns/${encodeURIComponent(campaignId)}`,
      { ...payload, adminPassword: MASTER_PASSWORD },
    );
    return data;
  } catch (error) {
    const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
    return rejectWithValue(
      typeof detail === "string" && detail.trim()
        ? detail
        : "Failed to update campaign.",
    );
  }
});

const campaignSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {
    resetCampaignState: () => initialState,
    restoreCampaignsListPage: (
      state,
      action: {
        payload: CampaignsListResponse;
      },
    ) => {
      state.campaignsList = action.payload;
      state.isCampaignsListLoading = false;
      state.campaignsListError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaignDetails.pending, (state) => {
        state.isCampaignLoading = true;
        state.isCampaignError = false;
        state.campaignError = null;
        state.campaignData = null;
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
      })
      .addCase(fetchCampaignsList.pending, (state) => {
        state.isCampaignsListLoading = true;
        state.campaignsListError = null;
      })
      .addCase(fetchCampaignsList.fulfilled, (state, action) => {
        state.isCampaignsListLoading = false;
        state.campaignsList = action.payload;
        state.campaignsListError = null;
      })
      .addCase(fetchCampaignsList.rejected, (state, action) => {
        state.isCampaignsListLoading = false;
        state.campaignsListError = action.payload ?? "Failed to load campaigns.";
      })
      .addCase(createCampaign.pending, (state) => {
        state.isCreatingCampaign = true;
        state.createCampaignError = null;
      })
      .addCase(createCampaign.fulfilled, (state) => {
        state.isCreatingCampaign = false;
        state.createCampaignError = null;
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.isCreatingCampaign = false;
        state.createCampaignError = action.payload ?? "Failed to create campaign.";
      })
      .addCase(updateCampaign.pending, (state) => {
        state.isUpdatingCampaign = true;
        state.updateCampaignError = null;
      })
      .addCase(updateCampaign.fulfilled, (state) => {
        state.isUpdatingCampaign = false;
        state.updateCampaignError = null;
      })
      .addCase(updateCampaign.rejected, (state, action) => {
        state.isUpdatingCampaign = false;
        state.updateCampaignError = action.payload ?? "Failed to update campaign.";
      });
  },
});

export const { resetCampaignState, restoreCampaignsListPage } =
  campaignSlice.actions;
export default campaignSlice.reducer;
