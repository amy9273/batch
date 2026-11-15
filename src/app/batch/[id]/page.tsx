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
  Clock,
  Sparkles,
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
        throw new Error(result.error || 'Could not start batch.');
      }

      setSaveSuccessMessage('Batch started successfully!');
      // Re-fetch batch to ensure fresh state from Airtable
      await fetchBatch(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not start batch.';
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
      throw new Error(result.error || 'Could not save task.');
    }

    setSaveSuccessMessage('Saved! Task marked as Done.');
    // Re-fetch batch to get recalculated Task States and Done counts from Airtable
    await fetchBatch(true);
  };

  const batch = data?.batch;
  const tasks = data?.tasks || [];

  const readyCount = tasks.filter((t) => !t.isLocked && !t.isDone).length;
  const lockedCount = tasks.filter((t) => t.isLocked).length;
  const doneCount = tasks.filter((t) => t.isDone).length;

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
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 sm:pb-8">
      <Header title="Sole Surgeon" showBack />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:px-6">
        {/* Navigation & Refresh Bar */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to batches
          </Link>

          <button
            onClick={() => fetchBatch(true)}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh batch"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Save Notifications */}
        {saveSuccessMessage && (
          <div className="mb-3.5 p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between gap-2 text-xs font-bold text-emerald-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0 stroke-[3]" />
              <span>{saveSuccessMessage}</span>
            </div>
            <button
              onClick={() => setSaveSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 font-black px-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-3.5 p-3 bg-red-50 border border-red-300 rounded-lg flex items-center justify-between gap-2 text-xs font-bold text-red-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-700 hover:text-red-950 font-black px-1 cursor-pointer"
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
            message="Could not find this batch record."
            onRetry={() => fetchBatch(false)}
          />
        ) : (
          <div className="space-y-4">
            {/* Batch Details Card */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-300 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 pb-3.5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Batch Details
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
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                    {batch.name}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Worker: <span className="font-bold text-slate-900">{batch.worker}</span> • Date: <span className="font-bold text-slate-900">{batch.targetDate}</span>
                  </p>
                </div>

                {/* Desktop Action Area */}
                <div className="hidden sm:block sm:self-center shrink-0">
                  {batch.hasStarted ? (
                    <div className="flex flex-col items-end">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-50 text-teal-900 border border-teal-300">
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
                      className="min-h-[46px] px-5 py-2.5 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isStartingBatch ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
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
              <div className="pt-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-600">
                    Tasks: <strong className="text-slate-900 font-bold">{batch.completedTasks}</strong> of <strong className="text-slate-900 font-bold">{batch.totalTasks}</strong> done
                  </span>
                  <span className="font-mono font-bold text-slate-900">{percent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      batch.isCompleted ? 'bg-emerald-600' : 'bg-teal-600'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Task Filter Buttons */}
            <div className="sticky top-[53px] z-30 bg-slate-50/95 backdrop-blur-md py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-y sm:border-y-0 border-slate-200/80">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tasks ({tasks.length})
                </h3>
                {readyCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    {readyCount} ready now
                  </span>
                )}
              </div>

              {/* Filter Tabs in Simple English */}
              <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`py-2 px-1 text-center rounded-lg transition-all cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setFilterMode('ready')}
                  className={`py-2 px-1 text-center rounded-lg transition-all cursor-pointer ${
                    filterMode === 'ready'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-teal-900 hover:bg-teal-50 border border-teal-300'
                  }`}
                >
                  Ready ({readyCount})
                </button>
                <button
                  onClick={() => setFilterMode('locked')}
                  className={`py-2 px-1 text-center rounded-lg transition-all cursor-pointer ${
                    filterMode === 'locked'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-300'
                  }`}
                >
                  Locked ({lockedCount})
                </button>
                <button
                  onClick={() => setFilterMode('done')}
                  className={`py-2 px-1 text-center rounded-lg transition-all cursor-pointer ${
                    filterMode === 'done'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-emerald-900 hover:bg-emerald-50 border border-emerald-300'
                  }`}
                >
                  Done ({doneCount})
                </button>
              </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-slate-300 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  No tasks under &quot;{filterMode}&quot;.
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

      {/* Sticky Mobile Bottom Bar (Thumb Zone) */}
      {data && batch && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-300 p-3 sm:hidden shadow-lg pb-safe">
          {batch.hasStarted ? (
            <div className="flex items-center justify-between text-xs font-bold text-teal-900 bg-teal-50 px-3.5 py-2.5 rounded-lg border border-teal-200">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-700" />
                Started at {new Date(batch.startedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="font-mono text-slate-700">
                {batch.completedTasks}/{batch.totalTasks} Done
              </span>
            </div>
          ) : (
            <button
              onClick={handleStartBatch}
              disabled={isStartingBatch}
              className="w-full min-h-[50px] px-6 py-3 rounded-xl text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 active:scale-[0.98] transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isStartingBatch ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting batch...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Start this batch
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function BatchDetailPage({ params }: BatchPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col">
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
