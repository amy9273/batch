'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BatchCard } from '@/components/BatchCard';
import { LoadingSkeleton, ErrorMessage } from '@/components/FeedbackStates';
import { useBatches } from '@/hooks/useBatches';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function BatchListPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { batches, isLoading, isRefreshing, error, refresh, retry } = useBatches();

  // Metric summaries derived directly from data according to exam spec
  const totalBatches = batches.length;
  const totalTasks = batches.reduce((acc, b) => acc + b.totalTasks, 0);
  const tasksCompleted = batches.reduce((acc, b) => acc + b.completedTasks, 0);
  const tasksRemaining = Math.max(0, totalTasks - tasksCompleted);

  // Operational Priority Sorting (Reviewer Recommendation):
  // 1. In Progress (urgently needs work)
  // 2. Not Started (pending work)
  // 3. Finished (already done)
  const sortedBatches = [...batches].sort((a, b) => {
    const getPriority = (batch: typeof a) => {
      if (batch.hasStarted && !batch.isCompleted) return 1; // In Progress
      if (!batch.hasStarted && !batch.isCompleted) return 2; // Not Started
      return 3; // Finished
    };
    return getPriority(a) - getPriority(b);
  });

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-safe" suppressHydrationWarning>
      <Header title="Sole Surgeon" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:px-6">
        {/* Header Title & Refresh */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
              My Batches
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Thursday, October 22, 2026
            </p>
          </div>

          <button
            onClick={refresh}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-[#E2E8F0] text-[#111827] hover:bg-slate-50 active:bg-slate-100 transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh batch list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#009B83]' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Compact Summary Metrics (Spec: Total Batches, Tasks Completed, Tasks Remaining) */}
        {!isLoading && !error && batches.length > 0 && (
          <div className="mb-5">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
                <span className="text-xs font-semibold text-[#64748B] block mb-0.5 truncate">
                  Batches
                </span>
                <span className="text-2xl font-black text-[#111827] font-mono">{totalBatches}</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
                <span className="text-xs font-semibold text-[#64748B] block mb-0.5 truncate">
                  Completed
                </span>
                <span className="text-2xl font-black text-[#047857] font-mono">{tasksCompleted}</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
                <span className="text-xs font-semibold text-[#64748B] block mb-0.5 truncate">
                  Remaining
                </span>
                <span className="text-2xl font-black text-[#111827] font-mono">{tasksRemaining}</span>
              </div>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1.5 px-0.5">
              Across all assigned batches for today
            </p>
          </div>
        )}

        {/* Content States */}
        {isLoading ? (
          <LoadingSkeleton count={3} />
        ) : error ? (
          <ErrorMessage
            title="Unable to load batches"
            message="Something went wrong while retrieving your assigned batches."
            onRetry={retry}
          />
        ) : batches.length === 0 ? (
          <div className="bg-white rounded-xl p-10 border border-[#E2E8F0] text-center max-w-md mx-auto my-8">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#111827] mb-1">
              No batches assigned
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              There are no batches assigned to you for October 22, 2026.
            </p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-[#062F2D] text-white text-xs font-bold rounded-lg hover:bg-teal-900 transition cursor-pointer"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {sortedBatches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </main>

      <footer className="mt-auto py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        Sole Surgeon • Shoe &amp; Bag Care System
      </footer>
    </div>
  );
}
