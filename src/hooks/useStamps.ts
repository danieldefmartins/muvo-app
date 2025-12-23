import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type PlaceCategory = Database['public']['Enums']['place_category'];

export interface StampDefinition {
  id: string;
  category: string;
  label: string;
  polarity: 'positive' | 'improvement';
  sort_order: number;
  icon: string | null;
}

// Map place categories to review stamp categories
export function getReviewCategory(placeCategory: PlaceCategory): string {
  switch (placeCategory) {
    case 'National Park':
    case 'State Park':
    case 'County / Regional Park':
      return 'national_parks';
    case 'RV Campground':
    case 'Luxury RV Resort':
    case 'Overnight Parking':
    case 'Boondocking':
    case 'Business Allowing Overnight':
    case 'Rest Area / Travel Plaza':
    case 'Fairgrounds / Event Grounds':
      return 'campgrounds';
    default:
      return 'campgrounds';
  }
}

// Fetch stamps for a specific category
export function useStamps(placeCategory: PlaceCategory | undefined) {
  const reviewCategory = placeCategory ? getReviewCategory(placeCategory) : 'campgrounds';

  return useQuery({
    queryKey: ['stamps', reviewCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stamp_definitions')
        .select('*')
        .eq('category', reviewCategory)
        .order('polarity')
        .order('sort_order');

      if (error) throw error;
      
      const stamps = (data || []) as StampDefinition[];
      
      return {
        positive: stamps.filter(s => s.polarity === 'positive'),
        improvement: stamps.filter(s => s.polarity === 'improvement'),
        all: stamps,
      };
    },
    enabled: !!placeCategory,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

// Fallback stamps if no category-specific stamps exist
export const FALLBACK_STAMPS = {
  positive: [
    { id: 'fallback_quality', label: 'Quality', icon: 'Star' },
    { id: 'fallback_service', label: 'Service', icon: 'HandHeart' },
    { id: 'fallback_value', label: 'Value', icon: 'DollarSign' },
    { id: 'fallback_cleanliness', label: 'Cleanliness', icon: 'Sparkles' },
    { id: 'fallback_location', label: 'Location', icon: 'MapPin' },
  ],
  improvement: [
    { id: 'fallback_needs_work', label: 'Needs Work', icon: 'AlertTriangle' },
    { id: 'fallback_slow', label: 'Slow', icon: 'Clock' },
    { id: 'fallback_dirty', label: 'Not Clean', icon: 'Ban' },
    { id: 'fallback_expensive', label: 'Expensive', icon: 'DollarSign' },
    { id: 'fallback_poor_service', label: 'Poor Service', icon: 'Frown' },
  ],
};
