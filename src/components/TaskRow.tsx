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
      className={`p-4 rounded-xl border transition-all ${
        task.isDone
          ? 'bg-slate-50/80 border-slate-200 opacity-90'
          : task.isLocked
          ? 'bg-amber-50/25 border-amber-200'
          : 'bg-white border-slate-300 shadow-2xs hover:border-teal-500'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Left: Step Sequence & Patient / Procedure Info */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Step Sequence Badge */}
          <div
            className={`w-8 h-8 shrink-0 rounded flex items-center justify-center font-mono font-black text-xs ${
              task.isDone
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : task.isLocked
                ? 'bg-slate-100 text-slate-500 border border-slate-300'
                : 'bg-[#042F2E] text-white shadow-xs'
            }`}
            title={`Step Sequence #${task.sequence}`}
          >
            #{task.sequence}
          </div>

          <div className="min-w-0 flex-1">
            {/* Patient Hero Title (Footwear / Bag Model) */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-black text-slate-900 tracking-tight">
                {task.itemName}
              </span>
              {task.itemService && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {task.itemService}
                </span>
              )}
            </div>

            {/* Surgical Procedure Name */}
            <p className="text-xs text-slate-700 mb-2.5 font-medium leading-relaxed">
              {task.name}
            </p>

            {/* Surgical State & Status Indicators */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge type="task-state" value={task.taskState} />
              <StatusBadge type="task-status" value={task.status} />
            </div>

            {/* Error Message if Airtable call fails */}
            {errorMessage && (
              <p className="text-xs text-red-700 mt-2 font-bold bg-red-50 p-2 rounded border border-red-200">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Right: Tactile Mobile Action Button (Min 48px Tap Height) */}
        <div className="sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {task.isDone ? (
            <button
              disabled
              className="w-full sm:w-auto min-h-[48px] px-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-1.5 cursor-not-allowed opacity-90"
            >
              <Check className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
              Procedure complete
            </button>
          ) : task.isLocked ? (
            <button
              disabled
              title="Locked: Prior item steps must be completed first."
              className="w-full sm:w-auto min-h-[48px] px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 border border-slate-300 flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Lock className="w-4 h-4 text-amber-700 stroke-[2.5]" />
              Locked (Awaiting prior step)
            </button>
          ) : (
            <button
              onClick={handleMarkDone}
              disabled={isSubmitting}
              className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-lg text-xs font-black bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 active:scale-[0.98] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving to Airtable...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  Mark step done
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
