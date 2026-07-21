import { fetcher } from '@/api/fetcher';
import type { ApiError } from '@/api/types';
import { SWRConfig } from 'swr';

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: true,
        shouldRetryOnError: (error: ApiError) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status && error.status >= 400 && error.status < 500) {
            return false;
          }
          // Retry on 5xx errors (server errors) or network errors
          return true;
        },
        errorRetryCount: 2, // Reduce retry count for faster failure handling
        errorRetryInterval: 3000, // Reduce retry interval
        dedupingInterval: 5000, // Increase deduping to prevent duplicate requests
        focusThrottleInterval: 10000, // Increase throttle for mobile
        keepPreviousData: true // Add to prevent UI flicker
      }}
    >
      {children}
    </SWRConfig>
  );
}

