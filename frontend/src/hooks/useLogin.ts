import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { setSelectedPlayer } from '../store/uiSlice';
import { apiFetch } from '../utils/api';
import { LoginResponse } from '../types';

export function useLogin() {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (playerId: string): Promise<LoginResponse> => {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ playerId }),
      });
      const data: LoginResponse = await res.json();
      if (!res.ok || !data.access_token) {
        throw new Error('Login failed');
      }
      return data;
    },
    onSuccess: (data: LoginResponse) => {
      dispatch(setCredentials({ token: data.access_token, user: data.user }));
      dispatch(setSelectedPlayer(data.user.id));
    },
  });
}
