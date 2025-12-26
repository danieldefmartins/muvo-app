import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type MuvoMedalLevel = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

export interface MuvoScoreData {
  pos_taps_total: number;
  neg_taps_total: number;
  qual_taps_total: number;
  neg_label_counts: Record<string, number>;
  top_neg_taps: number;
  repeat_neg_ratio: number;
  neg_types_count: number;
  first_muvo_tap_at: string | null;
  active_weeks_count: number;
  muvo_score: number | null;
  muvo_medal_level: MuvoMedalLevel;
  medal_awarded_at: string | null;
}

/**
 * Fetch MUVO score and medal data for a place
 * This data is computed server-side via triggers on review_signals
 */
export function useMuvoScore(placeId: string | undefined) {
  return useQuery({
    queryKey: ['muvo-score', placeId],
    queryFn: async (): Promise<MuvoScoreData | null> => {
      if (!placeId) return null;
      
      const { data, error } = await supabase
        .from('places')
        .select(`
          pos_taps_total,
          neg_taps_total,
          qual_taps_total,
          neg_label_counts,
          top_neg_taps,
          repeat_neg_ratio,
          neg_types_count,
          first_muvo_tap_at,
          active_weeks_count,
          muvo_score,
          muvo_medal_level,
          medal_awarded_at
        `)
        .eq('id', placeId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        pos_taps_total: data.pos_taps_total ?? 0,
        neg_taps_total: data.neg_taps_total ?? 0,
        qual_taps_total: data.qual_taps_total ?? 0,
        neg_label_counts: (data.neg_label_counts as Record<string, number>) ?? {},
        top_neg_taps: data.top_neg_taps ?? 0,
        repeat_neg_ratio: Number(data.repeat_neg_ratio) ?? 0,
        neg_types_count: data.neg_types_count ?? 0,
        first_muvo_tap_at: data.first_muvo_tap_at,
        active_weeks_count: data.active_weeks_count ?? 0,
        muvo_score: data.muvo_score ? Number(data.muvo_score) : null,
        muvo_medal_level: (data.muvo_medal_level as MuvoMedalLevel) ?? 'none',
        medal_awarded_at: data.medal_awarded_at,
      };
    },
    enabled: !!placeId,
    staleTime: 1000 * 30, // Cache for 30 seconds (updates are real-time via triggers)
  });
}

/**
 * Category-based tap thresholds for showing the confidence score
 * Higher thresholds for categories with more expected activity
 */
export const CATEGORY_TAP_THRESHOLDS: Record<string, number> = {
  // High-traffic categories - need more taps for confidence
  'Restaurant': 150,
  'Food & Drink': 150,
  
  // Medium-traffic categories
  'RV Campground': 100,
  'Campground': 100,
  'Luxury RV Resort': 100,
  'State Park': 100,
  'County / Regional Park': 100,
  
  // Lower-traffic categories
  'National Park': 75,
  'National Monument': 75,
  'Boondocking': 75,
  'Overnight Parking': 75,
  'Rest Area / Travel Plaza': 75,
  
  // Niche categories - lowest threshold
  'Business Allowing Overnight': 50,
  'Fairgrounds / Event Grounds': 50,
  'Dog Park': 50,
  'RV Parking': 50,
  'RV Storage': 50,
};

/**
 * Get the minimum tap threshold for a place category
 */
export function getCategoryThreshold(category: string | undefined): number {
  if (!category) return 100; // Default threshold
  return CATEGORY_TAP_THRESHOLDS[category] ?? 100;
}

/**
 * Check if a place has enough taps to show the confidence score
 */
export function hasEnoughTapsForScore(
  qualTaps: number,
  category: string | undefined
): boolean {
  const threshold = getCategoryThreshold(category);
  return qualTaps >= threshold;
}

/**
 * Get formatted display text for when score threshold is not yet met
 * Shows "Building confidence…" as per spec
 */
export function getConfidenceBuildingText(
  qualTaps: number,
  category: string | undefined
): string {
  const threshold = getCategoryThreshold(category);
  const remaining = threshold - qualTaps;
  
  if (remaining > 0) {
    return 'Building confidence…';
  }
  return 'Building confidence…';
}

/**
 * @deprecated Use getConfidenceBuildingText instead
 * Get formatted display text for when medal is not yet earned
 */
export function getMedalUnlockText(qualTaps: number): string {
  return 'Building confidence…';
}
