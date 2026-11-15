'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { BatchCard } from '@/components/BatchCard';
import { LoadingSkeleton, ErrorMessage } from '@/components/FeedbackStates';
import { BatchSummary } from '@/types/airtable';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function BatchListPage() {
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
        throw new Error(data.error || 'Failed to load batches');
      }

      setBatches(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to Airtable';
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // Metric summaries
  const totalBatches = batches.length;
  const startedBatches = batches.filter((b) => b.hasStarted).length;
  const completedBatches = batches.filter((b) => b.isCompleted).length;
  const totalTasks = batches.reduce((acc, b) => acc + b.totalTasks, 0);
  const totalCompletedTasks = batches.reduce((acc, b) => acc + b.completedTasks, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-safe">
      <Header title="SOLE SURGEON" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:px-6">
        {/* Page Title & Refresh */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Today&apos;s Admissions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Target schedule for <strong className="font-bold text-slate-900">Ana</strong> • <strong className="font-bold text-slate-900">October 22, 2026</strong>
            </p>
          </div>

          <button
            onClick={() => fetchBatches(true)}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh batch list from Airtable"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
            <span className="hidden sm:inline">Sync Airtable</span>
            <span className="sm:hidden">Sync</span>
          </button>
        </div>

        {/* Triage Metrics Strip */}
        {!isLoading && !error && batches.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                Batches Scheduled
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono">{totalBatches}</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                Active in Lab
              </span>
              <span className="text-2xl font-black text-teal-700 font-mono">{startedBatches}</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                Fully Restored
              </span>
              <span className="text-2xl font-black text-emerald-700 font-mono">{completedBatches}</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                Procedures Done
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
            title="Unable to connect to Airtable"
            message={error}
            onRetry={() => fetchBatches(false)}
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
              There are no assigned restoration batches for Ana on October 22, 2026.
            </p>
            <button
              onClick={() => fetchBatches(false)}
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
        Sole Surgeon Philippines • Workshop Floor Production Control System
      </footer>
    </div>
  );
}
