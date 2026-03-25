export const APP_NAME = 'AssetVault';

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ITEMS_PER_PAGE = 20;

export const DEFAULT_PLATFORM_OPTIONS = [
  'Unity Asset Store',
  'Unreal Marketplace',
  'ArtStation',
  'Envato',
  'Sketchfab',
  'TurboSquid',
  'CGTrader',
  'Gumroad',
  'itch.io',
  'Other',
] as const;
