'use client';

import React, { useState } from 'react';
import { Check, Loader2, Lock, Sparkles } from 'lucide-react';
import { TaskDetail } from '@/types/airtable';

interface TaskRowProps {
  task: TaskDetail;
  onTaskCompleted: (taskId: string) => Promise<void>;
  isBatchStarted: boolean;
}

export function TaskRow({ task, onTaskCompleted }: TaskRowProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMarkDone = async () => {
    if (!task.canMarkDone || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onTaskCompleted(task.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not save. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // State 1: Completed Task (Compact, space-saving, non-interactive indicator)
  if (task.isDone) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 pl-3.5 sm:px-4 transition-all">
        {/* Subtle Green Flush Indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Unique Batch Queue Badge */}
            <div className="w-6 h-6 shrink-0 rounded font-mono font-bold text-[11px] flex items-center justify-center bg-emerald-100 text-emerald-800 border border-emerald-200">
              #{task.queueNumber}
            </div>

            <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-slate-700 line-through decoration-slate-300">
                {task.itemName}
              </span>
              <span className="text-slate-500">
                • Step {task.stepNumber}: {task.actionName}
              </span>
              {task.taskCode && (
                <span className="font-mono text-[10px] text-slate-400 font-medium">
                  ({task.taskCode})
                </span>
              )}
            </div>
          </div>

          {/* Non-Interactive Completion Indicator (not a fake button) */}
          <div className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200">
            <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
            <span>Done</span>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Locked Task (Muted, clear reason why locked, non-interactive)
  if (task.isLocked) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50/30 p-3 pl-4 sm:p-3.5 sm:pl-5 transition-all">
        {/* Amber Flush Indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400/80" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            {/* Unique Batch Queue Badge */}
            <div className="w-6 h-6 shrink-0 rounded font-mono font-bold text-xs flex items-center justify-center mt-0.5 bg-slate-100 text-slate-400 border border-slate-200">
              #{task.queueNumber}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-xs font-bold text-slate-700">
                  {task.itemName}
                </span>
                {task.itemService && (
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
                    {task.itemService}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 font-medium mb-1">
                Step {task.stepNumber}: {task.actionName}{' '}
                {task.taskCode && (
                  <span className="font-mono text-[10px] text-slate-400 font-semibold">
                    ({task.taskCode})
                  </span>
                )}
              </p>

              {/* Authoritative Single Status + Clear Prerequisite Reason */}
              <div className="flex items-center gap-2 text-[11px] flex-wrap">
                <span className="inline-flex items-center gap-1 font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Locked
                </span>
                <span className="text-amber-800 font-medium text-[11px]">
                  Finish Step {Math.max(1, task.stepNumber - 1)} first
                </span>
              </div>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="shrink-0 flex items-center sm:self-center">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-400 bg-slate-100/90 border border-slate-200 cursor-not-allowed">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Locked</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Active Task (Ready to work or In Progress - High contrast, primary focus, prominent CTA)
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-teal-500/80 bg-white shadow-xs p-3.5 pl-4 sm:p-4 sm:pl-5 transition-all">
      {/* Primary Teal Flush Indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-600" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Queue Number + Item Info */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Unique Batch Queue Badge */}
          <div className="w-7 h-7 shrink-0 rounded font-mono font-black text-xs flex items-center justify-center bg-slate-900 text-white shadow-xs mt-0.5">
            #{task.queueNumber}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-sm font-black text-slate-900 tracking-tight">
                {task.itemName}
              </span>
              {task.itemService && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  {task.itemService}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-800 font-semibold mb-1.5 flex items-center gap-1.5 flex-wrap">
              <span>Step {task.stepNumber}: {task.actionName}</span>
              {task.taskCode && (
                <span className="font-mono text-[10px] text-slate-400 font-bold">
                  ({task.taskCode})
                </span>
              )}
            </p>

            {/* Special Handling / Workshop Care Note */}
            {task.itemNotes && (
              <div className="my-2 p-2 rounded-lg bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                <span className="shrink-0 font-bold text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                  Care Note
                </span>
                <span className="font-medium text-amber-900 leading-snug">
                  {task.itemNotes}
                </span>
              </div>
            )}

            {/* Authoritative Single Status Pill */}
            <div className="flex items-center gap-2 text-[11px] flex-wrap">
              {task.unifiedStatus === 'In Progress' ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  In Progress
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  Ready to Work
                </span>
              )}
            </div>

            {/* Inline Error Message if API fails */}
            {errorMessage && (
              <p className="text-xs text-red-700 mt-2 font-bold bg-red-50 p-2 rounded border border-red-200">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Right: Prominent Tappable Action Button */}
        <div className="shrink-0 flex items-center justify-end sm:self-center">
          <button
            onClick={handleMarkDone}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-black bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 active:scale-[0.98] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                Mark as Done
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
