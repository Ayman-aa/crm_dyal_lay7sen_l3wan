import { QueryClient } from '@tanstack/react-query';

// Query keys for better organization and type safety
export const queryKeys = {
  // Auth
  currentUser: ['currentUser'],
  
  // Employer
  dashboardStats: ['dashboardStats'],
  managers: ['managers'],
  manager: (id: string) => ['managers', id],
  
  // Leads
  leads: (filters?: any) => ['leads', ...(filters ? [filters] : [])],
  lead: (id: string) => ['leads', id],
  managerLeads: ['managerLeads'],
};

// Create a client with optimal settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      retry: 1,
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnMount: true, // Refetch on component mount if stale
      refetchInterval: 1000 * 60 * 2, // Refresh data every 2 minutes in the background
    },
  },
});