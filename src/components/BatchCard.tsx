import React from 'react';
import Link from 'next/link';
import { Clock, Layers, ArrowRight } from 'lucide-react';
import { BatchSummary } from '@/types/airtable';
import { StatusBadge } from './StatusBadge';
import { formatBatchTime } from '@/lib/utils/format';

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

  const actionText = batch.hasStarted && !batch.isCompleted ? 'Continue Batch' : 'View Batch';

  return (
    <Link
      href={`/batches/${batch.id}`}
      className="block group bg-white rounded-xl p-4 sm:p-5 border border-[#E2E8F0] shadow-2xs hover:border-[#009B83] transition-all active:scale-[0.985]"
    >
      {/* Top section: Batch name & Status badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
            BATCH
          </span>
          <h2 className="text-lg font-black text-[#111827] group-hover:text-[#009B83] transition-colors font-mono">
            {batch.name}
          </h2>
        </div>
        <StatusBadge type="batch-status" value={statusType} />
      </div>

      {/* Middle section: Worker, Target Date & Started status */}
      <div className="text-xs text-[#64748B] mb-2.5 space-y-1">
        <div>
          Worker: <strong className="text-[#111827] font-semibold">{batch.worker}</strong>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span>
            Target Date: <strong className="text-[#111827] font-semibold">{batch.targetDate}</strong>
          </span>

          {batch.startedAt ? (
            <span className="inline-flex items-center gap-1 text-[#047857] font-semibold bg-[#D1FAE5]/60 px-2 py-0.5 rounded border border-[#A7F3D0]">
              <Clock className="w-3 h-3 text-[#009B83]" />
              Started at {formatBatchTime(batch.startedAt)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[#64748B] font-medium bg-slate-100 px-2 py-0.5 rounded border border-[#E2E8F0]">
              <Clock className="w-3 h-3 text-slate-400" />
              Not started yet
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-1.5 mb-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-[#64748B]">
            Progress: <strong className="text-[#111827] font-bold">{batch.completedTasks}</strong> of <strong className="text-[#111827] font-bold">{batch.totalTasks}</strong> tasks completed
          </span>
          <span className="font-mono font-bold text-[#111827]">{percent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-[#E2E8F0]">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              batch.isCompleted
                ? 'bg-[#047857]'
                : batch.hasStarted
                ? 'bg-[#009B83]'
                : 'bg-slate-300'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Bottom Action: View Batch / Continue Batch */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#009B83] group-hover:text-[#062F2D]">
        <span>{actionText}</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
