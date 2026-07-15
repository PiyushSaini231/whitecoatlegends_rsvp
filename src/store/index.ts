import { configureStore } from "@reduxjs/toolkit";
import campaignReducer from "./slices/campaignSlice";
import rsvpReducer from "./slices/rsvpSlice";

export const store = configureStore({
  reducer: {
    campaign: campaignReducer,
    rsvp: rsvpReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
