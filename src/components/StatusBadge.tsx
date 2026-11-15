import React from 'react';
import { Lock, Check } from 'lucide-react';
import { TaskState, TaskStatus } from '@/types/airtable';

interface StatusBadgeProps {
  type: 'batch-status' | 'task-status' | 'task-state';
  value: string;
}

export function StatusBadge({ type, value }: StatusBadgeProps) {
  if (type === 'batch-status') {
    switch (value) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Check className="w-3 h-3 stroke-[2.5]" />
            Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-300">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
            Active in lab
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Not started
          </span>
        );
    }
  }

  if (type === 'task-status') {
    switch (value as TaskStatus) {
      case 'Done':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
            Done
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-800 border border-sky-200">
            In progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Not started
          </span>
        );
    }
  }

  if (type === 'task-state') {
    switch (value as TaskState) {
      case 'LOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <Lock className="w-3 h-3 text-amber-700 stroke-[2.5]" />
            LOCKED
          </span>
        );
      case 'DONE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
            DONE
          </span>
        );
      case 'IN PROGRESS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-teal-900 border border-teal-300">
            READY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {value}
          </span>
        );
    }
  }

  return <span>{value}</span>;
}
