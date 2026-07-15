export interface RsvpSubmitRequest {
  name: string;
  phone: string;
  availability: boolean;
  campaignId: string;
}

export interface RsvpSubmitResponse {
  success: boolean;
  alreadySubmitted: boolean;
  message: string;
}
