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
   * Maps raw tasks and items into sorted, clean TaskDetail presentation entities.
   * Guarantees strictly unique batch queue numbering (#1..#N) and a single authoritative unifiedStatus.
   */
  public static mapTaskDetails(
    batchTasks: TaskRecord[],
    itemsMap: Map<string, ItemRecord>,
    batchTaskOrder?: string[]
  ): TaskDetail[] {
    // Sort tasks primarily by Sequence ascending (workflow step), then alphabetically by Task Name
    const sorted = [...batchTasks].sort((a, b) => {
      const seqDiff = (a.fields.Sequence || 0) - (b.fields.Sequence || 0);
      if (seqDiff !== 0) return seqDiff;
      return (a.fields['Task Name'] || '').localeCompare(b.fields['Task Name'] || '');
    });

    return sorted.map((t, index) => {
      const linkedItemId = t.fields.Item && t.fields.Item[0];
      const linkedItem = linkedItemId ? itemsMap.get(linkedItemId) : undefined;

      // Parse task title (e.g. "T119 - Dismantling and Prep - Nike AM90")
      const rawName = t.fields['Task Name'] || '';
      const parts = rawName.split(' - ');
      const taskCode = parts.length >= 2 ? parts[0].trim() : '';
      const actionName = parts.length >= 2 ? parts[1].trim() : rawName;

      // Clean item name resolution & separate lengthy notes (e.g. Jordan 1 with worn contrasting panels...)
      let rawItemName = linkedItem?.fields.Name || '';
      if (!rawItemName && parts.length >= 3) {
        rawItemName = parts.slice(2).join(' - ').trim();
      }

      let itemName = rawItemName;
      let itemNotes: string | undefined = undefined;

      const withKeywordIndex = rawItemName.indexOf(' with ');
      if (withKeywordIndex !== -1) {
        itemName = rawItemName.substring(0, withKeywordIndex).trim();
        const extracted = rawItemName.substring(withKeywordIndex + 1).trim();
        itemNotes = extracted.charAt(0).toUpperCase() + extracted.slice(1);
      }

      const isDone = t.fields.Status === 'Done' || t.fields['Task State'] === 'DONE';
      const isLocked = t.fields['Task State'] === 'LOCKED';
      const isInProgress = t.fields['Task State'] === 'IN PROGRESS';

      // Establish ONE authoritative status for clear, unambiguous communication
      let unifiedStatus: 'Done' | 'In Progress' | 'Ready' | 'Locked' = 'Ready';
      if (isDone) {
        unifiedStatus = 'Done';
      } else if (isLocked) {
        unifiedStatus = 'Locked';
      } else if (isInProgress) {
        unifiedStatus = 'In Progress';
      } else {
        unifiedStatus = 'Ready';
      }

      const stepNumber = t.fields.Sequence || 1;

      return {
        id: t.id,
        name: rawName,
        queueNumber: index + 1, // Strictly sequential 1..N within the batch
        stepNumber, // Step in the shoe restoration sequence
        sequence: stepNumber, // Backward compatibility
        actionName,
        taskCode,
        unifiedStatus,
        status: t.fields.Status,
        taskState: t.fields['Task State'],
        itemId: linkedItemId,
        itemName: itemName || 'General Restoration Item',
        itemNotes,
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
