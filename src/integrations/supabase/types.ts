export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string
          id: string
          place_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          place_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          place_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          place_id: string | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          place_id?: string | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          place_id?: string | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      place_checkins: {
        Row: {
          created_at: string
          id: string
          note: string | null
          place_id: string
          type: Database["public"]["Enums"]["checkin_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          place_id: string
          type: Database["public"]["Enums"]["checkin_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          place_id?: string
          type?: Database["public"]["Enums"]["checkin_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_checkins_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      place_photos: {
        Row: {
          category: Database["public"]["Enums"]["photo_category"]
          created_at: string
          flag_reason: string | null
          flagged: boolean
          flagged_at: string | null
          flagged_by: string | null
          id: string
          is_approved: boolean
          place_id: string
          url: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["photo_category"]
          created_at?: string
          flag_reason?: string | null
          flagged?: boolean
          flagged_at?: string | null
          flagged_by?: string | null
          id?: string
          is_approved?: boolean
          place_id: string
          url: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["photo_category"]
          created_at?: string
          flag_reason?: string | null
          flagged?: boolean
          flagged_at?: string | null
          flagged_by?: string | null
          id?: string
          is_approved?: boolean
          place_id?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_photos_flagged_by_fkey"
            columns: ["flagged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_photos_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      place_stamp_aggregates: {
        Row: {
          avg_intensity: number | null
          dimension: Database["public"]["Enums"]["review_dimension"]
          id: string
          place_id: string
          polarity: Database["public"]["Enums"]["signal_polarity"]
          review_count: number
          stamp_id: string | null
          total_votes: number
          updated_at: string
        }
        Insert: {
          avg_intensity?: number | null
          dimension: Database["public"]["Enums"]["review_dimension"]
          id?: string
          place_id: string
          polarity: Database["public"]["Enums"]["signal_polarity"]
          review_count?: number
          stamp_id?: string | null
          total_votes?: number
          updated_at?: string
        }
        Update: {
          avg_intensity?: number | null
          dimension?: Database["public"]["Enums"]["review_dimension"]
          id?: string
          place_id?: string
          polarity?: Database["public"]["Enums"]["signal_polarity"]
          review_count?: number
          stamp_id?: string | null
          total_votes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_stamp_aggregates_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_stamp_aggregates_stamp_id_fkey"
            columns: ["stamp_id"]
            isOneToOne: false
            referencedRelation: "stamp_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      place_status_updates: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_approved: boolean | null
          is_rejected: boolean | null
          note: string | null
          place_id: string
          status: Database["public"]["Enums"]["place_status"]
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_rejected?: boolean | null
          note?: string | null
          place_id: string
          status: Database["public"]["Enums"]["place_status"]
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_rejected?: boolean | null
          note?: string | null
          place_id?: string
          status?: Database["public"]["Enums"]["place_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_status_updates_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_status_updates_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_status_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      place_suggestions: {
        Row: {
          created_at: string
          current_value: string | null
          field_name: string
          id: string
          notes: string | null
          place_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["suggestion_status"]
          suggested_value: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: string | null
          field_name: string
          id?: string
          notes?: string | null
          place_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          suggested_value: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: string | null
          field_name?: string
          id?: string
          notes?: string | null
          place_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          suggested_value?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_suggestions_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_suggestions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          cover_image_url: string | null
          created_at: string
          current_status: Database["public"]["Enums"]["place_status"] | null
          features: Database["public"]["Enums"]["place_feature"][] | null
          has_conflict: boolean
          id: string
          is_verified: boolean
          last_updated: string
          latitude: number
          longitude: number
          name: string
          open_year_round: boolean
          package_fee_amount: string | null
          package_fee_required: boolean
          packages_accepted: Database["public"]["Enums"]["package_acceptance"]
          price_level: Database["public"]["Enums"]["price_level"]
          primary_category: Database["public"]["Enums"]["place_category"]
          review_count: number
          status_updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          current_status?: Database["public"]["Enums"]["place_status"] | null
          features?: Database["public"]["Enums"]["place_feature"][] | null
          has_conflict?: boolean
          id?: string
          is_verified?: boolean
          last_updated?: string
          latitude: number
          longitude: number
          name: string
          open_year_round?: boolean
          package_fee_amount?: string | null
          package_fee_required?: boolean
          packages_accepted?: Database["public"]["Enums"]["package_acceptance"]
          price_level?: Database["public"]["Enums"]["price_level"]
          primary_category?: Database["public"]["Enums"]["place_category"]
          review_count?: number
          status_updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          current_status?: Database["public"]["Enums"]["place_status"] | null
          features?: Database["public"]["Enums"]["place_feature"][] | null
          has_conflict?: boolean
          id?: string
          is_verified?: boolean
          last_updated?: string
          latitude?: number
          longitude?: number
          name?: string
          open_year_round?: boolean
          package_fee_amount?: string | null
          package_fee_required?: boolean
          packages_accepted?: Database["public"]["Enums"]["package_acceptance"]
          price_level?: Database["public"]["Enums"]["price_level"]
          primary_category?: Database["public"]["Enums"]["place_category"]
          review_count?: number
          status_updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          contribution_count: number
          contribution_score: number
          created_at: string
          display_name: string | null
          email: string | null
          email_verified: boolean
          email_verified_at: string | null
          id: string
          is_pro: boolean
          is_verified: boolean
          phone_number: string | null
          phone_verified: boolean
          phone_verified_at: string | null
          trusted_contributor: boolean
          trusted_since: string | null
          updated_at: string
        }
        Insert: {
          contribution_count?: number
          contribution_score?: number
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_verified?: boolean
          email_verified_at?: string | null
          id: string
          is_pro?: boolean
          is_verified?: boolean
          phone_number?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          trusted_contributor?: boolean
          trusted_since?: string | null
          updated_at?: string
        }
        Update: {
          contribution_count?: number
          contribution_score?: number
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_verified?: boolean
          email_verified_at?: string | null
          id?: string
          is_pro?: boolean
          is_verified?: boolean
          phone_number?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          trusted_contributor?: boolean
          trusted_since?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      review_signals: {
        Row: {
          created_at: string
          dimension: Database["public"]["Enums"]["review_dimension"]
          id: string
          level: number
          place_id: string
          polarity: Database["public"]["Enums"]["signal_polarity"]
          review_id: string
          stamp_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dimension: Database["public"]["Enums"]["review_dimension"]
          id?: string
          level: number
          place_id: string
          polarity: Database["public"]["Enums"]["signal_polarity"]
          review_id: string
          stamp_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dimension?: Database["public"]["Enums"]["review_dimension"]
          id?: string
          level?: number
          place_id?: string
          polarity?: Database["public"]["Enums"]["signal_polarity"]
          review_id?: string
          stamp_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_signals_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_signals_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_signals_stamp_id_fkey"
            columns: ["stamp_id"]
            isOneToOne: false
            referencedRelation: "stamp_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          note_private: string | null
          note_public: string | null
          place_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note_private?: string | null
          note_public?: string | null
          place_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note_private?: string | null
          note_public?: string | null
          place_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stamp_definitions: {
        Row: {
          category: string
          created_at: string
          icon: string | null
          id: string
          label: string
          polarity: string
          sort_order: number
        }
        Insert: {
          category: string
          created_at?: string
          icon?: string | null
          id: string
          label: string
          polarity: string
          sort_order?: number
        }
        Update: {
          category?: string
          created_at?: string
          icon?: string | null
          id?: string
          label?: string
          polarity?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_nearby_places: {
        Args: { _lat: number; _lng: number; _name: string }
        Returns: {
          distance_meters: number
          id: string
          name: string
        }[]
      }
      get_review_category: {
        Args: { place_category: Database["public"]["Enums"]["place_category"] }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_contribution: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      is_verified_user: { Args: { user_id: string }; Returns: boolean }
      notify_place_followers: {
        Args: {
          _exclude_user_id?: string
          _message: string
          _place_id: string
          _title: string
          _type: Database["public"]["Enums"]["notification_type"]
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      checkin_type: "stayed_here" | "used_dump_water" | "passed_by"
      notification_type:
        | "place_status_changed"
        | "place_photo_added"
        | "place_updated"
      package_acceptance: "Yes" | "No" | "Limited"
      photo_category:
        | "entrance"
        | "site_parking"
        | "hookups"
        | "dump_water"
        | "bathrooms_showers"
        | "surroundings"
        | "rules_signs"
      place_category:
        | "National Park"
        | "State Park"
        | "County / Regional Park"
        | "RV Campground"
        | "Luxury RV Resort"
        | "Overnight Parking"
        | "Boondocking"
        | "Business Allowing Overnight"
        | "Rest Area / Travel Plaza"
        | "Fairgrounds / Event Grounds"
      place_feature:
        | "Dump Station"
        | "Fresh Water"
        | "Electric Hookups"
        | "Sewer Hookups"
        | "Showers"
        | "Laundry"
        | "Wi-Fi"
        | "Pet Friendly"
        | "Big Rig Friendly"
        | "Swimming Pool"
        | "Hot Tub"
        | "Heated Pool"
        | "Heated Hot Tub"
      place_status:
        | "open_accessible"
        | "access_questionable"
        | "temporarily_closed"
        | "restrictions_reported"
      price_level: "$" | "$$" | "$$$"
      review_dimension:
        | "quality"
        | "service"
        | "value"
        | "cleanliness"
        | "location"
        | "comfort"
        | "reliability"
        | "speed"
        | "restrictions"
      signal_polarity: "positive" | "improvement"
      suggestion_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      checkin_type: ["stayed_here", "used_dump_water", "passed_by"],
      notification_type: [
        "place_status_changed",
        "place_photo_added",
        "place_updated",
      ],
      package_acceptance: ["Yes", "No", "Limited"],
      photo_category: [
        "entrance",
        "site_parking",
        "hookups",
        "dump_water",
        "bathrooms_showers",
        "surroundings",
        "rules_signs",
      ],
      place_category: [
        "National Park",
        "State Park",
        "County / Regional Park",
        "RV Campground",
        "Luxury RV Resort",
        "Overnight Parking",
        "Boondocking",
        "Business Allowing Overnight",
        "Rest Area / Travel Plaza",
        "Fairgrounds / Event Grounds",
      ],
      place_feature: [
        "Dump Station",
        "Fresh Water",
        "Electric Hookups",
        "Sewer Hookups",
        "Showers",
        "Laundry",
        "Wi-Fi",
        "Pet Friendly",
        "Big Rig Friendly",
        "Swimming Pool",
        "Hot Tub",
        "Heated Pool",
        "Heated Hot Tub",
      ],
      place_status: [
        "open_accessible",
        "access_questionable",
        "temporarily_closed",
        "restrictions_reported",
      ],
      price_level: ["$", "$$", "$$$"],
      review_dimension: [
        "quality",
        "service",
        "value",
        "cleanliness",
        "location",
        "comfort",
        "reliability",
        "speed",
        "restrictions",
      ],
      signal_polarity: ["positive", "improvement"],
      suggestion_status: ["pending", "approved", "rejected"],
    },
  },
} as const
