import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function useInternalUsers() {
  return useQuery({
    queryKey: ['internal', 'users'],
    queryFn: () => api.getInternalUsers(),
  });
}

export function useInternalDMs() {
  return useQuery({
    queryKey: ['internal', 'dm'],
    queryFn: () => api.listInternalDMs(),
  });
}

export function useOpenInternalDM() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: string) => api.openInternalDM(targetUserId),
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'dm'] });
      toast.success('Conversa aberta');
      return conv;
    },
  });
}

export function useInternalDMMessages(conversationId: string) {
  return useQuery({
    queryKey: ['internal', 'dm', conversationId, 'messages'],
    queryFn: () => api.getInternalDMMessages(conversationId),
    enabled: !!conversationId,
  });
}

export function useSendInternalDMMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => api.sendInternalDMMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'dm', conversationId, 'messages'] });
    },
  });
}
