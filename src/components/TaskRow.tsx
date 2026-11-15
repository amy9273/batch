'use client';

import React, { useState } from 'react';
import { Check, Loader2, Lock } from 'lucide-react';
import { TaskDetail } from '@/types/airtable';
import { StatusBadge } from './StatusBadge';

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

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        task.isDone
          ? 'bg-slate-50 border-slate-200'
          : task.isLocked
          ? 'bg-amber-50/20 border-amber-200'
          : 'bg-white border-slate-300 shadow-2xs hover:border-teal-500'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Left: Step Number + Item & Task Name */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Step Number Badge */}
          <div
            className={`px-2 py-1 shrink-0 rounded font-mono font-bold text-xs flex items-center justify-center ${
              task.isDone
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : task.isLocked
                ? 'bg-slate-100 text-slate-500 border border-slate-300'
                : 'bg-slate-900 text-white shadow-xs'
            }`}
          >
            Step {task.sequence}
          </div>

          <div className="min-w-0 flex-1">
            {/* Shoe / Bag Name */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                {task.itemName}
              </span>
              {task.itemService && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {task.itemService}
                </span>
              )}
            </div>

            {/* Task Description */}
            <p className="text-xs text-slate-600 mb-2 font-medium">
              {task.name}
            </p>

            {/* Simple Status Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge type="task-state" value={task.taskState} />
              <StatusBadge type="task-status" value={task.status} />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <p className="text-xs text-red-700 mt-2 font-bold bg-red-50 p-2 rounded border border-red-200">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Right: Action Button (Min 48px Tap Height) */}
        <div className="sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {task.isDone ? (
            <button
              disabled
              className="w-full sm:w-auto min-h-[48px] px-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-1.5 cursor-not-allowed opacity-90"
            >
              <Check className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
              Done
            </button>
          ) : task.isLocked ? (
            <div className="flex flex-col items-center sm:items-end gap-1">
              <button
                disabled
                className="w-full sm:w-auto min-h-[48px] px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 border border-slate-300 flex items-center justify-center gap-1.5 cursor-not-allowed"
              >
                <Lock className="w-4 h-4 text-amber-700 stroke-[2.5]" />
                Locked
              </button>
              <span className="text-[10px] text-amber-800 font-semibold">
                Finish earlier steps first
              </span>
            </div>
          ) : (
            <button
              onClick={handleMarkDone}
              disabled={isSubmitting}
              className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 active:scale-[0.98] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
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
