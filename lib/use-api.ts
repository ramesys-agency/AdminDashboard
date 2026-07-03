"use client";

import { useEffect, useState } from "react";
import useSWR, { SWRConfiguration } from "swr";
import { toast } from "sonner";
import { apiClient, PaginatedResponse } from "@/lib/api-client";

const fetcher = <T,>(url: string) => apiClient.get<T>(url);

const defaults: SWRConfiguration = {
  keepPreviousData: true,
  revalidateOnFocus: false,
  dedupingInterval: 5000,
};

/**
 * Cached GET request. Pass `null` as the key to skip fetching.
 * Data is cached by URL, so revisiting a page renders instantly
 * from cache while revalidating in the background.
 */
export function useApi<T>(key: string | null, config?: SWRConfiguration<T>) {
  return useSWR<T>(key, fetcher, { ...defaults, ...config } as SWRConfiguration<T>);
}

/**
 * Paginated list with search + filters, backed by the SWR cache.
 * Pass `null` as the endpoint to skip fetching (e.g. wrong business).
 * `loading` is only true when there is nothing cached to show;
 * `refreshing` is true while new data loads behind existing rows.
 */
export function usePaginatedList<T>(
  endpoint: string | null,
  options?: { limit?: number; errorMessage?: string }
) {
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState("");
  const [filters, setFiltersState] = useState<Record<string, string>>({});

  // Endpoint change (e.g. business switch) starts a fresh list
  useEffect(() => {
    setPage(1);
    setFiltersState({});
  }, [endpoint]);

  const setSearch = (val: string) => {
    setSearchState(val);
    setPage(1);
  };

  const setFilter = (name: string, value: string) => {
    setFiltersState((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const query = new URLSearchParams({
    page: page.toString(),
    limit: (options?.limit ?? 10).toString(),
    ...(search && { q: search }),
    ...Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v && v !== "all")
    ),
  });

  const { data, error, isLoading, mutate } = useApi<PaginatedResponse<T>>(
    endpoint ? `${endpoint}?${query}` : null,
    {
      onError: () => {
        if (options?.errorMessage) toast.error(options.errorMessage);
      },
    }
  );

  return {
    data: data?.data ?? [],
    metadata: data?.metadata,
    loading: isLoading && !data,
    refreshing: isLoading && !!data,
    error,
    mutate,
    page,
    setPage,
    search,
    setSearch,
    filters,
    setFilter,
  };
}
