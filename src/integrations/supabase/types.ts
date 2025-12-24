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
      category_mappings: {
        Row: {
          confidence: number
          created_at: string
          external_category: string
          id: string
          muvo_primary_category: string
          muvo_secondary_tags: string[] | null
          source: Database["public"]["Enums"]["external_source"]
        }
        Insert: {
          confidence?: number
          created_at?: string
          external_category: string
          id?: string
          muvo_primary_category: string
          muvo_secondary_tags?: string[] | null
          source: Database["public"]["Enums"]["external_source"]
        }
        Update: {
          confidence?: number
          created_at?: string
          external_category?: string
          id?: string
          muvo_primary_category?: string
          muvo_secondary_tags?: string[] | null
          source?: Database["public"]["Enums"]["external_source"]
        }
        Relationships: [
          {
            foreignKeyName: "category_mappings_muvo_primary_category_fkey"
            columns: ["muvo_primary_category"]
            isOneToOne: false
            referencedRelation: "primary_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      external_place_references: {
        Row: {
          created_at: string
          external_id: string
          external_url: string | null
          id: string
          imported_at: string
          last_synced_at: string | null
          place_id: string
          raw_data: Json | null
          source: Database["public"]["Enums"]["external_source"]
        }
        Insert: {
          created_at?: string
          external_id: string
          external_url?: string | null
          id?: string
          imported_at?: string
          last_synced_at?: string | null
          place_id: string
          raw_data?: Json | null
          source: Database["public"]["Enums"]["external_source"]
        }
        Update: {
          created_at?: string
          external_id?: string
          external_url?: string | null
          id?: string
          imported_at?: string
          last_synced_at?: string | null
          place_id?: string
          raw_data?: Json | null
          source?: Database["public"]["Enums"]["external_source"]
        }
        Relationships: [
          {
            foreignKeyName: "external_place_references_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
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
      import_queue: {
        Row: {
          created_at: string
          duplicate_confidence: number | null
          external_id: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          potential_duplicate_id: string | null
          raw_data: Json
          resulting_place_id: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source: Database["public"]["Enums"]["external_source"]
          status: Database["public"]["Enums"]["import_review_status"]
          suggested_primary_category: string | null
          suggested_tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duplicate_confidence?: number | null
          external_id?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          potential_duplicate_id?: string | null
          raw_data: Json
          resulting_place_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source: Database["public"]["Enums"]["external_source"]
          status?: Database["public"]["Enums"]["import_review_status"]
          suggested_primary_category?: string | null
          suggested_tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duplicate_confidence?: number | null
          external_id?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          potential_duplicate_id?: string | null
          raw_data?: Json
          resulting_place_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: Database["public"]["Enums"]["external_source"]
          status?: Database["public"]["Enums"]["import_review_status"]
          suggested_primary_category?: string | null
          suggested_tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_queue_potential_duplicate_id_fkey"
            columns: ["potential_duplicate_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_queue_resulting_place_id_fkey"
            columns: ["resulting_place_id"]
            isOneToOne: false
            referencedRelation: "places"
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
      place_claims: {
        Row: {
          business_email: string | null
          business_name: string | null
          business_phone: string | null
          business_website: string | null
          claim_type: string
          created_at: string
          id: string
          place_id: string
          status: string
          updated_at: string
          user_id: string
          verification_method: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          claim_type?: string
          created_at?: string
          id?: string
          place_id: string
          status?: string
          updated_at?: string
          user_id: string
          verification_method?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          claim_type?: string
          created_at?: string
          id?: string
          place_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          verification_method?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_claims_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_data_provenance: {
        Row: {
          confidence_score: number | null
          created_at: string
          field_name: string
          id: string
          imported_at: string
          last_verified_at: string | null
          place_id: string
          source: Database["public"]["Enums"]["external_source"]
          updated_at: string
          value_at_import: string | null
          verified_by: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          field_name: string
          id?: string
          imported_at?: string
          last_verified_at?: string | null
          place_id: string
          source: Database["public"]["Enums"]["external_source"]
          updated_at?: string
          value_at_import?: string | null
          verified_by?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          field_name?: string
          id?: string
          imported_at?: string
          last_verified_at?: string | null
          place_id?: string
          source?: Database["public"]["Enums"]["external_source"]
          updated_at?: string
          value_at_import?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_data_provenance_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_drafts: {
        Row: {
          created_at: string
          current_step: number | null
          draft_data: Json
          id: string
          is_edit: boolean | null
          place_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: number | null
          draft_data: Json
          id?: string
          is_edit?: boolean | null
          place_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: number | null
          draft_data?: Json
          id?: string
          is_edit?: boolean | null
          place_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_drafts_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_photos: {
        Row: {
          caption: string | null
          category: Database["public"]["Enums"]["photo_category"]
          created_at: string
          flag_reason: string | null
          flagged: boolean
          flagged_at: string | null
          flagged_by: string | null
          id: string
          is_approved: boolean
          place_id: string
          tags: Database["public"]["Enums"]["photo_tag"][] | null
          url: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          category: Database["public"]["Enums"]["photo_category"]
          created_at?: string
          flag_reason?: string | null
          flagged?: boolean
          flagged_at?: string | null
          flagged_by?: string | null
          id?: string
          is_approved?: boolean
          place_id: string
          tags?: Database["public"]["Enums"]["photo_tag"][] | null
          url: string
          user_id: string
        }
        Update: {
          caption?: string | null
          category?: Database["public"]["Enums"]["photo_category"]
          created_at?: string
          flag_reason?: string | null
          flagged?: boolean
          flagged_at?: string | null
          flagged_by?: string | null
          id?: string
          is_approved?: boolean
          place_id?: string
          tags?: Database["public"]["Enums"]["photo_tag"][] | null
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
      place_tags: {
        Row: {
          added_by: string | null
          created_at: string
          id: string
          place_id: string
          tag_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          id?: string
          place_id: string
          tag_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          id?: string
          place_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_tags_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "secondary_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address: string | null
          address_line1: string | null
          address_line2: string | null
          big_rig_friendly: Database["public"]["Enums"]["yes_no_some"] | null
          campfires_allowed:
            | Database["public"]["Enums"]["yes_no_seasonal"]
            | null
          category_id: string | null
          cell_signal_notes: string | null
          city: string | null
          claimed_by: string | null
          country: string | null
          county: string | null
          cover_image_url: string | null
          created_at: string
          created_by_user_id: string | null
          current_status: Database["public"]["Enums"]["place_status"] | null
          data_quality_score: number | null
          delivery_notes: string | null
          description: string | null
          dog_park: Database["public"]["Enums"]["yes_no_unknown"] | null
          dump_fee_amount: number | null
          dump_fee_required:
            | Database["public"]["Enums"]["yes_no_unknown"]
            | null
          dump_station: Database["public"]["Enums"]["yes_no_unknown"] | null
          electric: Database["public"]["Enums"]["electric_type"] | null
          elevation_ft: number | null
          email: string | null
          entrance_1_is_primary: boolean | null
          entrance_1_latitude: number | null
          entrance_1_longitude: number | null
          entrance_1_name: string | null
          entrance_1_notes: string | null
          entrance_1_road: string | null
          entrance_2_is_primary: boolean | null
          entrance_2_latitude: number | null
          entrance_2_longitude: number | null
          entrance_2_name: string | null
          entrance_2_notes: string | null
          entrance_2_road: string | null
          entrance_3_is_primary: boolean | null
          entrance_3_latitude: number | null
          entrance_3_longitude: number | null
          entrance_3_name: string | null
          entrance_3_notes: string | null
          entrance_3_road: string | null
          entrance_4_is_primary: boolean | null
          entrance_4_latitude: number | null
          entrance_4_longitude: number | null
          entrance_4_name: string | null
          entrance_4_notes: string | null
          entrance_4_road: string | null
          entrance_5_is_primary: boolean | null
          entrance_5_latitude: number | null
          entrance_5_longitude: number | null
          entrance_5_name: string | null
          entrance_5_notes: string | null
          entrance_5_road: string | null
          entrance_6_is_primary: boolean | null
          entrance_6_latitude: number | null
          entrance_6_longitude: number | null
          entrance_6_name: string | null
          entrance_6_notes: string | null
          entrance_6_road: string | null
          entrance_latitude: number | null
          entrance_longitude: number | null
          external_refs_json: Json | null
          facebook_url: string | null
          features: Database["public"]["Enums"]["place_feature"][] | null
          fees_json: Json | null
          fire_pits: Database["public"]["Enums"]["yes_no_unknown"] | null
          fresh_water_fill: Database["public"]["Enums"]["yes_no_unknown"] | null
          full_hookups: Database["public"]["Enums"]["yes_no_unknown"] | null
          generator_hours: string | null
          generators_allowed:
            | Database["public"]["Enums"]["yes_no_restricted"]
            | null
          grade: Database["public"]["Enums"]["grade_type"] | null
          has_conflict: boolean
          hot_tub: Database["public"]["Enums"]["yes_no_unknown"] | null
          hours_json: Json | null
          hours_of_operation: Json | null
          id: string
          import_source: Database["public"]["Enums"]["external_source"] | null
          instagram_url: string | null
          is_24_7: boolean | null
          is_claimed: boolean
          is_verified: boolean
          is_verified_place: boolean | null
          last_updated: string
          last_verified_at: string | null
          latitude: number
          laundry: Database["public"]["Enums"]["yes_no_unknown"] | null
          longitude: number
          max_height_ft: number | null
          max_rv_length_ft: number | null
          name: string
          needs_review: boolean
          nightly_rate_max: number | null
          nightly_rate_min: number | null
          no_formal_address: boolean | null
          noise_level: Database["public"]["Enums"]["noise_level"] | null
          open_year_round: boolean
          package_fee_amount: string | null
          package_fee_required: boolean
          packages_accepted: Database["public"]["Enums"]["package_acceptance"]
          payment_types: string[] | null
          pets_allowed: Database["public"]["Enums"]["yes_no_restricted"] | null
          phone: string | null
          picnic_tables: Database["public"]["Enums"]["yes_no_unknown"] | null
          pin_accuracy: Database["public"]["Enums"]["pin_accuracy"] | null
          playground: Database["public"]["Enums"]["yes_no_unknown"] | null
          pool_heating: Database["public"]["Enums"]["pool_heating"] | null
          pool_open_year_round:
            | Database["public"]["Enums"]["yes_no_unknown"]
            | null
          postal_code: string | null
          price_level: Database["public"]["Enums"]["price_level"]
          primary_category: Database["public"]["Enums"]["place_category"]
          recycling: Database["public"]["Enums"]["yes_no_unknown"] | null
          restrooms: Database["public"]["Enums"]["yes_no_unknown"] | null
          review_count: number
          road_condition: Database["public"]["Enums"]["road_condition"] | null
          road_type: Database["public"]["Enums"]["road_type"] | null
          rules_notes: string | null
          safety_level: Database["public"]["Enums"]["safety_level"] | null
          seasonal_notes: string | null
          seasonal_open_months: string[] | null
          sewer_hookup: Database["public"]["Enums"]["yes_no_some"] | null
          short_summary: string | null
          showers: Database["public"]["Enums"]["yes_no_unknown"] | null
          state: string | null
          status_updated_at: string | null
          store_on_site: Database["public"]["Enums"]["yes_no_unknown"] | null
          swimming_pool: Database["public"]["Enums"]["yes_no_unknown"] | null
          taxes_included: Database["public"]["Enums"]["yes_no_unknown"] | null
          timezone: string | null
          towing_friendly: Database["public"]["Enums"]["yes_no_unknown"] | null
          trash: Database["public"]["Enums"]["yes_no_unknown"] | null
          turnaround_available:
            | Database["public"]["Enums"]["yes_no_unknown"]
            | null
          verified_by: string | null
          water_hookup: Database["public"]["Enums"]["yes_no_some"] | null
          water_notes: string | null
          water_type: Database["public"]["Enums"]["water_type_enum"] | null
          website: string | null
          wifi: Database["public"]["Enums"]["yes_no_unknown"] | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          address_line1?: string | null
          address_line2?: string | null
          big_rig_friendly?: Database["public"]["Enums"]["yes_no_some"] | null
          campfires_allowed?:
            | Database["public"]["Enums"]["yes_no_seasonal"]
            | null
          category_id?: string | null
          cell_signal_notes?: string | null
          city?: string | null
          claimed_by?: string | null
          country?: string | null
          county?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by_user_id?: string | null
          current_status?: Database["public"]["Enums"]["place_status"] | null
          data_quality_score?: number | null
          delivery_notes?: string | null
          description?: string | null
          dog_park?: Database["public"]["Enums"]["yes_no_unknown"] | null
          dump_fee_amount?: number | null
          dump_fee_required?:
            | Database["public"]["Enums"]["yes_no_unknown"]
            | null
          dump_station?: Database["public"]["Enums"]["yes_no_unknown"] | null
          electric?: Database["public"]["Enums"]["electric_type"] | null
          elevation_ft?: number | null
          email?: string | null
          entrance_1_is_primary?: boolean | null
          entrance_1_latitude?: number | null
          entrance_1_longitude?: number | null
          entrance_1_name?: string | null
          entrance_1_notes?: string | null
          entrance_1_road?: string | null
          entrance_2_is_primary?: boolean | null
          entrance_2_latitude?: number | null
          entrance_2_longitude?: number | null
          entrance_2_name?: string | null
          entrance_2_notes?: string | null
          entrance_2_road?: string | null
          entrance_3_is_primary?: boolean | null
          entrance_3_latitude?: number | null
          entrance_3_longitude?: number | null
          entrance_3_name?: string | null
          entrance_3_notes?: string | null
          entrance_3_road?: string | null
          entrance_4_is_primary?: boolean | null
          entrance_4_latitude?: number | null
          entrance_4_longitude?: number | null
          entrance_4_name?: string | null
          entrance_4_notes?: string | null
          entrance_4_road?: string | null
          entrance_5_is_primary?: boolean | null
          entrance_5_latitude?: number | null
          entrance_5_longitude?: number | null
          entrance_5_name?: string | null
          entrance_5_notes?: string | null
          entrance_5_road?: string | null
          entrance_6_is_primary?: boolean | null
          entrance_6_latitude?: number | null
          entrance_6_longitude?: number | null
          entrance_6_name?: string | null
          entrance_6_notes?: string | null
          entrance_6_road?: string | null
          entrance_latitude?: number | null
          entrance_longitude?: number | null
          external_refs_json?: Json | null
          facebook_url?: string | null
          features?: Database["public"]["Enums"]["place_feature"][] | null
          fees_json?: Json | null
          fire_pits?: Database["public"]["Enums"]["yes_no_unknown"] | null
          fresh_water_fill?:
            | Database["public"]["Enums"]["yes_no_unknown"]
            | null
          full_hookups?: Database["public"]["Enums"]["yes_no_unknown"] | null
          generator_hours?: string | null
          generators_allowed?:
            | Database["public"]["Enums"]["yes_no_restricted"]
            | null
          grade?: Database["public"]["Enums"]["grade_type"] | null
          has_conflict?: boolean
          hot_tub?: Database["public"]["Enums"]["yes_no_unknown"] | null
          hours_json?: Json | null
          hours_of_operation?: Json | null
          id?: string
          import_source?: Database["public"]["Enums"]["external_source"] | null
          instagram_url?: string | null
          is_24_7?: boolean | null
          is_claimed?: boolean
          is_verified?: boolean
          is_verified_place?: boolean | null
          last_updated?: string
          last_verified_at?: string | null
          latitude: number
          laundry?: Database["public"]["Enums"]["yes_no_unknown"] | null
          longitude: number
          max_height_ft?: number | null
          max_rv_length_ft?: number | null
          name: string
          needs_review?: boolean
          nightly_rate_max?: number | null
          nightly_rate_min?: number | null
          no_formal_address?: boolean | null
          noise_level?: Database["public"]["Enums"]["noise_level"] | null
          open_year_round?: boolean
          package_fee_amount?: string | null
          package_fee_required?: boolean
          packages_accepted?: Database["public"]["Enums"]["package_acceptance"]
          payment_types?: string[] | null
          pets_allowed?: Database["public"]["Enums"]["yes_no_restricted"] | null
          phone?: string | null
          picnic_tables?: Database["public"]["Enums"]["yes_no_unknown"] | null
          pin_accuracy?: Database["public"]["Enums"]["pin_accuracy"] | null
          playground?: Database["public"]["Enums"]["yes_no_unknown"] | null
          pool_heating?: Database["public"]["Enums"]["pool_heating"] | null
          pool_open_year_round?:
            | Database["public"]["Enums"]["yes_no_unknown"]
            | null
          postal_code?: string | null
          price_level?: Database["public"]["Enums"]["price_level"]
          primary_category?: Database["public"]["Enums"]["place_category"]
          recycling?: Database["public"]["Enums"]["yes_no_unknown"] | null
          restrooms?: Database["public"]["Enums"]["yes_no_unknown"] | null
          review_count?: number
          road_condition?: Database["public"]["Enums"]["road_condition"] | null
          road_type?: Database["public"]["Enums"]["road_type"] | null
          rules_notes?: string | null
          safety_level?: Database["public"]["Enums"]["safety_level"] | null
          seasonal_notes?: string | null
          seasonal_open_months?: string[] | null
          sewer_hookup?: Database["public"]["Enums"]["yes_no_some"] | null
          short_summary?: string | null
          showers?: Database["public"]["Enums"]["yes_no_unknown"] | null
          state?: string | null
          status_updated_at?: string | null
          store_on_site?: Database["public"]["Enums"]["yes_no_unknown"] | null
          swimming_pool?: Database["public"]["Enums"]["yes_no_unknown"] | null
          taxes_included?: Database["public"]["Enums"]["yes_no_unknown"] | null
          timezone?: string | null
          towing_friendly?: Database["public"]["Enums"]["yes_no_unknown"] | null
          trash?: Database["public"]["Enums"]["yes_no_unknown"] | null
          turnaround_available?:
            | Database["public"]["Enums"]["yes_no_unknown"]
            | null
          verified_by?: string | null
          water_hookup?: Database["public"]["Enums"]["yes_no_some"] | null
          water_notes?: string | null
          water_type?: Database["public"]["Enums"]["water_type_enum"] | null
          website?: string | null
          wifi?: Database["public"]["Enums"]["yes_no_unknown"] | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          address_line1?: string | null
          address_line2?: string | null
          big_rig_friendly?: Database["public"]["Enums"]["yes_no_some"] | null
          campfires_allowed?:
            | Database["public"]["Enums"]["yes_no_seasonal"]
            | null
          category_id?: string | null
          cell_signal_notes?: string | null
          city?: string | null
          claimed_by?: string | null
          country?: string | null
          county?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by_user_id?: string | null
          current_status?: Database["public"]["Enums"]["place_status"] | null
          data_quality_score?: number | null
          delivery_notes?: string | null
          description?: string | null
          dog_park?: Database["public"]["Enums"]["yes_no_unknown"] | null
          dump_fee_amount?: number | null
          dump_fee_required?:
            | Database["public"]["Enums"]["yes_no_unknown"]
            | null
          dump_station?: Database["public"]["Enums"]["yes_no_unknown"] | null
          electric?: Database["public"]["Enums"]["electric_type"] | null
          elevation_ft?: number | null
          email?: string | null
          entrance_1_is_primary?: boolean | null
          entrance_1_latitude?: number | null
          entrance_1_longitude?: number | null
          entrance_1_name?: string | null
          entrance_1_notes?: string | null
          entrance_1_road?: string | null
          entrance_2_is_primary?: boolean | null
          entrance_2_latitude?: number | null
          entrance_2_longitude?: number | null
          entrance_2_name?: string | null
          entrance_2_notes?: string | null
          entrance_2_road?: string | null
          entrance_3_is_primary?: boolean | null
          entrance_3_latitude?: number | null
          entrance_3_longitude?: number | null
          entrance_3_name?: string | null
          entrance_3_notes?: string | null
          entrance_3_road?: string | null
          entrance_4_is_primary?: boolean | null
          entrance_4_latitude?: number | null
          entrance_4_longitude?: number | null
          entrance_4_name?: string | null
          entrance_4_notes?: string | null
          entrance_4_road?: string | null
          entrance_5_is_primary?: boolean | null
          entrance_5_latitude?: number | null
          entrance_5_longitude?: number | null
          entrance_5_name?: string | null
          entrance_5_notes?: string | null
          entrance_5_road?: string | null
          entrance_6_is_primary?: boolean | null
          entrance_6_latitude?: number | null
          entrance_6_longitude?: number | null
          entrance_6_name?: string | null
          entrance_6_notes?: string | null
          entrance_6_road?: string | null
          entrance_latitude?: number | null
          entrance_longitude?: number | null
          external_refs_json?: Json | null
          facebook_url?: string | null
          features?: Database["public"]["Enums"]["place_feature"][] | null
          fees_json?: Json | null
          fire_pits?: Database["public"]["Enums"]["yes_no_unknown"] | null
          fresh_water_fill?:
            | Database["public"]["Enums"]["yes_no_unknown"]
            | null
          full_hookups?: Database["public"]["Enums"]["yes_no_unknown"] | null
          generator_hours?: string | null
          generators_allowed?:
            | Database["public"]["Enums"]["yes_no_restricted"]
            | null
          grade?: Database["public"]["Enums"]["grade_type"] | null
          has_conflict?: boolean
          hot_tub?: Database["public"]["Enums"]["yes_no_unknown"] | null
          hours_json?: Json | null
          hours_of_operation?: Json | null
          id?: string
          import_source?: Database["public"]["Enums"]["external_source"] | null
          instagram_url?: string | null
          is_24_7?: boolean | null
          is_claimed?: boolean
          is_verified?: boolean
          is_verified_place?: boolean | null
          last_updated?: string
          last_verified_at?: string | null
          latitude?: number
          laundry?: Database["public"]["Enums"]["yes_no_unknown"] | null
          longitude?: number
          max_height_ft?: number | null
          max_rv_length_ft?: number | null
          name?: string
          needs_review?: boolean
          nightly_rate_max?: number | null
          nightly_rate_min?: number | null
          no_formal_address?: boolean | null
          noise_level?: Database["public"]["Enums"]["noise_level"] | null
          open_year_round?: boolean
          package_fee_amount?: string | null
          package_fee_required?: boolean
          packages_accepted?: Database["public"]["Enums"]["package_acceptance"]
          payment_types?: string[] | null
          pets_allowed?: Database["public"]["Enums"]["yes_no_restricted"] | null
          phone?: string | null
          picnic_tables?: Database["public"]["Enums"]["yes_no_unknown"] | null
          pin_accuracy?: Database["public"]["Enums"]["pin_accuracy"] | null
          playground?: Database["public"]["Enums"]["yes_no_unknown"] | null
          pool_heating?: Database["public"]["Enums"]["pool_heating"] | null
          pool_open_year_round?:
            | Database["public"]["Enums"]["yes_no_unknown"]
            | null
          postal_code?: string | null
          price_level?: Database["public"]["Enums"]["price_level"]
          primary_category?: Database["public"]["Enums"]["place_category"]
          recycling?: Database["public"]["Enums"]["yes_no_unknown"] | null
          restrooms?: Database["public"]["Enums"]["yes_no_unknown"] | null
          review_count?: number
          road_condition?: Database["public"]["Enums"]["road_condition"] | null
          road_type?: Database["public"]["Enums"]["road_type"] | null
          rules_notes?: string | null
          safety_level?: Database["public"]["Enums"]["safety_level"] | null
          seasonal_notes?: string | null
          seasonal_open_months?: string[] | null
          sewer_hookup?: Database["public"]["Enums"]["yes_no_some"] | null
          short_summary?: string | null
          showers?: Database["public"]["Enums"]["yes_no_unknown"] | null
          state?: string | null
          status_updated_at?: string | null
          store_on_site?: Database["public"]["Enums"]["yes_no_unknown"] | null
          swimming_pool?: Database["public"]["Enums"]["yes_no_unknown"] | null
          taxes_included?: Database["public"]["Enums"]["yes_no_unknown"] | null
          timezone?: string | null
          towing_friendly?: Database["public"]["Enums"]["yes_no_unknown"] | null
          trash?: Database["public"]["Enums"]["yes_no_unknown"] | null
          turnaround_available?:
            | Database["public"]["Enums"]["yes_no_unknown"]
            | null
          verified_by?: string | null
          water_hookup?: Database["public"]["Enums"]["yes_no_some"] | null
          water_notes?: string | null
          water_type?: Database["public"]["Enums"]["water_type_enum"] | null
          website?: string | null
          wifi?: Database["public"]["Enums"]["yes_no_unknown"] | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "primary_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_categories: {
        Row: {
          category_group: Database["public"]["Enums"]["category_group"]
          created_at: string
          icon: string | null
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          category_group: Database["public"]["Enums"]["category_group"]
          created_at?: string
          icon?: string | null
          id: string
          label: string
          sort_order?: number
        }
        Update: {
          category_group?: Database["public"]["Enums"]["category_group"]
          created_at?: string
          icon?: string | null
          id?: string
          label?: string
          sort_order?: number
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
      secondary_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          label: string
          sort_order: number
          tag_group: Database["public"]["Enums"]["tag_group"]
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id: string
          label: string
          sort_order?: number
          tag_group: Database["public"]["Enums"]["tag_group"]
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          label?: string
          sort_order?: number
          tag_group?: Database["public"]["Enums"]["tag_group"]
        }
        Relationships: []
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
      add_place_tag: {
        Args: { _place_id: string; _tag_id: string; _user_id?: string }
        Returns: boolean
      }
      check_nearby_places: {
        Args: { _lat: number; _lng: number; _name: string }
        Returns: {
          distance_meters: number
          id: string
          name: string
        }[]
      }
      find_duplicate_places: {
        Args: {
          _lat: number
          _lng: number
          _name: string
          _radius_meters?: number
        }
        Returns: {
          confidence_score: number
          distance_meters: number
          name_similarity: number
          place_id: string
          place_name: string
        }[]
      }
      find_place_by_external_id: {
        Args: {
          _external_id: string
          _source: Database["public"]["Enums"]["external_source"]
        }
        Returns: string
      }
      get_category_label: { Args: { _category_id: string }; Returns: string }
      get_place_tags: { Args: { _place_id: string }; Returns: string[] }
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
      process_import_item: {
        Args: {
          _action: string
          _admin_id?: string
          _import_id: string
          _merge_with_place_id?: string
          _notes?: string
        }
        Returns: string
      }
      queue_import: {
        Args: {
          _external_id: string
          _lat: number
          _lng: number
          _name: string
          _raw_data: Json
          _source: Database["public"]["Enums"]["external_source"]
          _suggested_category?: string
          _suggested_tags?: string[]
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      category_group:
        | "stay_sleep"
        | "rv_services"
        | "essential_stops"
        | "non_rv_lodging"
        | "food_drink"
        | "general_services"
        | "attractions"
        | "health_safety"
        | "retail"
        | "community_other"
      checkin_type: "stayed_here" | "used_dump_water" | "passed_by"
      electric_type: "none" | "15a" | "30a" | "50a" | "mix" | "unknown"
      external_source:
        | "google_maps"
        | "ioverlander"
        | "yelp"
        | "foursquare"
        | "campendium"
        | "freecampsites"
        | "csv_import"
        | "user_submission"
        | "admin_entry"
        | "other"
      grade_type: "flat" | "moderate" | "steep" | "unknown"
      import_review_status:
        | "pending"
        | "approved"
        | "rejected"
        | "merged"
        | "needs_review"
      noise_level: "quiet" | "moderate" | "loud" | "unknown"
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
      photo_tag:
        | "entrance"
        | "site"
        | "hookups"
        | "dump"
        | "water"
        | "bathrooms"
        | "sign"
        | "view"
        | "amenities"
        | "other"
      pin_accuracy: "exact" | "approximate" | "unknown"
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
      pool_heating:
        | "both_heated"
        | "pool_only"
        | "hot_tub_only"
        | "not_heated"
        | "unknown"
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
      road_condition: "good" | "ok" | "rough" | "muddy" | "unknown"
      road_type: "paved" | "gravel" | "dirt" | "sand" | "mixed" | "unknown"
      safety_level: "safe" | "use_caution" | "avoid_at_night" | "unknown"
      signal_polarity: "positive" | "improvement"
      suggestion_status: "pending" | "approved" | "rejected"
      tag_group:
        | "rv_specific"
        | "utilities"
        | "environment"
        | "rules_policies"
        | "cost"
      water_type_enum: "potable" | "non_potable" | "unknown"
      yes_no_restricted: "yes" | "no" | "restricted" | "unknown"
      yes_no_seasonal: "yes" | "no" | "seasonal" | "unknown"
      yes_no_some: "yes" | "no" | "some" | "unknown"
      yes_no_unknown: "yes" | "no" | "unknown"
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
      category_group: [
        "stay_sleep",
        "rv_services",
        "essential_stops",
        "non_rv_lodging",
        "food_drink",
        "general_services",
        "attractions",
        "health_safety",
        "retail",
        "community_other",
      ],
      checkin_type: ["stayed_here", "used_dump_water", "passed_by"],
      electric_type: ["none", "15a", "30a", "50a", "mix", "unknown"],
      external_source: [
        "google_maps",
        "ioverlander",
        "yelp",
        "foursquare",
        "campendium",
        "freecampsites",
        "csv_import",
        "user_submission",
        "admin_entry",
        "other",
      ],
      grade_type: ["flat", "moderate", "steep", "unknown"],
      import_review_status: [
        "pending",
        "approved",
        "rejected",
        "merged",
        "needs_review",
      ],
      noise_level: ["quiet", "moderate", "loud", "unknown"],
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
      photo_tag: [
        "entrance",
        "site",
        "hookups",
        "dump",
        "water",
        "bathrooms",
        "sign",
        "view",
        "amenities",
        "other",
      ],
      pin_accuracy: ["exact", "approximate", "unknown"],
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
      pool_heating: [
        "both_heated",
        "pool_only",
        "hot_tub_only",
        "not_heated",
        "unknown",
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
      road_condition: ["good", "ok", "rough", "muddy", "unknown"],
      road_type: ["paved", "gravel", "dirt", "sand", "mixed", "unknown"],
      safety_level: ["safe", "use_caution", "avoid_at_night", "unknown"],
      signal_polarity: ["positive", "improvement"],
      suggestion_status: ["pending", "approved", "rejected"],
      tag_group: [
        "rv_specific",
        "utilities",
        "environment",
        "rules_policies",
        "cost",
      ],
      water_type_enum: ["potable", "non_potable", "unknown"],
      yes_no_restricted: ["yes", "no", "restricted", "unknown"],
      yes_no_seasonal: ["yes", "no", "seasonal", "unknown"],
      yes_no_some: ["yes", "no", "some", "unknown"],
      yes_no_unknown: ["yes", "no", "unknown"],
    },
  },
} as const
