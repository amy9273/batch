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

  // Clean task title so it doesn't repeat the shoe name at the end
  let cleanTaskName = task.name;
  if (task.itemName && cleanTaskName.endsWith(` - ${task.itemName}`)) {
    cleanTaskName = cleanTaskName.slice(0, -(task.itemName.length + 3));
  }

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
        task.isDone
          ? 'bg-emerald-50/20 border-emerald-200/80'
          : task.isLocked
          ? 'bg-amber-50/20 border-amber-200'
          : 'bg-white border-slate-300 shadow-2xs hover:border-teal-500'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Step Index + Shoe & Task Info */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Step Number Badge */}
          <div
            className={`w-7 h-7 shrink-0 rounded font-mono font-bold text-xs flex items-center justify-center mt-0.5 ${
              task.isDone
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : task.isLocked
                ? 'bg-slate-100 text-slate-500 border border-slate-300'
                : 'bg-slate-900 text-white shadow-xs'
            }`}
          >
            {task.sequence}
          </div>

          <div className="min-w-0 flex-1">
            {/* Shoe / Bag Name + Service Tag */}
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                {task.itemName}
              </span>
              {task.itemService && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {task.itemService}
                </span>
              )}
            </div>

            {/* Clean Task Description */}
            <p className="text-xs text-slate-600 mb-2 font-medium">
              {cleanTaskName}
            </p>

            {/* Clear, Non-Duplicated Status & State Display */}
            <div className="flex items-center gap-2 flex-wrap text-[11px]">
              {task.isDone ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Status: Done
                </span>
              ) : task.isLocked ? (
                <>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    <Lock className="w-3 h-3 stroke-[2.5]" />
                    State: Locked
                  </span>
                  <span className="text-slate-500 font-medium">
                    (Finish Step {Math.max(1, task.sequence - 1)} first)
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1 font-bold text-teal-900 bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
                    State: Ready
                  </span>
                  <span className="text-slate-500 font-medium">
                    Status: {task.status}
                  </span>
                </>
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

        {/* Right: Clean Action Area (Compact on Done, Big on Ready) */}
        <div className="shrink-0 flex items-center self-center sm:self-auto">
          {task.isDone ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300">
              <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
              <span>Completed</span>
            </div>
          ) : task.isLocked ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed">
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
