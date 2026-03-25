import type { Database } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Platform = Database['public']['Tables']['platforms']['Row'];
export type Asset = Database['public']['Tables']['assets']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type AssetTag = Database['public']['Tables']['asset_tags']['Row'];

export type AssetWithTags = Asset & {
  tags: Tag[];
  platform: Platform | null;
};

export type ActionResponse<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};
