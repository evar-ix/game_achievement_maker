// ludolio-gmae.type.ts represents the external Ludolio JSON model
export interface LudolioAchievement {
  id: string;
  name: string;
  description: string;
  additionalDescription: string | null;
  lockedIconUrl: string;
  unlockedIconUrl: string;
}

export interface LudolioMedia {
  iconUrl: string;
  bannerUrl: string;
  galleryImages: string[];
  achievementIconUrls: string[];
}

export interface LudolioGame {
  appId: number;
  slug: string;
  title: string;
  description: string;
  publisher: string;
  studioName: string;
  version: string;
  isDrmFree: boolean;
  media: LudolioMedia;
  allMediaUrls: string[];
  ageRatings: unknown[];
  estimatedPlaytime: string;
  estimatedPlaytimeMinutes?: number;
  systemRequirements: string;
  accessibilityFeatures: unknown[];
  classificationTags: unknown[];
  achievements: LudolioAchievement[];
  storefront: string | null;
}