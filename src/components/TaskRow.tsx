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
      <div className="relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-slate-50/70 p-3 pl-4 sm:px-4 transition-all">
        {/* Subtle Green Flush Indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#047857]" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            {/* Unique Batch Queue Badge */}
            <div className="w-6 h-6 shrink-0 rounded font-mono font-bold text-[11px] flex items-center justify-center bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0] mt-0.5">
              #{task.queueNumber}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-xs font-bold text-[#111827]">
                  {task.itemName}
                </span>
                {task.itemService && (
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-[#64748B] border border-[#E2E8F0]">
                    {task.itemService}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#64748B] font-medium mb-1">
                Step {task.stepNumber}: {task.actionName}{' '}
                {task.taskCode && (
                  <span className="font-mono text-[10px] text-slate-400">
                    ({task.taskCode})
                  </span>
                )}
              </p>

              {/* Independent Status & Task State display (Exam Spec Section 5) */}
              <div className="flex items-center gap-2 text-[11px] text-[#64748B] flex-wrap">
                <span>
                  Status: <strong className="text-[#047857]">{task.status}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  Task State: <strong className="text-[#047857]">{task.taskState}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Non-Interactive Completed Indicator (Plain icon + text, not a clickable button) */}
          <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#047857] py-1 px-2 select-none">
            <Check className="w-4 h-4 text-[#009B83] stroke-[3]" />
            <span>Completed</span>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Locked Task (Muted, clear reason why locked, non-interactive)
  if (task.isLocked) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F1F5F9]/50 p-3 pl-4 sm:p-3.5 sm:pl-5 transition-all">
        {/* Gray Flush Indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            {/* Unique Batch Queue Badge */}
            <div className="w-6 h-6 shrink-0 rounded font-mono font-bold text-xs flex items-center justify-center mt-0.5 bg-slate-100 text-slate-400 border border-[#E2E8F0]">
              #{task.queueNumber}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-xs font-bold text-[#111827]">
                  {task.itemName}
                </span>
                {task.itemService && (
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-[#64748B] border border-[#E2E8F0]">
                    {task.itemService}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#64748B] font-medium mb-1">
                Step {task.stepNumber}: {task.actionName}{' '}
                {task.taskCode && (
                  <span className="font-mono text-[10px] text-slate-400 font-semibold">
                    ({task.taskCode})
                  </span>
                )}
              </p>

              {/* Independent Status & Task State display + Clear Prerequisite Reason */}
              <div className="flex items-center gap-2 text-[11px] text-[#64748B] flex-wrap">
                <span>
                  Status: <strong className="text-[#111827]">{task.status}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  Task State: <strong className="text-slate-600">{task.taskState}</strong>
                </span>
                <span className="text-amber-800 font-medium text-[11px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                  Finish Step {Math.max(1, task.stepNumber - 1)} first
                </span>
              </div>
            </div>
          </div>

          {/* Non-Interactive Locked Badge */}
          <div className="shrink-0 flex items-center sm:self-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-100 border border-[#E2E8F0] cursor-not-allowed select-none">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Locked</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Active Task (Eligible: Ready to work or In Progress - High contrast, primary focus, prominent CTA)
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-[#009B83] bg-white shadow-xs p-3.5 pl-4 sm:p-4 sm:pl-5 transition-all">
      {/* Primary Green Flush Indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#009B83]" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Queue Number + Item Info */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Unique Batch Queue Badge */}
          <div className="w-7 h-7 shrink-0 rounded font-mono font-black text-xs flex items-center justify-center bg-[#062F2D] text-white shadow-xs mt-0.5">
            #{task.queueNumber}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-sm font-black text-[#111827] tracking-tight">
                {task.itemName}
              </span>
              {task.itemService && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0]">
                  {task.itemService}
                </span>
              )}
            </div>

            <p className="text-xs text-[#111827] font-semibold mb-1 flex items-center gap-1.5 flex-wrap">
              <span>Step {task.stepNumber}: {task.actionName}</span>
              {task.taskCode && (
                <span className="font-mono text-[10px] text-slate-400 font-bold">
                  ({task.taskCode})
                </span>
              )}
            </p>

            {/* Special Handling / Workshop Care Note */}
            {task.itemNotes && (
              <div className="my-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-1.5">
                <span className="shrink-0 font-bold text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                  Care Note
                </span>
                <span className="font-medium text-amber-900 leading-snug">
                  {task.itemNotes}
                </span>
              </div>
            )}

            {/* Independent Status & Task State display (Exam Spec Section 5) */}
            <div className="flex items-center gap-2 text-[11px] text-[#64748B] flex-wrap mt-1">
              <span>
                Status: <strong className="text-[#111827]">{task.status}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Task State:{' '}
                <strong className={task.taskState === 'IN PROGRESS' ? 'text-blue-700 font-bold' : 'text-[#047857] font-bold'}>
                  {task.taskState}
                </strong>
              </span>
            </div>

            {/* Inline Error Message if API fails */}
            {errorMessage && (
              <p className="text-xs text-red-700 mt-2 font-bold bg-red-50 p-2 rounded border border-red-200">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Right: Prominent Tappable Mark Done Action Button (Min 44px Touch Target) */}
        <div className="shrink-0 flex items-center justify-end sm:self-center">
          <button
            onClick={handleMarkDone}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold bg-[#009B83] text-white hover:bg-teal-700 active:bg-[#062F2D] active:scale-[0.98] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                Mark Done
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
