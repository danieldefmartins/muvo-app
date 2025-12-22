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
      places: {
        Row: {
          categories: Database["public"]["Enums"]["place_category"][]
          cover_image_url: string | null
          created_at: string
          has_conflict: boolean
          id: string
          is_verified: boolean
          last_updated: string
          latitude: number
          longitude: number
          name: string
          package_fee_amount: string | null
          package_fee_required: boolean
          packages_accepted: Database["public"]["Enums"]["package_acceptance"]
          price_level: Database["public"]["Enums"]["price_level"]
          primary_category: Database["public"]["Enums"]["place_category"]
        }
        Insert: {
          categories?: Database["public"]["Enums"]["place_category"][]
          cover_image_url?: string | null
          created_at?: string
          has_conflict?: boolean
          id?: string
          is_verified?: boolean
          last_updated?: string
          latitude: number
          longitude: number
          name: string
          package_fee_amount?: string | null
          package_fee_required?: boolean
          packages_accepted?: Database["public"]["Enums"]["package_acceptance"]
          price_level?: Database["public"]["Enums"]["price_level"]
          primary_category?: Database["public"]["Enums"]["place_category"]
        }
        Update: {
          categories?: Database["public"]["Enums"]["place_category"][]
          cover_image_url?: string | null
          created_at?: string
          has_conflict?: boolean
          id?: string
          is_verified?: boolean
          last_updated?: string
          latitude?: number
          longitude?: number
          name?: string
          package_fee_amount?: string | null
          package_fee_required?: boolean
          packages_accepted?: Database["public"]["Enums"]["package_acceptance"]
          price_level?: Database["public"]["Enums"]["price_level"]
          primary_category?: Database["public"]["Enums"]["place_category"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          email_verified: boolean
          email_verified_at: string | null
          id: string
          is_verified: boolean
          phone_number: string | null
          phone_verified: boolean
          phone_verified_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_verified?: boolean
          email_verified_at?: string | null
          id: string
          is_verified?: boolean
          phone_number?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_verified?: boolean
          email_verified_at?: string | null
          id?: string
          is_verified?: boolean
          phone_number?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_verified_user: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      package_acceptance: "Yes" | "No" | "Limited"
      place_category:
        | "National Park Campground"
        | "State Park Campground"
        | "County / Regional Park Campground"
        | "City / Municipal Park Campground"
        | "Public Land"
        | "RV Campground"
        | "Luxury RV Resort"
        | "Campground (Mixed)"
        | "Boondocking Area"
        | "Overnight Parking Spot"
        | "Business Allowing Overnight Parking"
        | "Dump Station"
        | "Water Station"
        | "Propane Station"
        | "RV Service / Repair"
        | "Rest Area"
      price_level: "$" | "$$" | "$$$"
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
      package_acceptance: ["Yes", "No", "Limited"],
      place_category: [
        "National Park Campground",
        "State Park Campground",
        "County / Regional Park Campground",
        "City / Municipal Park Campground",
        "Public Land",
        "RV Campground",
        "Luxury RV Resort",
        "Campground (Mixed)",
        "Boondocking Area",
        "Overnight Parking Spot",
        "Business Allowing Overnight Parking",
        "Dump Station",
        "Water Station",
        "Propane Station",
        "RV Service / Repair",
        "Rest Area",
      ],
      price_level: ["$", "$$", "$$$"],
    },
  },
} as const
