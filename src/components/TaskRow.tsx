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
      const msg = err instanceof Error ? err.message : 'Failed to update task';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-colors ${
        task.isDone
          ? 'bg-slate-50 border-slate-200'
          : task.isLocked
          ? 'bg-amber-50/20 border-amber-200/70'
          : 'bg-white border-slate-300 shadow-2xs hover:border-slate-400'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Sequence + Item & Task Details */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Step Sequence badge */}
          <div
            className={`w-7 h-7 shrink-0 rounded flex items-center justify-center text-xs font-mono font-bold ${
              task.isDone
                ? 'bg-emerald-100 text-emerald-800'
                : task.isLocked
                ? 'bg-slate-100 text-slate-500'
                : 'bg-slate-900 text-white'
            }`}
            title={`Step ${task.sequence}`}
          >
            {task.sequence}
          </div>

          <div className="min-w-0 flex-1">
            {/* Item Name & Service */}
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-sm font-bold text-slate-900 truncate">
                {task.itemName}
              </span>
              {task.itemService && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {task.itemService}
                </span>
              )}
            </div>

            {/* Task Name */}
            <p className="text-xs text-slate-600 mb-2 font-normal">
              {task.name}
            </p>

            {/* State & Status Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge type="task-state" value={task.taskState} />
              <StatusBadge type="task-status" value={task.status} />
            </div>

            {/* Error Message if mutation fails */}
            {errorMessage && (
              <p className="text-xs text-red-700 mt-2 font-medium bg-red-50 p-2 rounded border border-red-200">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Right: Action Button */}
        <div className="sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {task.isDone ? (
            <button
              disabled
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1.5 cursor-not-allowed opacity-90"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              Completed
            </button>
          ) : task.isLocked ? (
            <button
              disabled
              title="This task is locked because preceding item steps are pending."
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5" />
              Locked
            </button>
          ) : (
            <button
              onClick={handleMarkDone}
              disabled={isSubmitting}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Mark as done'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
