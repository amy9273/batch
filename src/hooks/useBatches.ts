'use client';

import { useState, useEffect, useCallback } from 'react';
import { BatchSummary } from '@/types/airtable';

export function useBatches() {
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const res = await fetch('/api/batches');
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not load batches.');
      }

      setBatches(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not connect. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  return {
    batches,
    isLoading,
    isRefreshing,
    error,
    refresh: () => fetchBatches(true),
    retry: () => fetchBatches(false),
  };
}
