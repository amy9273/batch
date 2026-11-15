import React from 'react';
import Link from 'next/link';
import { Clock, Layers } from 'lucide-react';
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
      className="block group bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all active:scale-[0.995]"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
            Batch
          </span>
          <h2 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
            {batch.name}
          </h2>
        </div>
        <StatusBadge type="batch-status" value={statusType} />
      </div>

      {/* Started timestamp & task count */}
      <div className="text-xs text-slate-600 mb-4 flex items-center gap-3 flex-wrap">
        {batch.startedAt ? (
          <span className="inline-flex items-center gap-1.5 text-teal-800 font-medium">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            Started at {new Date(batch.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Not started yet
          </span>
        )}

        <span className="inline-flex items-center gap-1 text-slate-600">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          {batch.totalTasks} tasks
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">
            Progress: <strong className="text-slate-900 font-semibold">{batch.completedTasks}</strong> of <strong className="text-slate-900 font-semibold">{batch.totalTasks}</strong> completed
          </span>
          <span className="font-bold text-slate-900">{percent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
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

      {/* Footer navigation cue */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-teal-700">
        <span>View batch tasks</span>
        <span className="font-mono text-slate-400 group-hover:text-teal-600">→</span>
      </div>
    </Link>
  );
}
