import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RsvpSubmitRequest, RsvpSubmitResponse } from "../../types/rsvp";
import { API_BASE_URL } from "../config";

export interface RsvpState {
  isRsvpLoading: boolean;
  isRsvpError: boolean;
  rsvpData: RsvpSubmitResponse | null;
  rsvpError: string | null;
}

const initialState: RsvpState = {
  isRsvpLoading: false,
  isRsvpError: false,
  rsvpData: null,
  rsvpError: null,
};

export const submitRsvp = createAsyncThunk<
  RsvpSubmitResponse,
  RsvpSubmitRequest,
  { rejectValue: string }
>("rsvp/submitRsvp", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<RsvpSubmitResponse>(
      `${API_BASE_URL}/api/v1/rsvp`,
      payload,
    );
    return data;
  } catch (error) {
    const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
    return rejectWithValue(
      typeof detail === "string" && detail.trim()
        ? detail
        : "Failed to submit RSVP.",
    );
  }
});



const rsvpSlice = createSlice({
  name: "rsvp",
  initialState,
  reducers: {
    resetRsvpState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitRsvp.pending, (state) => {
        state.isRsvpLoading = true;
        state.isRsvpError = false;
        state.rsvpError = null;
      })
      .addCase(submitRsvp.fulfilled, (state, action) => {
        state.isRsvpLoading = false;
        state.isRsvpError = false;
        state.rsvpData = action.payload;
        state.rsvpError = null;
      })
      .addCase(submitRsvp.rejected, (state, action) => {
        state.isRsvpLoading = false;
        state.isRsvpError = true;
        state.rsvpError = action.payload ?? "Failed to submit RSVP.";
      });
  },
});

export const { resetRsvpState } = rsvpSlice.actions;
export default rsvpSlice.reducer;
