import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';
import { TournamentDetails } from '../types';

export function useTournamentDetails(id: string | null) {
  return useQuery<TournamentDetails>({
    queryKey: ['tournament-details', id],
    queryFn: async (): Promise<TournamentDetails> => {
      const res = await apiFetch(`/tournaments/${id}`);
      if (!res.ok) throw new Error('Failed to fetch tournament details');
      return res.json();
    },
    enabled: !!id,
  });
}
