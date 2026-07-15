import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { submitRsvp as submitRsvpApi } from "../../api/services/rsvpService";
import { getApiErrorMessage } from "../../api/axiosInstance";
import type { RsvpSubmitRequest, RsvpSubmitResponse } from "../../types/rsvp";

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
    return await submitRsvpApi(payload);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to submit RSVP."));
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
