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
 * Get formatted display text for when medal is not yet earned
 */
export function getMedalUnlockText(qualTaps: number): string {
  if (qualTaps < 100) {
    return `MUVO Score unlocks after ${100 - qualTaps} more community taps.`;
  }
  return 'MUVO Score unlocks after more community activity over time.';
}
