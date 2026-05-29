import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY } from '@/lib/constants';
import { validateToken } from '@/lib/github';
import { clearToken, getToken, setToken } from '@/lib/storage';
import type { GitHubUser } from '@/types';

export function useAuth() {
  const qc = useQueryClient();

  const tokenQuery = useQuery({
    queryKey: QUERY.token,
    queryFn: getToken,
  });

  const userQuery = useQuery({
    queryKey: QUERY.user,
    queryFn: async () => {
      const token = await getToken();
      if (!token) return null;
      return validateToken(token);
    },
    enabled: !!tokenQuery.data,
  });

  const connect = useMutation({
    mutationFn: async (token: string) => {
      const user = await validateToken(token);
      if (!user) throw new Error('Invalid token — needs repo scope');
      await setToken(token);
      return user;
    },
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: QUERY.token });
      qc.setQueryData(QUERY.user, user);
      qc.invalidateQueries({ queryKey: QUERY.drawings });
    },
  });

  const disconnect = useMutation({
    mutationFn: clearToken,
    onSuccess: () => {
      qc.setQueryData(QUERY.token, null);
      qc.setQueryData(QUERY.user, null);
      qc.setQueryData(QUERY.drawings, []);
    },
  });

  return {
    token: tokenQuery.data,
    user: userQuery.data as GitHubUser | null | undefined,
    isLoading: tokenQuery.isLoading || userQuery.isLoading,
    isConnected: !!tokenQuery.data && !!userQuery.data,
    connect,
    disconnect,
  };
}
