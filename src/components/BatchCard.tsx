import React from 'react';
import Link from 'next/link';
import { Clock, Layers, ArrowRight } from 'lucide-react';
import { BatchSummary } from '@/types/airtable';
import { StatusBadge } from './StatusBadge';

interface BatchCardProps {
  batch: BatchSummary;
}

export function BatchCard({ batch }: BatchCardProps) {
  const percent =
    batch.totalTasks > 0
      ? Math.round((batch.completedTasks / batch.totalTasks) * 100)
      : 0;

  const statusType = batch.isCompleted
    ? 'Completed'
    : batch.hasStarted
    ? 'In Progress'
    : 'Not Started';

  return (
    <Link
      href={`/batch/${batch.id}`}
      className="block group bg-white rounded-xl p-5 border border-slate-300 shadow-2xs hover:border-teal-600 transition-all active:scale-[0.985]"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Batch
          </span>
          <h2 className="text-lg font-black text-slate-900 group-hover:text-teal-800 transition-colors font-mono">
            {batch.name}
          </h2>
        </div>
        <StatusBadge type="batch-status" value={statusType} />
      </div>

      {/* Started timestamp & task count */}
      <div className="text-xs text-slate-600 mb-4 flex items-center gap-3 flex-wrap">
        {batch.startedAt ? (
          <span className="inline-flex items-center gap-1.5 text-teal-900 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            <Clock className="w-3.5 h-3.5 text-teal-700" />
            Started at {new Date(batch.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Not started yet
          </span>
        )}

        <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          {batch.totalTasks} tasks
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-600">
            Progress: <strong className="text-slate-900 font-bold">{batch.completedTasks}</strong> of <strong className="text-slate-900 font-bold">{batch.totalTasks}</strong> done
          </span>
          <span className="font-mono font-bold text-slate-900">{percent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              batch.isCompleted
                ? 'bg-emerald-600'
                : batch.hasStarted
                ? 'bg-teal-600'
                : 'bg-slate-300'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Simple View Tasks Action */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700 group-hover:text-teal-900">
        <span>View tasks</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
