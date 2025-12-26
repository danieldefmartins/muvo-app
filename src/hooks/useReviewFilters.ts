import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReviewFiltersState {
  positiveStamps: string[];  // What people liked - include places with these
  neutralStamps: string[];   // Place feels like - include places with these
  negativeStamps: string[];  // Avoid places with - exclude places with these
}

export const DEFAULT_REVIEW_FILTERS: ReviewFiltersState = {
  positiveStamps: [],
  neutralStamps: [],
  negativeStamps: [],
};

export interface PlaceStampData {
  placeId: string;
  positiveStamps: Set<string>;
  neutralStamps: Set<string>;
  negativeStamps: Set<string>;
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
            positiveStamps: new Set(),
            neutralStamps: new Set(),
            negativeStamps: new Set(),
          };
          placeStampMap.set(row.place_id, placeData);
        }

        if (row.polarity === 'positive') {
          placeData.positiveStamps.add(row.stamp_id);
        } else if (row.polarity === 'neutral') {
          placeData.neutralStamps.add(row.stamp_id);
        } else if (row.polarity === 'improvement') {
          placeData.negativeStamps.add(row.stamp_id);
        }
      });

      return placeStampMap;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// Filter places by review stamps
export function filterPlacesByReviews(
  placeIds: string[],
  stampData: Map<string, PlaceStampData> | undefined,
  filters: ReviewFiltersState
): string[] {
  if (!stampData) return placeIds;
  
  const hasActiveFilters = 
    filters.positiveStamps.length > 0 || 
    filters.neutralStamps.length > 0 || 
    filters.negativeStamps.length > 0;

  if (!hasActiveFilters) return placeIds;

  return placeIds.filter((placeId) => {
    const data = stampData.get(placeId);
    
    // If no stamp data for this place and filters are active, exclude it
    // unless only negative filters are set (we'd keep places without negatives)
    if (!data) {
      // If only negative filters active, include places without data
      return filters.positiveStamps.length === 0 && filters.neutralStamps.length === 0;
    }

    // Check positive filters (must have at least ONE of the selected)
    if (filters.positiveStamps.length > 0) {
      const hasAnyPositive = filters.positiveStamps.some((stamp) => 
        data.positiveStamps.has(stamp)
      );
      if (!hasAnyPositive) return false;
    }

    // Check neutral filters (must have at least ONE of the selected)
    if (filters.neutralStamps.length > 0) {
      const hasAnyNeutral = filters.neutralStamps.some((stamp) => 
        data.neutralStamps.has(stamp)
      );
      if (!hasAnyNeutral) return false;
    }

    // Check negative filters (must NOT have ANY of the selected)
    if (filters.negativeStamps.length > 0) {
      const hasAnyNegative = filters.negativeStamps.some((stamp) => 
        data.negativeStamps.has(stamp)
      );
      if (hasAnyNegative) return false;
    }

    return true;
  });
}

// Count active review filters
export function countActiveReviewFilters(filters: ReviewFiltersState): number {
  return (
    filters.positiveStamps.length +
    filters.neutralStamps.length +
    filters.negativeStamps.length
  );
}
