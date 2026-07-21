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
>(
  "export/exportCampaignData",
  async ({ campaignId, adminPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/admin/campaigns/${encodeURIComponent(campaignId)}/export`,
        {
          params: { adminPassword },
          responseType: "blob",
        },
      );

      // Read CSV text
      const csvText = await response.data.text();

      const lines = csvText.trim().split(/\r?\n/);

      // Skip if CSV is empty
      if (lines.length === 0) {
        throw new Error("Empty CSV received.");
      }

      // Remove header
      const rows = lines.slice(1);

      // New CSV
      const newCsv = [
        "Name,Phone,Status",
        ...rows.map((row) => {
          const [name, phone, availability] = row.split(",");

          return [
            name,
            phone,
            availability?.trim().toLowerCase() === "true"
              ? "Attending"
              : "Not Attending",
          ].join(",");
        }),
      ].join("\n");

      const blob = new Blob([newCsv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `campaign_${campaignId}_${new Date().toISOString().split("T")[0]}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      let message = "Failed to export campaign data.";

      if (axios.isAxiosError(error)) {
        if (error.response?.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            const json = JSON.parse(text);
            message = json.detail || message;
          } catch {}
        }
      }

      return rejectWithValue(message);
    }
  },
);

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
