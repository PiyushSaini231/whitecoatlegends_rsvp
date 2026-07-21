import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../config";

export interface ExportState {
  isExporting: boolean;
  exportError: string | null;
}

const initialState: ExportState = {
  isExporting: false,
  exportError: null,
};

export const exportCampaignData = createAsyncThunk<
  void,
  { campaignId: string; adminPassword: string },
  { rejectValue: string }
>("export/exportCampaignData", async ({ campaignId, adminPassword }, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/admin/campaigns/${encodeURIComponent(campaignId)}/export`,
      {
        params: { adminPassword },
        responseType: "blob",
      },
    );

    // Create blob and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `campaign_${campaignId}_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
    return rejectWithValue(
      typeof detail === "string" && detail.trim()
        ? detail
        : "Failed to export campaign data.",
    );
  }
});

const exportSlice = createSlice({
  name: "export",
  initialState,
  reducers: {
    clearExportError: (state) => {
      state.exportError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(exportCampaignData.pending, (state) => {
        state.isExporting = true;
        state.exportError = null;
      })
      .addCase(exportCampaignData.fulfilled, (state) => {
        state.isExporting = false;
        state.exportError = null;
      })
      .addCase(exportCampaignData.rejected, (state, action) => {
        state.isExporting = false;
        state.exportError = action.payload ?? "Failed to export data.";
      });
  },
});

export const { clearExportError } = exportSlice.actions;
export default exportSlice.reducer;
