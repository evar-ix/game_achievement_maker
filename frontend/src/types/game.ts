export interface GameSummary {
    id: string;
    externalId: number | string | null;
    title: string;
    description: string | null;
    publisher?: string;
    studioName?: string | null;
    integrationType: "DRM_FREE" | "SDK" | "drm_free" | "sdk";
    coverImageUrl?: string | null;
    iconUrl?: string;
}
