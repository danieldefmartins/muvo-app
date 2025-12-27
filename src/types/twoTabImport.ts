// Types for two-tab bulk import (Places + Entrances)

import type { Database } from "@/integrations/supabase/types";

export type PlaceCategory = Database["public"]["Enums"]["place_category"];
export type PriceLevel = Database["public"]["Enums"]["price_level"];

// ========== PLACES TAB FIELDS ==========
export interface PlaceFieldDefinition {
  key: string;
  label: string;
  required: boolean;
  group: 'identifier' | 'basic' | 'location' | 'contact';
  type: 'string' | 'number' | 'boolean' | 'array' | 'category' | 'price';
}

export const PLACES_FIELDS: PlaceFieldDefinition[] = [
  // Identifier (required for upsert)
  { key: 'place_external_id', label: 'Place External ID', required: true, group: 'identifier', type: 'string' },
  
  // Basic Info
  { key: 'name', label: 'Place Name', required: true, group: 'basic', type: 'string' },
  { key: 'latitude', label: 'Latitude', required: true, group: 'basic', type: 'number' },
  { key: 'longitude', label: 'Longitude', required: true, group: 'basic', type: 'number' },
  { key: 'primary_category', label: 'Primary Category', required: false, group: 'basic', type: 'category' },
  { key: 'price_level', label: 'Price Level', required: false, group: 'basic', type: 'price' },
  { key: 'description', label: 'Description', required: false, group: 'basic', type: 'string' },
  { key: 'short_summary', label: 'Short Summary', required: false, group: 'basic', type: 'string' },
  
  // Location
  { key: 'address_line1', label: 'Address Line 1', required: false, group: 'location', type: 'string' },
  { key: 'address_line2', label: 'Address Line 2', required: false, group: 'location', type: 'string' },
  { key: 'city', label: 'City', required: false, group: 'location', type: 'string' },
  { key: 'state', label: 'State', required: false, group: 'location', type: 'string' },
  { key: 'postal_code', label: 'Postal Code', required: false, group: 'location', type: 'string' },
  { key: 'county', label: 'County', required: false, group: 'location', type: 'string' },
  { key: 'country', label: 'Country', required: false, group: 'location', type: 'string' },
  
  // Contact
  { key: 'phone', label: 'Phone', required: false, group: 'contact', type: 'string' },
  { key: 'email', label: 'Email', required: false, group: 'contact', type: 'string' },
  { key: 'website', label: 'Website', required: false, group: 'contact', type: 'string' },
];

// ========== ENTRANCES TAB FIELDS ==========
export interface EntranceFieldDefinition {
  key: string;
  label: string;
  required: boolean;
  group: 'identifier' | 'basic' | 'rv_info';
  type: 'string' | 'number' | 'boolean' | 'enum';
  enumValues?: string[];
}

export const ENTRANCES_FIELDS: EntranceFieldDefinition[] = [
  // Identifiers
  { key: 'place_external_id', label: 'Place External ID', required: true, group: 'identifier', type: 'string' },
  { key: 'entrance_external_id', label: 'Entrance External ID', required: true, group: 'identifier', type: 'string' },
  
  // Basic
  { key: 'entrance_name', label: 'Entrance Name', required: true, group: 'basic', type: 'string' },
  { key: 'latitude', label: 'Latitude', required: true, group: 'basic', type: 'number' },
  { key: 'longitude', label: 'Longitude', required: true, group: 'basic', type: 'number' },
  { key: 'is_primary', label: 'Is Primary', required: false, group: 'basic', type: 'boolean' },
  { key: 'entrance_notes', label: 'Entrance Notes', required: false, group: 'basic', type: 'string' },
  
  // RV Info
  { key: 'max_rv_length_ft', label: 'Max RV Length (ft)', required: false, group: 'rv_info', type: 'number' },
  { key: 'max_rv_height_ft', label: 'Max RV Height (ft)', required: false, group: 'rv_info', type: 'number' },
  { key: 'road_type', label: 'Road Type', required: false, group: 'rv_info', type: 'enum', enumValues: ['paved', 'gravel', 'dirt'] },
  { key: 'grade', label: 'Grade', required: false, group: 'rv_info', type: 'enum', enumValues: ['flat', 'moderate', 'steep'] },
  { key: 'tight_turns', label: 'Tight Turns', required: false, group: 'rv_info', type: 'boolean' },
  { key: 'low_clearance_warning', label: 'Low Clearance Warning', required: false, group: 'rv_info', type: 'boolean' },
  { key: 'seasonal_access', label: 'Seasonal Access', required: false, group: 'rv_info', type: 'enum', enumValues: ['year_round', 'seasonal'] },
  { key: 'seasonal_notes', label: 'Seasonal Notes', required: false, group: 'rv_info', type: 'string' },
];

// Column aliases for auto-mapping
export const PLACES_COLUMN_ALIASES: Record<string, string[]> = {
  'place_external_id': ['place_external_id', 'external_id', 'place_id', 'id', 'unique_id'],
  'name': ['name', 'place_name', 'title', 'location_name'],
  'latitude': ['latitude', 'lat', 'y'],
  'longitude': ['longitude', 'lng', 'lon', 'long', 'x'],
  'primary_category': ['category', 'primary_category', 'type'],
  'price_level': ['price', 'price_level', 'cost'],
  'description': ['description', 'about', 'info'],
  'address_line1': ['address', 'address_line1', 'street'],
  'city': ['city', 'town'],
  'state': ['state', 'province'],
  'postal_code': ['postal_code', 'zip', 'zipcode'],
  'county': ['county'],
  'country': ['country'],
  'phone': ['phone', 'telephone'],
  'email': ['email'],
  'website': ['website', 'url'],
};

export const ENTRANCES_COLUMN_ALIASES: Record<string, string[]> = {
  'place_external_id': ['place_external_id', 'place_id', 'parent_id'],
  'entrance_external_id': ['entrance_external_id', 'entrance_id', 'id'],
  'entrance_name': ['entrance_name', 'name', 'gate_name'],
  'latitude': ['latitude', 'lat', 'entrance_lat'],
  'longitude': ['longitude', 'lng', 'lon', 'entrance_lng'],
  'is_primary': ['is_primary', 'primary', 'main'],
  'entrance_notes': ['notes', 'entrance_notes', 'description'],
  'max_rv_length_ft': ['max_rv_length', 'max_length', 'rv_length'],
  'max_rv_height_ft': ['max_rv_height', 'max_height', 'rv_height'],
  'road_type': ['road_type', 'road', 'surface'],
  'grade': ['grade', 'steepness', 'slope'],
  'tight_turns': ['tight_turns', 'sharp_turns'],
  'low_clearance_warning': ['low_clearance', 'clearance_warning'],
  'seasonal_access': ['seasonal_access', 'access'],
  'seasonal_notes': ['seasonal_notes'],
};

// Valid categories
export const VALID_CATEGORIES: PlaceCategory[] = [
  "National Park",
  "State Park",
  "County / Regional Park",
  "RV Campground",
  "Luxury RV Resort",
  "Overnight Parking",
  "Boondocking",
  "Business Allowing Overnight",
  "Rest Area / Travel Plaza",
  "Fairgrounds / Event Grounds"
];

export const VALID_PRICE_LEVELS: PriceLevel[] = ["$", "$$", "$$$"];

// Parsed row for import
export interface ParsedPlaceRow {
  rowNumber: number;
  rawData: Record<string, string>;
  mappedData: Record<string, any>;
  isValid: boolean;
  errors: string[];
  isUpdate: boolean; // true if place_external_id already exists
}

export interface ParsedEntranceRow {
  rowNumber: number;
  rawData: Record<string, string>;
  mappedData: Record<string, any>;
  isValid: boolean;
  errors: string[];
  placeId?: string; // resolved place UUID
  isUpdate: boolean; // true if entrance_external_id already exists
}

export interface TwoTabImportResults {
  placesCreated: number;
  placesUpdated: number;
  placesErrored: number;
  entrancesCreated: number;
  entrancesUpdated: number;
  entrancesErrored: number;
  placeErrors: ParsedPlaceRow[];
  entranceErrors: ParsedEntranceRow[];
}

export interface TwoTabImportState {
  step: 'upload' | 'map_places' | 'map_entrances' | 'validate' | 'results';
  
  // Places sheet
  placesFileName: string;
  placesColumns: string[];
  placesRawRows: Record<string, string>[];
  placesMapping: Record<string, string | null>;
  placesParsed: ParsedPlaceRow[];
  
  // Entrances sheet
  entrancesFileName: string;
  entrancesColumns: string[];
  entrancesRawRows: Record<string, string>[];
  entrancesMapping: Record<string, string | null>;
  entrancesParsed: ParsedEntranceRow[];
  
  // Results
  results: TwoTabImportResults | null;
}

export const DEFAULT_TWO_TAB_STATE: TwoTabImportState = {
  step: 'upload',
  placesFileName: '',
  placesColumns: [],
  placesRawRows: [],
  placesMapping: {},
  placesParsed: [],
  entrancesFileName: '',
  entrancesColumns: [],
  entrancesRawRows: [],
  entrancesMapping: {},
  entrancesParsed: [],
  results: null,
};
