import axiosInstance from "../axiosInstance";
import type { Campaign } from "../../types/campaign";

/** Static campaign used by the RSVP experience for now. */
export const DEFAULT_CAMPAIGN_ID = "V3eMmpPLejNCn2S1EDbrJ";

export async function getCampaignDetails(campaignId: string): Promise<Campaign> {
  const { data } = await axiosInstance.get<Campaign>(
    `/api/v1/campaigns/${encodeURIComponent(campaignId)}`,
  );
  return data;
}
