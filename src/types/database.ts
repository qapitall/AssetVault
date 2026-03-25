export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      platforms: {
        Row: {
          id: string;
          user_id: string;
          platform_name: string;
          account_name: string;
          platform_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform_name: string;
          account_name: string;
          platform_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          platform_name?: string;
          account_name?: string;
          platform_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'platforms_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      assets: {
        Row: {
          id: string;
          user_id: string;
          platform_id: string | null;
          title: string;
          purchase_url: string | null;
          preview_image_path: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform_id?: string | null;
          title: string;
          purchase_url?: string | null;
          preview_image_path?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          platform_id?: string | null;
          title?: string;
          purchase_url?: string | null;
          preview_image_path?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'assets_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assets_platform_id_fkey';
            columns: ['platform_id'];
            isOneToOne: false;
            referencedRelation: 'platforms';
            referencedColumns: ['id'];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          is_default?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'tags_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      asset_tags: {
        Row: {
          asset_id: string;
          tag_id: string;
        };
        Insert: {
          asset_id: string;
          tag_id: string;
        };
        Update: {
          asset_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'asset_tags_asset_id_fkey';
            columns: ['asset_id'];
            isOneToOne: false;
            referencedRelation: 'assets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'asset_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      ensure_user_profile: {
        Args: {
          p_user_id: string;
          p_email: string;
        };
        Returns: boolean;
      };
      create_asset_with_tags: {
        Args: {
          p_title: string;
          p_platform_id?: string | null;
          p_purchase_url?: string | null;
          p_notes?: string | null;
          p_preview_image_path?: string | null;
          p_tag_ids?: string[];
        };
        Returns: Database['public']['Tables']['assets']['Row'];
      };
      update_asset_with_tags: {
        Args: {
          p_asset_id: string;
          p_title?: string | null;
          p_platform_id?: string | null;
          p_purchase_url?: string | null;
          p_notes?: string | null;
          p_preview_image_path?: string | null;
          p_tag_ids?: string[] | null;
        };
        Returns: Database['public']['Tables']['assets']['Row'];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
