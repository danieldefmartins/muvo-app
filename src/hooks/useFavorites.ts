import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useFavorites() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('favorites')
        .select('place_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map((f) => f.place_id);
    },
    enabled: !!user,
  });
}

export function useIsFavorite(placeId: string) {
  const { data: favorites = [] } = useFavorites();
  return favorites.includes(placeId);
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ placeId, isFavorite }: { placeId: string; isFavorite: boolean }) => {
      if (!user) throw new Error('Must be logged in');

      if (isFavorite) {
        // Remove favorite
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('place_id', placeId);

        if (error) throw error;
      } else {
        // Add favorite
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, place_id: placeId });

        if (error) throw error;
      }
    },
    onMutate: async ({ placeId, isFavorite }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });
      const previousFavorites = queryClient.getQueryData<string[]>(['favorites', user?.id]) || [];

      queryClient.setQueryData<string[]>(['favorites', user?.id], (old = []) => {
        if (isFavorite) {
          return old.filter((id) => id !== placeId);
        } else {
          return [...old, placeId];
        }
      });

      return { previousFavorites };
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites', user?.id], context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });
}
