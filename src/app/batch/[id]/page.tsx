'use client';

import React, { use, Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { TaskRow } from '@/components/TaskRow';
import { LoadingSkeleton, ErrorMessage } from '@/components/FeedbackStates';
import { StatusBadge } from '@/components/StatusBadge';
import { useBatchDetails } from '@/hooks/useBatchDetails';
import { formatBatchTime } from '@/lib/utils/format';
import {
  ArrowLeft,
  Check,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Play,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';

interface BatchPageProps {
  params: Promise<{ id: string }>;
}

function BatchDetailContent({ params }: BatchPageProps) {
  const resolvedParams = use(params);
  const batchId = resolvedParams.id;

  const [isMounted, setIsMounted] = useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    batch,
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
    clearErrorMessage,
    clearSuccessMessage,
    refresh,
    retry,
  } = useBatchDetails(batchId);

  const percent =
    batch && batch.totalTasks > 0
      ? Math.round((batch.completedTasks / batch.totalTasks) * 100)
      : 0;

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-32 sm:pb-12" suppressHydrationWarning>
      <Header title="Sole Surgeon" showBack />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-3.5 sm:px-6">
        {/* Navigation & Refresh Bar */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111827] hover:text-[#009B83] transition bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Batches
          </Link>

          <button
            onClick={refresh}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-[#E2E8F0] text-[#111827] hover:bg-slate-50 transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh batch"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#009B83]' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Save Notifications */}
        {successMessage && (
          <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between gap-2 text-xs font-bold text-emerald-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0 stroke-[3]" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={clearSuccessMessage}
              className="text-emerald-700 hover:text-emerald-950 font-black px-1.5 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-300 rounded-lg flex items-center justify-between gap-2 text-xs font-bold text-red-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={clearErrorMessage}
              className="text-red-700 hover:text-red-950 font-black px-1.5 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {isLoading ? (
          <LoadingSkeleton count={4} />
        ) : !batch ? (
          <ErrorMessage
            title="Batch not found"
            message="Could not find this batch record."
            onRetry={retry}
          />
        ) : (
          <div className="space-y-3.5">
            {/* Compact Mobile-Optimized Batch Header Card */}
            <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-300 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Batch
                  </span>
                  <h2 className="text-xl font-black text-slate-900 font-mono tracking-tight">
                    {batch.name}
                  </h2>
                </div>
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

              {/* Status & Timing Line */}
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2.5 flex-wrap gap-2">
                <div>
                  Worker: <strong className="text-slate-900">{batch.worker}</strong> • Date: <strong className="text-slate-900">{batch.targetDate}</strong>
                </div>

                {batch.startedAt ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    <Clock className="w-3 h-3 text-teal-600" />
                    Started at {formatBatchTime(batch.startedAt)}
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium">
                    Not started yet
                  </span>
                )}
              </div>

              {/* Progress Summary & Explicit Task Breakdown */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-600">
                    Progress: <strong className="text-slate-900 font-bold">{batch.completedTasks}</strong> of <strong className="text-slate-900 font-bold">{batch.totalTasks}</strong> tasks done
                  </span>
                  <span className="font-mono font-bold text-slate-900">{percent}%</span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      batch.isCompleted ? 'bg-emerald-600' : 'bg-teal-600'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Explicit breakdown matching exact Airtable Task States */}
                <div className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-[#64748B] flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[#047857] bg-[#D1FAE5]/60 px-2 py-0.5 rounded border border-[#A7F3D0]">
                    <Check className="w-3 h-3 text-[#009B83] stroke-[3]" />
                    <strong>{doneCount}</strong> Done
                  </span>
                  <span className="text-slate-300">•</span>
                  {inProgressCount > 0 && (
                    <>
                      <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        <strong>{inProgressCount}</strong> In Progress
                      </span>
                      <span className="text-slate-300">•</span>
                    </>
                  )}
                  {readyCount > 0 && (
                    <>
                      <span className="inline-flex items-center gap-1 text-[#047857] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        <Sparkles className="w-3 h-3 text-[#009B83]" />
                        <strong>{readyCount}</strong> Ready
                      </span>
                      <span className="text-slate-300">•</span>
                    </>
                  )}
                  <span className="inline-flex items-center gap-1 text-[#64748B] bg-slate-100 px-2 py-0.5 rounded border border-[#E2E8F0]">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <strong>{lockedCount}</strong> Locked
                  </span>
                </div>
              </div>

              {/* Explanatory notice when unstarted (No duplicate mobile button) */}
              {!batch.hasStarted && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    This batch hasn&apos;t started yet.
                  </span>
                  {/* Desktop-only Start button; mobile uses the thumb-zone sticky button */}
                  <div className="hidden sm:block">
                    <button
                      onClick={startBatch}
                      disabled={isStartingBatch}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-[#009B83] text-white hover:bg-teal-700 active:bg-[#062F2D] transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isStartingBatch ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          Start Batch
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Segmented Filter Control Bar (Single Clean Row) */}
            <div className="sticky top-[52px] z-30 bg-slate-50/95 backdrop-blur-md py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {/* Segmented Control Bar matching exact counts (Single unified row, responsive labels to prevent wrapping) */}
              <div className="grid grid-cols-4 gap-1 sm:gap-1.5 bg-slate-200/70 p-1 rounded-lg text-xs font-bold">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`py-1.5 px-0.5 sm:px-1 text-center rounded-md transition-all cursor-pointer border-0 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 whitespace-nowrap ${
                    filterMode === 'all'
                      ? 'bg-white text-[#111827] shadow-xs'
                      : 'text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setFilterMode(inProgressCount > 0 ? 'in_progress' : 'ready')}
                  className={`py-1.5 px-0.5 sm:px-1 text-center rounded-md transition-all cursor-pointer border-0 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 whitespace-nowrap ${
                    filterMode === 'in_progress' || filterMode === 'ready'
                      ? 'bg-[#009B83] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  <span className="sm:hidden">
                    {inProgressCount > 0 ? `Active (${inProgressCount})` : `Ready (${readyCount})`}
                  </span>
                  <span className="hidden sm:inline">
                    {inProgressCount > 0 ? `In Progress (${inProgressCount})` : `Ready (${readyCount})`}
                  </span>
                </button>
                <button
                  onClick={() => setFilterMode('locked')}
                  className={`py-1.5 px-0.5 sm:px-1 text-center rounded-md transition-all cursor-pointer border-0 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 whitespace-nowrap ${
                    filterMode === 'locked'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  Locked ({lockedCount})
                </button>
                <button
                  onClick={() => setFilterMode('done')}
                  className={`py-1.5 px-0.5 sm:px-1 text-center rounded-md transition-all cursor-pointer border-0 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 whitespace-nowrap ${
                    filterMode === 'done'
                      ? 'bg-[#047857] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#111827]'
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
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onTaskCompleted={completeTask}
                    isBatchStarted={Boolean(batch.hasStarted)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sticky Mobile Bottom Bar (Thumb Zone for Unstarted Batch) */}
      {batch && !batch.hasStarted && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] p-3 sm:hidden shadow-lg pb-safe">
          <button
            onClick={startBatch}
            disabled={isStartingBatch}
            className="w-full min-h-[48px] px-6 py-3 rounded-xl text-sm font-bold bg-[#009B83] text-white hover:bg-teal-700 active:bg-[#062F2D] active:scale-[0.98] transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isStartingBatch ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting batch...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Start Batch
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BatchDetailPage({ params }: BatchPageProps) {
  return (
    <Suspense fallback={null}>
      <BatchDetailContent params={params} />
    </Suspense>
  );
}
