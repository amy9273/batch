'use client';

import { useState, useEffect, useCallback } from 'react';
import { BatchDetailData } from '@/types/airtable';

export type TaskFilterMode = 'all' | 'in_progress' | 'ready' | 'locked' | 'done';

export function useBatchDetails(batchId: string) {
  const [data, setData] = useState<BatchDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStartingBatch, setIsStartingBatch] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<TaskFilterMode>('all');

  const fetchBatch = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) setIsRefreshing(true);
        else setIsLoading(true);
        setErrorMessage(null);

        const res = await fetch(`/api/batches/${batchId}`);
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Could not load batch details.');
        }

        setData(result.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Could not connect. Please try again.';
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [batchId]
  );

  useEffect(() => {
    fetchBatch();
  }, [fetchBatch]);

  const startBatch = async () => {
    if (!data || data.batch.hasStarted || isStartingBatch) return;

    try {
      setIsStartingBatch(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await fetch(`/api/batches/${batchId}/start`, { method: 'POST' });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Could not start batch.');
      }

      setSuccessMessage('Batch started successfully!');
      await fetchBatch(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not start batch.';
      setErrorMessage(msg);
    } finally {
      setIsStartingBatch(false);
    }
  };

  const completeTask = async (taskId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await fetch(`/api/tasks/${taskId}/complete`, { method: 'POST' });
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Could not save task.');
    }

    setSuccessMessage('Saved! Task marked as Done.');
    await fetchBatch(true);
  };

  const tasks = data?.tasks || [];

  // Exact classification matching Airtable Task State values
  const doneCount = tasks.filter((t) => t.isDone).length;
  const inProgressCount = tasks.filter((t) => !t.isDone && t.taskState === 'IN PROGRESS').length;
  const readyCount = tasks.filter((t) => !t.isDone && t.taskState === 'READY').length;
  const lockedCount = tasks.filter((t) => t.isLocked).length;

  const filteredTasks = tasks.filter((t) => {
    if (filterMode === 'in_progress') return !t.isDone && t.taskState === 'IN PROGRESS';
    if (filterMode === 'ready') return !t.isDone && t.taskState === 'READY';
    if (filterMode === 'locked') return t.isLocked;
    if (filterMode === 'done') return t.isDone;
    return true;
  });

  return {
    batch: data?.batch,
    tasks,
    filteredTasks,
    doneCount,
    inProgressCount,
    readyCount,
    lockedCount,
    isLoading,
    isRefreshing,
    isStartingBatch,
    errorMessage,
    successMessage,
    filterMode,
    setFilterMode,
    startBatch,
    completeTask,
    clearErrorMessage: () => setErrorMessage(null),
    clearSuccessMessage: () => setSuccessMessage(null),
    refresh: () => fetchBatch(true),
    retry: () => fetchBatch(false),
  };
}
