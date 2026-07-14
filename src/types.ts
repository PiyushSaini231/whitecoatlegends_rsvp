export interface EventConfig {
  headline: string;
  series: string;
  tagline: string;
  honoree: string;
  honoreeCredentials: string;
  dateTime: string;
  venue: string;
  footerLine: string;
  availabilityOptions: string[];
  accentColor: string; // Hex code for gold accents (e.g. #D4AF37)
  primaryColor: string; // Left/Primary gradient color (crimson, e.g. #7a0c1e)
  secondaryColor: string; // Right/Secondary gradient color (navy, e.g. #0a192f)
  logoDocflix: string; // Base64 data URL
  logoMankind: string; // Base64 data URL
  countdownTarget: string; // ISO or date string for timer (e.g. 2026-08-01T19:00:00)
  adminPassword: string; // Plain password for dashboard access
}

export interface RSVP {
  id: string;
  timestamp: string;
  name: string;
  phone: string;
  availability: string;
  eventName: string; // Captured current event title at time of RSVP
}

export interface DashboardStats {
  total: number;
  byAvailability: Record<string, number>;
}
