import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMapboxToken() {
  return useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required to access maps');
      }
      
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      
      if (error) {
        throw new Error('Failed to fetch Mapbox token');
      }
      
      if (!data?.token) {
        throw new Error('Mapbox token not configured');
      }
      
      return data.token as string;
    },
    staleTime: Infinity, // Token doesn't change
    retry: 1,
  });
}
