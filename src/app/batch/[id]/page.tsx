'use client';

import React, { useEffect, useState, useCallback, use, Suspense } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { TaskRow } from '@/components/TaskRow';
import { LoadingSkeleton, ErrorMessage } from '@/components/FeedbackStates';
import { StatusBadge } from '@/components/StatusBadge';
import { BatchDetailData } from '@/types/airtable';
import {
  ArrowLeft,
  Check,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Play,
} from 'lucide-react';

interface BatchPageProps {
  params: Promise<{ id: string }>;
}

function BatchDetailContent({ params }: BatchPageProps) {
  const resolvedParams = use(params);
  const batchId = resolvedParams.id;

  const [data, setData] = useState<BatchDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStartingBatch, setIsStartingBatch] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'ready' | 'locked' | 'done'>('all');

  const fetchBatch = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) setIsRefreshing(true);
        else setIsLoading(true);
        setErrorMessage(null);

        const res = await fetch(`/api/batches/${batchId}`);
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Failed to fetch batch details.');
        }

        setData(result.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to connect to Airtable';
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

  // Handle Start Batch
  const handleStartBatch = async () => {
    if (!data || data.batch.hasStarted || isStartingBatch) return;

    try {
      setIsStartingBatch(true);
      setErrorMessage(null);
      setSaveSuccessMessage(null);

      const res = await fetch(`/api/batches/${batchId}/start`, {
        method: 'POST',
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to start batch.');
      }

      setSaveSuccessMessage('Batch started and saved to Airtable.');
      // Re-fetch batch to ensure fresh state from Airtable
      await fetchBatch(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error starting batch.';
      setErrorMessage(msg);
    } finally {
      setIsStartingBatch(false);
    }
  };

  // Handle Complete Task
  const handleTaskCompleted = async (taskId: string) => {
    setErrorMessage(null);
    setSaveSuccessMessage(null);

    const res = await fetch(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
    });
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to complete task.');
    }

    setSaveSuccessMessage('Task marked as done and saved to Airtable.');
    // Re-fetch batch to get recalculated Task States and Done counts from Airtable
    await fetchBatch(true);
  };

  const batch = data?.batch;
  const tasks = data?.tasks || [];

  const filteredTasks = tasks.filter((t) => {
    if (filterMode === 'ready') return !t.isLocked && !t.isDone;
    if (filterMode === 'locked') return t.isLocked;
    if (filterMode === 'done') return t.isDone;
    return true;
  });

  const percent =
    batch && batch.totalTasks > 0
      ? Math.round((batch.completedTasks / batch.totalTasks) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col">
      <Header title="Sole Surgeon" showBack />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:px-6">
        {/* Navigation & Refresh Bar */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to batches
          </Link>

          <button
            onClick={() => fetchBatch(true)}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh batch from Airtable"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Global Save Notifications */}
        {saveSuccessMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between gap-2 text-xs font-medium text-emerald-900">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2.5]" />
              <span>{saveSuccessMessage}</span>
            </div>
            <button
              onClick={() => setSaveSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold px-1"
            >
              ×
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg flex items-center justify-between gap-2 text-xs font-medium text-red-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-700 hover:text-red-950 font-bold px-1"
            >
              ×
            </button>
          </div>
        )}

        {isLoading ? (
          <LoadingSkeleton count={4} />
        ) : !data || !batch ? (
          <ErrorMessage
            title="Batch not found"
            message="Could not find this batch record in Airtable."
            onRetry={() => fetchBatch(false)}
          />
        ) : (
          <div className="space-y-4">
            {/* Batch Overview Header Card */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-slate-500 uppercase">
                      Batch
                    </span>
                    <StatusBadge
                      type="batch-status"
                      value={
                        batch.isCompleted
                          ? 'Completed'
                          : batch.hasStarted
                          ? 'In Progress'
                          : 'Not Started'
                      }
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {batch.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Worker: <span className="font-semibold text-slate-800">{batch.worker}</span> • Target: <span className="font-semibold text-slate-800">{batch.targetDate}</span>
                  </p>
                </div>

                {/* Start Batch CTA Area */}
                <div className="sm:self-center shrink-0">
                  {batch.hasStarted ? (
                    <div className="flex flex-col sm:items-end">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        <Check className="w-3.5 h-3.5 text-teal-700 stroke-[2.5]" />
                        <span>Started at {new Date(batch.startedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1">
                        Batch is active
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={handleStartBatch}
                      disabled={isStartingBatch}
                      className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isStartingBatch ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Starting batch...
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          Start batch
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Summary */}
              <div className="pt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    Completed: <strong className="text-slate-900 font-semibold">{batch.completedTasks}</strong> of <strong className="text-slate-900 font-semibold">{batch.totalTasks}</strong> tasks
                  </span>
                  <span className="font-bold text-slate-900">{percent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      batch.isCompleted ? 'bg-emerald-600' : 'bg-teal-600'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Task Filters & Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Tasks
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {tasks.length}
                </span>
              </div>

              {/* Quick Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1.5 rounded font-medium transition cursor-pointer shrink-0 ${
                    filterMode === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setFilterMode('ready')}
                  className={`px-3 py-1.5 rounded font-medium transition cursor-pointer shrink-0 ${
                    filterMode === 'ready'
                      ? 'bg-teal-700 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  Ready ({tasks.filter((t) => !t.isLocked && !t.isDone).length})
                </button>
                <button
                  onClick={() => setFilterMode('locked')}
                  className={`px-3 py-1.5 rounded font-medium transition cursor-pointer shrink-0 ${
                    filterMode === 'locked'
                      ? 'bg-amber-700 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  Locked ({tasks.filter((t) => t.isLocked).length})
                </button>
                <button
                  onClick={() => setFilterMode('done')}
                  className={`px-3 py-1.5 rounded font-medium transition cursor-pointer shrink-0 ${
                    filterMode === 'done'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  Done ({tasks.filter((t) => t.isDone).length})
                </button>
              </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
                <p className="text-xs text-slate-500">
                  No tasks match the filter &quot;{filterMode}&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onTaskCompleted={handleTaskCompleted}
                    isBatchStarted={batch.hasStarted}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BatchDetailPage({ params }: BatchPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100/60 flex flex-col">
          <Header title="Sole Surgeon" showBack />
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:px-6">
            <LoadingSkeleton count={4} />
          </main>
        </div>
      }
    >
      <BatchDetailContent params={params} />
    </Suspense>
  );
}
