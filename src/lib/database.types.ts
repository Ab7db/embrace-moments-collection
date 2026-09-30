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
      site_profile: {
        Row: {
          id: number;
          bio_en: string | null;
          bio_ar: string | null;
          bio2_en: string | null;
          bio2_ar: string | null;
          email: string | null;
          instagram: string | null;
          whatsapp: string | null;
          role_en: string | null;
          role_ar: string | null;
          real_name_en: string | null;
          real_name_ar: string | null;
          profile_image_url: string | null;
          gear_en: string | null;
          gear_ar: string | null;
          location_en: string | null;
          location_ar: string | null;
          behance: string | null;
          twitter: string | null;
          youtube: string | null;
          hero_image_url: string | null;
          hero_motion_enabled: boolean | null;
          hero_motion_intensity: number | null;
          hero_motion_style: string | null;
          hero_title_en: string | null;
          hero_title_ar: string | null;
          hero_subtitle_en: string | null;
          hero_subtitle_ar: string | null;
          hero_roles_en: string[] | null;
          hero_roles_ar: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["site_profile"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["site_profile"]["Insert"]>;
        Relationships: any[];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: string;
        };
        Insert: Database["public"]["Tables"]["user_roles"]["Row"];
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Row"]>;
        Relationships: any[];
      };
      photos: {
        Row: {
          id: string;
          title_en: string;
          title_ar: string;
          country: string;
          city_en: string;
          city_ar: string;
          year: string;
          category_en: string;
          category_ar: string;
          image_url: string;
          orientation: "portrait" | "landscape";
          coords: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["photos"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["photos"]["Insert"]>;
        Relationships: any[];
      };
      campaigns: {
        Row: {
          id: string;
          no: string;
          title_en: string;
          title_ar: string;
          client: string;
          year: string;
          category_en: string;
          category_ar: string;
          cover_url: string;
          description_en: string | null;
          description_ar: string | null;
          gallery_urls: string[];
          bts_urls: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["campaigns"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["campaigns"]["Insert"]>;
        Relationships: any[];
      };
      countries: {
        Row: {
          id: string;
          name_en: string;
          name_ar: string;
          city_en: string;
          city_ar: string;
          lat: number;
          lon: number;
          cover_url: string;
          photo_count: number;
          campaign_count: number;
          tags_en: string[];
          tags_ar: string[];
        };
        Insert: Database["public"]["Tables"]["countries"]["Row"];
        Update: Partial<Database["public"]["Tables"]["countries"]["Row"]>;
        Relationships: any[];
      };
      stats: {
        Row: {
          id: number;
          value: number;
          suffix: string;
          label_en: string;
          label_ar: string;
        };
        Insert: Omit<Database["public"]["Tables"]["stats"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["stats"]["Insert"]>;
        Relationships: any[];
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          category: string | null;
          message: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contact_submissions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["contact_submissions"]["Insert"]>;
        Relationships: any[];
      };
      social_posts: {
        Row: {
          id: string;
          image_url: string;
          caption_en: string | null;
          caption_ar: string | null;
          post_url: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["social_posts"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["social_posts"]["Insert"]>;
        Relationships: any[];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type DbSiteProfile = Database["public"]["Tables"]["site_profile"]["Row"];
export type DbPhoto = Database["public"]["Tables"]["photos"]["Row"];
export type DbCampaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type DbCountry = Database["public"]["Tables"]["countries"]["Row"];
export type DbStat = Database["public"]["Tables"]["stats"]["Row"];
export type DbContactInsert = Database["public"]["Tables"]["contact_submissions"]["Insert"];
export type DbSocialPost = Database["public"]["Tables"]["social_posts"]["Row"];
