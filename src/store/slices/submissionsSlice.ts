import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../config";

export interface Submission {
  name: string;
  phone: string;
  availability: boolean;
  createdAt: number;
  campaignId: string;
}

export interface SubmissionsResponse {
  items: Submission[];
  pageSize: number;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface SubmissionsState {
  submissions: Submission[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  nextCursor: string | null;
  hasMore: boolean;
}

const initialState: SubmissionsState = {
  submissions: [],
  isLoading: false,
  isError: false,
  error: null,
  nextCursor: null,
  hasMore: false,
};

export const fetchSubmissions = createAsyncThunk<
  SubmissionsResponse,
  { campaignId: string; adminPassword: string; cursor?: string | null },
  { rejectValue: string }
>(
  "submissions/fetchSubmissions",
  async ({ campaignId, adminPassword, cursor }, { rejectWithValue }) => {
    try {
      const params: any = { adminPassword };
      if (cursor) params.cursor = cursor;

      const { data } = await axios.get<SubmissionsResponse>(
        `${API_BASE_URL}/api/v1/admin/campaigns/${encodeURIComponent(campaignId)}/submissions`,
        { params },
      );
      return data;
    } catch (error) {
      const detail = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : null;
      return rejectWithValue(
        typeof detail === "string" && detail.trim()
          ? detail
          : "Failed to fetch submissions.",
      );
    }
  },
);

const submissionsSlice = createSlice({
  name: "submissions",
  initialState,
  reducers: {
    clearSubmissionsError: (state) => {
      state.error = null;
    },
    restoreSubmissionsPage: (
      state,
      action: {
        payload: {
          submissions: Submission[];
          nextCursor: string | null;
          hasMore: boolean;
        };
      },
    ) => {
      state.submissions = action.payload.submissions;
      state.nextCursor = action.payload.nextCursor;
      state.hasMore = action.payload.hasMore;
      state.isLoading = false;
      state.isError = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubmissions.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.submissions = action.payload.items;
        state.nextCursor = action.payload.nextCursor;
        state.hasMore = action.payload.hasMore;
        state.error = null;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload ?? "Failed to fetch submissions.";
      });
  },
});

export const { clearSubmissionsError, restoreSubmissionsPage } = submissionsSlice.actions;
export default submissionsSlice.reducer;
