/**
 * Main Airtable Facade
 * Delegates to domain calculators, rule engines, and BatchService.
 */

export * from '@/lib/domain/validator';
export * from '@/lib/domain/calculator';
export * from '@/lib/services/batch.service';
export * from '@/lib/airtable/client';

import { batchService } from '@/lib/services/batch.service';

export const getBatchesForWorker = (worker?: string, date?: string) =>
  batchService.getBatchesForWorker(worker, date);

export const getBatchDetails = (batchId: string) =>
  batchService.getBatchDetails(batchId);

export const startBatch = (batchId: string) =>
  batchService.startBatch(batchId);

export const completeTask = (taskId: string) =>
  batchService.completeTask(taskId);
