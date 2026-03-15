import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';
import { JoinTournamentPayload } from '../types';

export function useJoinTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: JoinTournamentPayload): Promise<unknown> => {
      const res = await apiFetch('/tournaments/join', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.message || 'Failed to join tournament');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['my-tournaments'] });
    },
  });
}
