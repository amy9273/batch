import {
  BatchRecord,
  BatchSummary,
  ItemRecord,
  TaskDetail,
  TaskRecord,
} from '@/types/airtable';

/**
 * Domain Calculator for Batch Summaries and Metrics
 * Encapsulates calculation rules and prevents duplication (DRY)
 */
export class BatchMetricsCalculator {
  /**
   * Filters batches by Worker and Target Date
   */
  public static filterBatches(
    batches: BatchRecord[],
    worker: string,
    targetDate: string
  ): BatchRecord[] {
    return batches.filter(
      (b) =>
        b.fields.Worker === worker &&
        b.fields['Target Date'] === targetDate
    );
  }

  /**
   * Computes summary metrics for a batch
   */
  public static computeBatchSummary(
    batch: BatchRecord,
    tasks: TaskRecord[]
  ): BatchSummary {
    const batchTaskIds = new Set(batch.fields.Tasks || []);
    const relevantTasks = tasks.filter((t) => batchTaskIds.has(t.id));

    const totalTasks = batch.fields.Tasks ? batch.fields.Tasks.length : 0;
    const completedTasks = relevantTasks.filter(
      (t) => t.fields.Status === 'Done'
    ).length;

    const hasStarted = Boolean(batch.fields['Started At']);
    const isCompleted = totalTasks > 0 && completedTasks === totalTasks;

    return {
      id: batch.id,
      name: batch.fields['Batch Name'],
      worker: batch.fields.Worker,
      targetDate: batch.fields['Target Date'],
      startedAt: batch.fields['Started At'],
      endedAt: batch.fields['Ended At'],
      hasStarted,
      isCompleted,
      totalTasks,
      completedTasks,
      taskIds: batch.fields.Tasks || [],
    };
  }

  /**
   * Maps raw tasks and items into sorted, clean TaskDetail presentation entities
   */
  public static mapTaskDetails(
    batchTasks: TaskRecord[],
    itemsMap: Map<string, ItemRecord>
  ): TaskDetail[] {
    // Sort tasks sequentially by sequence number ascending
    const sorted = [...batchTasks].sort(
      (a, b) => (a.fields.Sequence || 0) - (b.fields.Sequence || 0)
    );

    return sorted.map((t) => {
      const linkedItemId = t.fields.Item && t.fields.Item[0];
      const linkedItem = linkedItemId ? itemsMap.get(linkedItemId) : undefined;

      // Clean item name resolution
      let itemName = linkedItem?.fields.Name || '';
      if (!itemName && t.fields['Task Name']) {
        const parts = t.fields['Task Name'].split(' - ');
        if (parts.length >= 3) {
          itemName = parts.slice(2).join(' - ');
        }
      }

      const isLocked = t.fields['Task State'] === 'LOCKED';
      const isDone = t.fields.Status === 'Done';

      return {
        id: t.id,
        name: t.fields['Task Name'],
        sequence: t.fields.Sequence || 0,
        status: t.fields.Status,
        taskState: t.fields['Task State'],
        itemId: linkedItemId,
        itemName: itemName || 'General Restoration Item',
        itemService: linkedItem?.fields.Service,
        isLocked,
        isDone,
        canMarkDone: !isLocked && !isDone,
      };
    });
  }
}

// Standalone exports for backward compatibility and tests
export const computeBatchSummary = BatchMetricsCalculator.computeBatchSummary;
export const filterBatches = BatchMetricsCalculator.filterBatches;
