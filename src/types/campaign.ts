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
}
