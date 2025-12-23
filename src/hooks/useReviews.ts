import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type ReviewDimension = 
  | 'quality' 
  | 'service' 
  | 'value' 
  | 'cleanliness' 
  | 'location' 
  | 'comfort' 
  | 'reliability' 
  | 'speed' 
  | 'restrictions';

export type SignalPolarity = 'positive' | 'improvement';

export interface ReviewSignal {
  dimension: ReviewDimension;
  polarity: SignalPolarity;
  level: number;
}

export interface Review {
  id: string;
  place_id: string;
  user_id: string;
  note_public: string | null;
  note_private: string | null;
  created_at: string;
  updated_at: string;
  signals: ReviewSignal[];
  user_display_name?: string;
  trusted_contributor?: boolean;
}

export interface DimensionSummary {
  dimension: ReviewDimension;
  count: number;
  avgLevel: number;
  totalScore: number;
}

export const REVIEW_DIMENSIONS: { id: ReviewDimension; label: string; icon: string }[] = [
  { id: 'quality', label: 'Quality', icon: 'Star' },
  { id: 'service', label: 'Service', icon: 'HandHeart' },
  { id: 'value', label: 'Value', icon: 'DollarSign' },
  { id: 'cleanliness', label: 'Cleanliness', icon: 'Sparkles' },
  { id: 'location', label: 'Location', icon: 'MapPin' },
  { id: 'comfort', label: 'Comfort', icon: 'Sofa' },
  { id: 'reliability', label: 'Reliability', icon: 'Shield' },
  { id: 'speed', label: 'Speed', icon: 'Zap' },
  { id: 'restrictions', label: 'Restrictions', icon: 'Ban' },
];

export function useReviews(placeId: string) {
  return useQuery({
    queryKey: ['reviews', placeId],
    queryFn: async () => {
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (display_name, trusted_contributor)
        `)
        .eq('place_id', placeId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      const { data: signals, error: signalsError } = await supabase
        .from('review_signals')
        .select('*')
        .eq('place_id', placeId);

      if (signalsError) throw signalsError;

      const reviewsWithSignals: Review[] = (reviews || []).map((review: any) => ({
        id: review.id,
        place_id: review.place_id,
        user_id: review.user_id,
        note_public: review.note_public,
        note_private: review.note_private,
        created_at: review.created_at,
        updated_at: review.updated_at,
        user_display_name: review.profiles?.display_name,
        trusted_contributor: review.profiles?.trusted_contributor,
        signals: (signals || [])
          .filter((s: any) => s.review_id === review.id)
          .map((s: any) => ({
            dimension: s.dimension as ReviewDimension,
            polarity: s.polarity as SignalPolarity,
            level: s.level,
          })),
      }));

      return reviewsWithSignals;
    },
    enabled: !!placeId,
  });
}

export function useMyReview(placeId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-review', placeId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .eq('place_id', placeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (reviewError) throw reviewError;
      if (!review) return null;

      const { data: signals, error: signalsError } = await supabase
        .from('review_signals')
        .select('*')
        .eq('review_id', review.id);

      if (signalsError) throw signalsError;

      return {
        ...review,
        signals: (signals || []).map((s: any) => ({
          dimension: s.dimension as ReviewDimension,
          polarity: s.polarity as SignalPolarity,
          level: s.level,
        })),
      };
    },
    enabled: !!placeId && !!user,
  });
}

export function usePlaceSignalSummary(placeId: string) {
  return useQuery({
    queryKey: ['place-signals', placeId],
    queryFn: async () => {
      const { data: signals, error } = await supabase
        .from('review_signals')
        .select('*')
        .eq('place_id', placeId);

      if (error) throw error;

      const positiveMap = new Map<ReviewDimension, { count: number; totalLevel: number }>();
      const improvementMap = new Map<ReviewDimension, { count: number; totalLevel: number }>();

      (signals || []).forEach((s: any) => {
        const map = s.polarity === 'positive' ? positiveMap : improvementMap;
        const current = map.get(s.dimension) || { count: 0, totalLevel: 0 };
        map.set(s.dimension, {
          count: current.count + 1,
          totalLevel: current.totalLevel + s.level,
        });
      });

      const toSummary = (map: Map<ReviewDimension, { count: number; totalLevel: number }>): DimensionSummary[] => {
        return Array.from(map.entries())
          .map(([dimension, data]) => ({
            dimension,
            count: data.count,
            avgLevel: data.totalLevel / data.count,
            totalScore: data.count * data.totalLevel,
          }))
          .sort((a, b) => b.totalScore - a.totalScore);
      };

      return {
        knownFor: toSummary(positiveMap).slice(0, 3),
        commonIssues: toSummary(improvementMap).slice(0, 2),
      };
    },
    enabled: !!placeId,
  });
}

interface CreateReviewData {
  placeId: string;
  notePublic: string;
  notePrivate: string;
  signals: ReviewSignal[];
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ placeId, notePublic, notePrivate, signals }: CreateReviewData) => {
      if (!user) throw new Error('Must be logged in');

      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          place_id: placeId,
          user_id: user.id,
          note_public: notePublic || null,
          note_private: notePrivate || null,
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      if (signals.length > 0) {
        const signalsToInsert = signals.map((s) => ({
          review_id: review.id,
          place_id: placeId,
          user_id: user.id,
          dimension: s.dimension,
          polarity: s.polarity,
          level: s.level,
        }));

        const { error: signalsError } = await supabase
          .from('review_signals')
          .insert(signalsToInsert);

        if (signalsError) throw signalsError;
      }

      return review;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.placeId] });
      queryClient.invalidateQueries({ queryKey: ['my-review', variables.placeId] });
      queryClient.invalidateQueries({ queryKey: ['place-signals', variables.placeId] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ reviewId, placeId, notePublic, notePrivate, signals }: CreateReviewData & { reviewId: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { error: reviewError } = await supabase
        .from('reviews')
        .update({
          note_public: notePublic || null,
          note_private: notePrivate || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (reviewError) throw reviewError;

      // Delete existing signals and insert new ones
      const { error: deleteError } = await supabase
        .from('review_signals')
        .delete()
        .eq('review_id', reviewId);

      if (deleteError) throw deleteError;

      if (signals.length > 0) {
        const signalsToInsert = signals.map((s) => ({
          review_id: reviewId,
          place_id: placeId,
          user_id: user.id,
          dimension: s.dimension,
          polarity: s.polarity,
          level: s.level,
        }));

        const { error: signalsError } = await supabase
          .from('review_signals')
          .insert(signalsToInsert);

        if (signalsError) throw signalsError;
      }

      return { reviewId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.placeId] });
      queryClient.invalidateQueries({ queryKey: ['my-review', variables.placeId] });
      queryClient.invalidateQueries({ queryKey: ['place-signals', variables.placeId] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, placeId }: { reviewId: string; placeId: string }) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      return { reviewId, placeId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.placeId] });
      queryClient.invalidateQueries({ queryKey: ['my-review', variables.placeId] });
      queryClient.invalidateQueries({ queryKey: ['place-signals', variables.placeId] });
    },
  });
}
