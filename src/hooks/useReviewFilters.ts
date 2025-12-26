import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReviewFiltersState {
  positiveStamps: string[];  // What people liked - boost places with these
  neutralStamps: string[];   // Place feels like - boost places with these
  negativeStamps: string[];  // Avoid places with - penalize places with these
}

export const DEFAULT_REVIEW_FILTERS: ReviewFiltersState = {
  positiveStamps: [],
  neutralStamps: [],
  negativeStamps: [],
};

export interface PlaceStampData {
  placeId: string;
  positiveStamps: Map<string, number>; // stampId -> vote count
  neutralStamps: Map<string, number>;
  negativeStamps: Map<string, number>;
}

// Fetch all place stamp aggregates for filtering
export function usePlaceStampAggregatesAll() {
  return useQuery({
    queryKey: ['all-place-stamp-aggregates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('place_stamp_aggregates')
        .select('place_id, stamp_id, polarity, total_votes')
        .gte('total_votes', 2); // Noise filter

      if (error) throw error;

      // Group by place_id
      const placeStampMap = new Map<string, PlaceStampData>();

      (data || []).forEach((row) => {
        if (!row.stamp_id) return;
        
        let placeData = placeStampMap.get(row.place_id);
        if (!placeData) {
          placeData = {
            placeId: row.place_id,
            positiveStamps: new Map(),
            neutralStamps: new Map(),
            negativeStamps: new Map(),
          };
          placeStampMap.set(row.place_id, placeData);
        }

        if (row.polarity === 'positive') {
          placeData.positiveStamps.set(row.stamp_id, row.total_votes);
        } else if (row.polarity === 'neutral') {
          placeData.neutralStamps.set(row.stamp_id, row.total_votes);
        } else if (row.polarity === 'improvement') {
          placeData.negativeStamps.set(row.stamp_id, row.total_votes);
        }
      });

      return placeStampMap;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// Score places by how well they match filters (higher = better match)
export interface PlaceFilterScore {
  placeId: string;
  score: number;
  matchedPositive: { stampId: string; votes: number }[];
  matchedNeutral: { stampId: string; votes: number }[];
  matchedNegative: { stampId: string; votes: number }[];
}

export function scorePlacesByReviews(
  placeIds: string[],
  stampData: Map<string, PlaceStampData> | undefined,
  filters: ReviewFiltersState
): Map<string, PlaceFilterScore> {
  const scores = new Map<string, PlaceFilterScore>();
  
  placeIds.forEach((placeId) => {
    const data = stampData?.get(placeId);
    let score = 0;
    const matchedPositive: { stampId: string; votes: number }[] = [];
    const matchedNeutral: { stampId: string; votes: number }[] = [];
    const matchedNegative: { stampId: string; votes: number }[] = [];

    // Positive stamps boost score
    filters.positiveStamps.forEach((stampId) => {
      const votes = data?.positiveStamps.get(stampId);
      if (votes) {
        score += votes * 2; // Weight positive matches heavily
        matchedPositive.push({ stampId, votes });
      }
    });

    // Neutral stamps boost score (lighter weight)
    filters.neutralStamps.forEach((stampId) => {
      const votes = data?.neutralStamps.get(stampId);
      if (votes) {
        score += votes; // Neutral has moderate weight
        matchedNeutral.push({ stampId, votes });
      }
    });

    // Negative stamps PENALIZE score
    filters.negativeStamps.forEach((stampId) => {
      const votes = data?.negativeStamps.get(stampId);
      if (votes) {
        score -= votes * 3; // Penalize negative matches heavily
        matchedNegative.push({ stampId, votes });
      }
    });

    scores.set(placeId, {
      placeId,
      score,
      matchedPositive,
      matchedNeutral,
      matchedNegative,
    });
  });

  return scores;
}

// Re-rank places by filter scores (instead of hiding them)
export function rankPlacesByReviews(
  placeIds: string[],
  stampData: Map<string, PlaceStampData> | undefined,
  filters: ReviewFiltersState
): { rankedIds: string[]; scores: Map<string, PlaceFilterScore> } {
  const hasActiveFilters = 
    filters.positiveStamps.length > 0 || 
    filters.neutralStamps.length > 0 || 
    filters.negativeStamps.length > 0;

  const scores = scorePlacesByReviews(placeIds, stampData, filters);

  if (!hasActiveFilters) {
    return { rankedIds: placeIds, scores };
  }

  // Sort by score descending (places with better filter matches first)
  const rankedIds = [...placeIds].sort((a, b) => {
    const scoreA = scores.get(a)?.score || 0;
    const scoreB = scores.get(b)?.score || 0;
    return scoreB - scoreA;
  });

  return { rankedIds, scores };
}

// Legacy filter function (still used for explicit exclusion if needed)
export function filterPlacesByReviews(
  placeIds: string[],
  stampData: Map<string, PlaceStampData> | undefined,
  filters: ReviewFiltersState
): string[] {
  // Now we just return all places - no hiding, only re-ranking
  return placeIds;
}

// Count active review filters
export function countActiveReviewFilters(filters: ReviewFiltersState): number {
  return (
    filters.positiveStamps.length +
    filters.neutralStamps.length +
    filters.negativeStamps.length
  );
}

// Get matching signals for a place (for filter transparency)
export function getMatchingSignals(
  placeId: string,
  stampData: Map<string, PlaceStampData> | undefined,
  filters: ReviewFiltersState
): { positive: { id: string; votes: number }[]; neutral: { id: string; votes: number }[]; negative: { id: string; votes: number }[] } {
  const data = stampData?.get(placeId);
  
  const positive = filters.positiveStamps
    .map(id => ({ id, votes: data?.positiveStamps.get(id) || 0 }))
    .filter(s => s.votes > 0);
  
  const neutral = filters.neutralStamps
    .map(id => ({ id, votes: data?.neutralStamps.get(id) || 0 }))
    .filter(s => s.votes > 0);
  
  const negative = filters.negativeStamps
    .map(id => ({ id, votes: data?.negativeStamps.get(id) || 0 }))
    .filter(s => s.votes > 0);

  return { positive, neutral, negative };
}
