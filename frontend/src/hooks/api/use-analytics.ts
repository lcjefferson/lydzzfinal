import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDashboardMetrics() {
    return useQuery({
        queryKey: ['dashboard', 'metrics'],
        queryFn: () => api.getDashboardMetrics(),
        staleTime: 30000, // 30 seconds
    });
}

export function useConversationStats() {
    return useQuery({
        queryKey: ['analytics', 'conversations'],
        queryFn: () => api.getConversationStats(),
        staleTime: 60000, // 1 minute
    });
}

export function useLeadStats() {
    return useQuery({
        queryKey: ['analytics', 'leads'],
        queryFn: () => api.getLeadStats(),
        staleTime: 60000, // 1 minute
    });
}

export function useContractsReport() {
    return useQuery({
        queryKey: ['analytics', 'reports', 'contracts'],
        queryFn: () => api.getContractsReport(),
        staleTime: 60000,
    });
}

export function useConsultantReport() {
    return useQuery({
        queryKey: ['analytics', 'reports', 'consultants'],
        queryFn: () => api.getConsultantReport(),
        staleTime: 60000,
    });
}
