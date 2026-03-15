import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';
import { Tournament } from '../types';

export function useMyTournaments(playerId: string) {
  return useQuery<Tournament[]>({
    queryKey: ['my-tournaments', playerId],
    queryFn: async (): Promise<Tournament[]> => {
      const res = await apiFetch(`/tournaments/my-tournaments?playerId=${playerId}`);
      if (!res.ok) throw new Error('Failed to fetch my tournaments');
      return res.json();
    },
    enabled: !!playerId,
  });
}
