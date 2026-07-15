import type { Campaign } from "../types/campaign";
import type { EventConfig } from "../types";

/** Maps API campaign payload into the shape the RSVP UI already expects. */
export function mapCampaignToEventConfig(campaign: Campaign): EventConfig {
  return {
    headline: campaign.headline,
    series: campaign.series,
    tagline: campaign.tagline,
    honoree: campaign.honoree,
    honoreeCredentials: campaign.honoreeCredentials,
    dateTime: campaign.dateTime,
    venue: campaign.venue,
    footerLine: campaign.footerLine,
    availabilityOptions: Object.values(campaign.availabilityOptions ?? {}),
    accentColor: campaign.accentColor,
    primaryColor: campaign.primaryColor,
    secondaryColor: campaign.secondaryColor,
    logoDocflix: campaign.logoDocflix,
    logoMankind: campaign.logoMankind,
    countdownTarget: campaign.countdownTarget,
    // Public campaign API does not expose the admin password
    adminPassword: "",
  };
}
