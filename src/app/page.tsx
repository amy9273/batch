'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BatchCard } from '@/components/BatchCard';
import { LoadingSkeleton, ErrorMessage } from '@/components/FeedbackStates';
import { useBatches } from '@/hooks/useBatches';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function BatchListPage() {
  const { batches, isLoading, isRefreshing, error, refresh, retry } = useBatches();

  // Metric summaries derived directly from data (rerender-derived-state-no-effect)
  const totalBatches = batches.length;
  const startedBatches = batches.filter((b) => b.hasStarted).length;
  const completedBatches = batches.filter((b) => b.isCompleted).length;
  const totalTasks = batches.reduce((acc, b) => acc + b.totalTasks, 0);
  const totalCompletedTasks = batches.reduce((acc, b) => acc + b.completedTasks, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-safe">
      <Header title="Sole Surgeon" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:px-6">
        {/* Header Title & Refresh */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Today&apos;s Batches
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Batches for <strong className="font-bold text-slate-900">Ana</strong> • <strong className="font-bold text-slate-900">October 22, 2026</strong>
            </p>
          </div>

          <button
            onClick={refresh}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh batch list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Clear Everyday Metrics */}
        {!isLoading && !error && batches.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">
                Total Batches
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono">{totalBatches}</span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">
                Started
              </span>
              <span className="text-2xl font-black text-teal-700 font-mono">{startedBatches}</span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">
                Finished
              </span>
              <span className="text-2xl font-black text-emerald-700 font-mono">{completedBatches}</span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">
                Tasks Done
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 font-mono">{totalCompletedTasks}</span>
                <span className="text-xs text-slate-500 font-mono">/ {totalTasks}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content States */}
        {isLoading ? (
          <LoadingSkeleton count={3} />
        ) : error ? (
          <ErrorMessage
            title="Could not load batches"
            message={error}
            onRetry={retry}
          />
        ) : batches.length === 0 ? (
          <div className="bg-white rounded-xl p-10 border border-slate-200 text-center max-w-md mx-auto my-8">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              No batches found
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              There are no batches assigned to Ana for October 22, 2026.
            </p>
            <button
              onClick={retry}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              Check again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {batches.map((batch) => (
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
