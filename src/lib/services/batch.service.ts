import { AirtableClient, IAirtableClient } from '@/lib/airtable/client';
import { ProductionRuleEngine } from '@/lib/domain/validator';
import { BatchMetricsCalculator } from '@/lib/domain/calculator';
import {
  BatchDetailData,
  BatchFields,
  BatchRecord,
  BatchSummary,
  ItemFields,
  ItemRecord,
  TaskFields,
  TaskRecord,
} from '@/types/airtable';

export class BatchService {
  private readonly client: IAirtableClient;

  constructor(client: IAirtableClient = new AirtableClient()) {
    this.client = client;
  }

  /**
   * Retrieves all batches assigned to worker for a target date
   */
  public async getBatchesForWorker(
    worker: string = process.env.DEFAULT_WORKER || 'Ana',
    targetDate: string = process.env.DEFAULT_BUSINESS_DATE || '2026-10-22'
  ): Promise<BatchSummary[]> {
    const formula = `AND({Worker} = '${worker}', DATETIME_FORMAT({Target Date}, 'YYYY-MM-DD') = '${targetDate}')`;

    // Fetch batches and tasks concurrently (Eliminating waterfalls)
    const [batches, tasks] = await Promise.all([
      this.client.fetchAll<BatchFields>('Batches', { filterByFormula: formula }),
      this.client.fetchAll<TaskFields>('Tasks'),
    ]);

    return batches.map((batch) =>
      BatchMetricsCalculator.computeBatchSummary(batch, tasks)
    );
  }

  /**
   * Retrieves batch details and sequentially sorted tasks
   */
  public async getBatchDetails(batchId: string): Promise<BatchDetailData> {
    // Parallel fetching for batch, tasks, and items
    const [batch, allTasks, items] = await Promise.all([
      this.client.fetchById<BatchFields>('Batches', batchId),
      this.client.fetchAll<TaskFields>('Tasks'),
      this.client.fetchAll<ItemFields>('Items'),
    ]);

    // O(1) indexed lookup map for items (js-index-maps rule)
    const itemsMap = new Map<string, ItemRecord>();
    items.forEach((item) => itemsMap.set(item.id, item));

    const batchTaskIds = new Set(batch.fields.Tasks || []);
    const batchTasks = allTasks.filter((t) => batchTaskIds.has(t.id));

    const taskDetails = BatchMetricsCalculator.mapTaskDetails(
      batchTasks,
      itemsMap,
      batch.fields.Tasks
    );
    const batchSummary = BatchMetricsCalculator.computeBatchSummary(batch, allTasks);

    return {
      batch: batchSummary,
      tasks: taskDetails,
    };
  }

  /**
   * Starts a batch after enforcing Rule 1 invariant
   */
  public async startBatch(batchId: string): Promise<{
    success: boolean;
    startedAt?: string;
    batch?: BatchRecord;
    error?: string;
  }> {
    // 1. Fetch current batch state from Airtable
    const currentBatch = await this.client.fetchById<BatchFields>('Batches', batchId);

    // 2. Enforce invariant: Cannot start an already-started batch
    const validation = ProductionRuleEngine.validateBatchStart(currentBatch);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 3. Save current real-time ISO timestamp
    const currentIso = new Date().toISOString();
    const updated = await this.client.patch<BatchFields>('Batches', batchId, {
      'Started At': currentIso,
    });

    return {
      success: true,
      startedAt: currentIso,
      batch: updated,
    };
  }

  /**
   * Completes a task after enforcing Rule 2 invariant
   */
  public async completeTask(taskId: string): Promise<{
    success: boolean;
    task?: TaskRecord;
    error?: string;
  }> {
    // 1. Fetch current task state from Airtable
    const currentTask = await this.client.fetchById<TaskFields>('Tasks', taskId);

    // 2. Enforce invariant: Cannot complete a task in LOCKED state
    const validation = ProductionRuleEngine.validateTaskComplete(currentTask);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 3. Mark Status as 'Done' in Airtable
    const updated = await this.client.patch<TaskFields>('Tasks', taskId, {
      Status: 'Done',
    });

    return {
      success: true,
      task: updated,
    };
  }
}

// Singleton instance for route handlers
export const batchService = new BatchService();
