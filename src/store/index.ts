import { configureStore } from "@reduxjs/toolkit";
import campaignReducer from "./slices/campaignSlice";
import rsvpReducer from "./slices/rsvpSlice";
import analyticsReducer from "./slices/analyticsSlice";
import exportReducer from "./slices/exportSlice";
import submissionsReducer from "./slices/submissionsSlice";
import campaignStatusReducer from "./slices/campaignStatusSlice";

export const store = configureStore({
  reducer: {
    campaign: campaignReducer,
    rsvp: rsvpReducer,
    analytics: analyticsReducer,
    export: exportReducer,
    submissions: submissionsReducer,
    campaignStatus: campaignStatusReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
