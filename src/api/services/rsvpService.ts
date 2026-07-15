import axiosInstance from "../axiosInstance";
import type { RsvpSubmitRequest, RsvpSubmitResponse } from "../../types/rsvp";

export async function submitRsvp(payload: RsvpSubmitRequest): Promise<RsvpSubmitResponse> {
  const { data } = await axiosInstance.post<RsvpSubmitResponse>(
    "/api/v1/rsvp",
    payload,
  );
  return data;
}
