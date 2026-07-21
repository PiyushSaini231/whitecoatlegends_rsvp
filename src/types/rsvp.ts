export interface RsvpSubmitRequest {
  name: string;
  phone: string;
  /** Key from campaign.availabilityOptions (e.g. 0, 1, 2) */
  availability: number;
  campaignId: string;
}

export interface RsvpSubmitResponse {
  success: boolean;
  alreadySubmitted: boolean;
  message: string;
}
