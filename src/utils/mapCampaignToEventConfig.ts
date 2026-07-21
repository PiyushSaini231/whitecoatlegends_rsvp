import type { Campaign, CreateCampaignPayload } from "../types/campaign";
import type { EventConfig } from "../types";

export const DEFAULT_DOCFLIX_LOGO = "/assets/docflixlogo.png";
export const DEFAULT_MANKIND_LOGO = "/assets/mainkindlogo.png";

/** True when a logo URL is present and looks like a real image (not a stub). */
export function isUsableLogo(src?: string | null): boolean {
  if (!src?.trim()) return false;
  // Reject tiny/invalid data-URL placeholders from the API (e.g. base64,AAA)
  if (src.startsWith("data:") && src.length < 200) return false;
  return true;
}

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
    logoDocflix: isUsableLogo(campaign.logoDocflix) ? campaign.logoDocflix : "",
    logoMankind: isUsableLogo(campaign.logoMankind) ? campaign.logoMankind : "",
    countdownTarget: campaign.countdownTarget,
  };
}

/** Maps editor form state into the campaign API payload shape. */
export function mapEventConfigToCampaignPayload(
  config: EventConfig,
): Omit<CreateCampaignPayload, "adminPassword"> {
  const availabilityOptions = config.availabilityOptions.reduce<Record<string, string>>(
    (acc, opt, index) => {
      acc[String(index)] = opt;
      return acc;
    },
    {},
  );

  const countdownTarget =
    config.countdownTarget.includes("T") && config.countdownTarget.length === 16
      ? `${config.countdownTarget}:00`
      : config.countdownTarget;

  return {
    headline: config.headline.trim(),
    series: config.series.trim(),
    tagline: config.tagline.trim(),
    honoree: config.honoree.trim(),
    honoreeCredentials: config.honoreeCredentials.trim(),
    dateTime: config.dateTime.trim(),
    venue: config.venue.trim(),
    footerLine: config.footerLine.trim(),
    availabilityOptions,
    accentColor: config.accentColor,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    logoDocflix: config.logoDocflix,
    logoMankind: config.logoMankind,
    countdownTarget,
  };
}
