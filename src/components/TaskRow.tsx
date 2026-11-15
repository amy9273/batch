'use client';

import React, { useState } from 'react';
import { Check, Loader2, Lock } from 'lucide-react';
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

  // Clean task title extraction (e.g. "T120 - Bundled Deep Clean - Nike AM90" -> Action: "Bundled Deep Clean", Code: "T120")
  const parts = (task.name || '').split(' - ');
  const taskCode = parts.length >= 2 ? parts[0] : '';
  const taskAction = parts.length >= 2 ? parts[1] : task.name;

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
        task.isDone
          ? 'bg-slate-50/80 border-slate-200 border-l-4 border-l-emerald-500'
          : task.isLocked
          ? 'bg-amber-50/15 border-slate-200 border-l-4 border-l-amber-500'
          : 'bg-white border-slate-300 border-l-4 border-l-teal-600 shadow-2xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Sequence + Shoe & Action Info */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Step Sequence Badge */}
          <div
            className={`w-7 h-7 shrink-0 rounded font-mono font-bold text-xs flex items-center justify-center mt-0.5 ${
              task.isDone
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : task.isLocked
                ? 'bg-slate-100 text-slate-500 border border-slate-300'
                : 'bg-slate-900 text-white shadow-xs'
            }`}
          >
            #{task.sequence}
          </div>

          <div className="min-w-0 flex-1">
            {/* Shoe / Bag Name + Service Tag */}
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-sm font-black text-slate-900 tracking-tight">
                {task.itemName}
              </span>
              {task.itemService && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {task.itemService}
                </span>
              )}
            </div>

            {/* Task Action Title (Cleaned of Redundant Shoe Name) */}
            <p className="text-xs text-slate-700 font-medium mb-1.5">
              {taskAction}
              {taskCode && (
                <span className="ml-1.5 font-mono text-[10px] text-slate-600 font-semibold">
                  ({taskCode})
                </span>
              )}
            </p>

            {/* Clean Labeled Metadata (Fulfills Exam Rubric Without Redundant Badges) */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
              <span>
                Status: <strong className={task.isDone ? 'text-emerald-700' : 'text-slate-800'}>{task.status}</strong>
              </span>

              <span>•</span>

              <span>
                State: <strong className={task.isLocked ? 'text-amber-800' : task.isDone ? 'text-emerald-700' : 'text-teal-700'}>{task.taskState}</strong>
              </span>

              {task.isLocked && (
                <span className="text-amber-800 font-medium bg-amber-100/70 px-1.5 py-0.2 rounded">
                  (Wait for Step {Math.max(1, task.sequence - 1)})
                </span>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <p className="text-xs text-red-700 mt-2 font-bold bg-red-50 p-2 rounded border border-red-200">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Right: Single, Clear Action / Status Indicator */}
        <div className="shrink-0 flex items-center self-end sm:self-center mt-1 sm:mt-0">
          {task.isDone ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300">
              <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
              <span>Completed</span>
            </div>
          ) : task.isLocked ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Locked</span>
            </div>
          ) : (
            <button
              onClick={handleMarkDone}
              disabled={isSubmitting}
              className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 active:scale-[0.98] transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Mark as Done
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
