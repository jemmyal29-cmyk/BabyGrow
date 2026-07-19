/**
 * Shared React Query client — usable outside React (e.g. MeasurementSyncService)
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default queryClient;
