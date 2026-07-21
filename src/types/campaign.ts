/** Payload for PUT /api/v1/admin/campaigns/{campaign_id} */
export type UpdateCampaignPayload = CreateCampaignPayload;

/** Payload for POST /api/v1/admin/campaigns */
export interface CreateCampaignPayload {
  headline: string;
  series: string;
  tagline: string;
  honoree: string;
  honoreeCredentials: string;
  dateTime: string;
  venue: string;
  footerLine: string;
  availabilityOptions: Record<string, string>;
  accentColor: string;
  primaryColor: string;
  secondaryColor: string;
  logoDocflix: string;
  logoMankind: string;
  countdownTarget: string;
  adminPassword: string;
}

/** Campaign summary from GET /api/v1/admin/campaigns */
export interface CampaignListItem {
  id: string;
  headline: string;
  series: string;
  tagline: string;
  honoree: string;
  honoreeCredentials: string;
  dateTime: string;
  venue: string;
  footerLine: string;
  availabilityOptions: Record<string, string>;
  accentColor: string;
  primaryColor: string;
  secondaryColor: string;
  logoDocflix: string;
  logoMankind: string;
  countdownTarget: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
  interestedCount: number;
}

export interface CampaignsListResponse {
  items: CampaignListItem[];
  pageSize: number;
  nextCursor: string | null;
  hasMore: boolean;
}

/** Public campaign payload from GET /api/v1/campaigns/{campaign_id} */
export interface Campaign {
  id: string;
  headline: string;
  series: string;
  tagline: string;
  honoree: string;
  honoreeCredentials: string;
  dateTime: string;
  venue: string;
  footerLine: string;
  /** Key-label map of availability choices from the API */
  availabilityOptions: Record<string, string>;
  accentColor: string;
  primaryColor: string;
  secondaryColor: string;
  logoDocflix: string;
  logoMankind: string;
  countdownTarget: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
  interestedCount?: number;
}
