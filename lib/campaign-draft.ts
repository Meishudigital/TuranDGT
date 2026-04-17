export type CampaignDraftListing = {
  id: string;
  title: string | null;
  owner_name: string | null;
  phone_number: string | null;
  phone_e164: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  price: number | null;
  url: string | null;
};

export type CampaignDraft = {
  sourceScope: string;
  city: string;
  district: string;
  neighborhood: string;
  items: CampaignDraftListing[];
  updatedAt: string;
};

type CampaignComposerState = {
  campaignName: string;
  messageTemplate: string;
};

function getDraftStorageKey(userId: string) {
  return `emlak-campaign-draft:${userId}`;
}

function getComposerStorageKey(userId: string) {
  return `emlak-campaign-composer:${userId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function readCampaignDraft(userId: string): CampaignDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getDraftStorageKey(userId));

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!isRecord(parsedValue) || !Array.isArray(parsedValue.items)) {
      return null;
    }

    return {
      sourceScope:
        typeof parsedValue.sourceScope === "string"
          ? parsedValue.sourceScope
          : "Tum yetkili iller",
      city: typeof parsedValue.city === "string" ? parsedValue.city : "",
      district: typeof parsedValue.district === "string" ? parsedValue.district : "",
      neighborhood:
        typeof parsedValue.neighborhood === "string" ? parsedValue.neighborhood : "",
      items: parsedValue.items.filter(
        (item): item is CampaignDraftListing =>
          isRecord(item) && typeof item.id === "string"
      ),
      updatedAt:
        typeof parsedValue.updatedAt === "string"
          ? parsedValue.updatedAt
          : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to read campaign draft", error);
    return null;
  }
}

export function writeCampaignDraft(userId: string, payload: CampaignDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getDraftStorageKey(userId), JSON.stringify(payload));
}

export function clearCampaignDraft(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getDraftStorageKey(userId));
}

export function readCampaignComposerState(userId: string): CampaignComposerState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getComposerStorageKey(userId));

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!isRecord(parsedValue)) {
      return null;
    }

    return {
      campaignName:
        typeof parsedValue.campaignName === "string" ? parsedValue.campaignName : "",
      messageTemplate:
        typeof parsedValue.messageTemplate === "string"
          ? parsedValue.messageTemplate
          : "",
    };
  } catch (error) {
    console.error("Failed to read campaign composer state", error);
    return null;
  }
}

export function writeCampaignComposerState(
  userId: string,
  payload: CampaignComposerState
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getComposerStorageKey(userId), JSON.stringify(payload));
}

export function clearCampaignComposerState(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getComposerStorageKey(userId));
}
