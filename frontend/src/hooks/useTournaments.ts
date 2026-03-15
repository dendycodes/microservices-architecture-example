import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';
import { PaginatedResponse } from '../types';

export function useTournaments(
  gameType?: string,
  tournamentType?: string,
  page: number = 1,
  limit: number = 10,
) {
  return useQuery<PaginatedResponse>({
    queryKey: ['tournaments', gameType, tournamentType, page, limit],
    queryFn: async (): Promise<PaginatedResponse> => {
      const params = new URLSearchParams();
      if (gameType) params.append('gameType', gameType);
      if (tournamentType) params.append('tournamentType', tournamentType);
      params.append('page', String(page));
      params.append('limit', String(limit));
      const res = await apiFetch(`/tournaments?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch tournaments');
      return res.json();
    },
  });
}
