import {
  AirtableRecord,
  BatchDetailData,
  BatchFields,
  BatchRecord,
  BatchSummary,
  ItemFields,
  ItemRecord,
  TaskDetail,
  TaskFields,
  TaskRecord,
} from '@/types/airtable';

const AIRTABLE_API_URL = 'https://api.airtable.com/v0';

function getCredentials() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    throw new Error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in environment variables.');
  }

  return { apiKey, baseId };
}

/**
 * Pure validation function for starting a batch.
 * Invariant: A batch with a Started At value cannot be started again.
 */
export function validateBatchStart(batch: BatchRecord): { valid: boolean; error?: string } {
  if (batch.fields['Started At']) {
    return {
      valid: false,
      error: `Batch "${batch.fields['Batch Name'] || batch.id}" has already been started at ${batch.fields['Started At']}.`,
    };
  }
  return { valid: true };
}

/**
 * Pure validation function for completing a task.
 * Invariant: A task whose Task State is LOCKED cannot be marked Done.
 */
export function validateTaskComplete(task: TaskRecord): { valid: boolean; error?: string } {
  if (task.fields['Task State'] === 'LOCKED') {
    return {
      valid: false,
      error: `Task "${task.fields['Task Name'] || task.id}" is LOCKED and cannot be marked Done.`,
    };
  }
  return { valid: true };
}

/**
 * Pure function to filter batches by Worker and Target Date.
 */
export function filterBatches(
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
 * Pure function to compute batch summary metrics.
 */
export function computeBatchSummary(
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
 * Generic Airtable fetch helper with offset pagination
 */
async function fetchAllRecords<T>(
  table: string,
  params: Record<string, string> = {}
): Promise<AirtableRecord<T>[]> {
  const { apiKey, baseId } = getCredentials();
  let offset: string | undefined = undefined;
  const allRecords: AirtableRecord<T>[] = [];

  do {
    const query = new URLSearchParams({
      pageSize: '100',
      ...params,
    });
    if (offset) {
      query.set('offset', offset);
    }

    const url = `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(table)}?${query.toString()}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Airtable fetch failed for table "${table}": ${res.status} ${errText}`);
    }

    const data = await res.json();
    allRecords.push(...data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

/**
 * Fetch a single record by ID
 */
async function fetchRecordById<T>(table: string, recordId: string): Promise<AirtableRecord<T>> {
  const { apiKey, baseId } = getCredentials();
  const url = `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(table)}/${recordId}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch ${table} record ${recordId}: ${res.status} ${errText}`);
  }

  return res.json();
}

/**
 * Update (PATCH) a single record
 */
async function patchRecord<T>(
  table: string,
  recordId: string,
  fields: Partial<T>
): Promise<AirtableRecord<T>> {
  const { apiKey, baseId } = getCredentials();
  const url = `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(table)}/${recordId}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update ${table} record ${recordId}: ${res.status} ${errText}`);
  }

  return res.json();
}

/**
 * API: Get Batches for Worker on Target Date
 */
export async function getBatchesForWorker(
  worker: string = process.env.DEFAULT_WORKER || 'Ana',
  targetDate: string = process.env.DEFAULT_BUSINESS_DATE || '2026-10-22'
): Promise<BatchSummary[]> {
  const formula = `AND({Worker} = '${worker}', DATETIME_FORMAT({Target Date}, 'YYYY-MM-DD') = '${targetDate}')`;

  // Fetch batches and tasks in parallel
  const [batches, tasks] = await Promise.all([
    fetchAllRecords<BatchFields>('Batches', { filterByFormula: formula }),
    fetchAllRecords<TaskFields>('Tasks'),
  ]);

  return batches.map((batch) => computeBatchSummary(batch, tasks));
}

/**
 * API: Get Batch Details and its Tasks (with resolved Item Names)
 */
export async function getBatchDetails(batchId: string): Promise<BatchDetailData> {
  const [batch, allTasks, items] = await Promise.all([
    fetchRecordById<BatchFields>('Batches', batchId),
    fetchAllRecords<TaskFields>('Tasks'),
    fetchAllRecords<ItemFields>('Items'),
  ]);

  const itemsMap = new Map<string, ItemRecord>();
  items.forEach((item: ItemRecord) => itemsMap.set(item.id, item));

  const batchTaskIds = new Set(batch.fields.Tasks || []);
  const batchTasks = allTasks.filter((t: TaskRecord) => batchTaskIds.has(t.id));

  // Sort tasks by Sequence ascending
  batchTasks.sort((a: TaskRecord, b: TaskRecord) => (a.fields.Sequence || 0) - (b.fields.Sequence || 0));

  const taskDetails: TaskDetail[] = batchTasks.map((t: TaskRecord) => {
    const linkedItemId = t.fields.Item && t.fields.Item[0];
    const linkedItem = linkedItemId ? itemsMap.get(linkedItemId) : undefined;

    // Item name fallback: If item not found, try parsing from Task Name (e.g. "T053 - Repainting - Hoka Mach X")
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
      itemName: itemName || 'Unknown Item',
      itemService: linkedItem?.fields.Service,
      isLocked,
      isDone,
      canMarkDone: !isLocked && !isDone,
    };
  });

  const batchSummary = computeBatchSummary(batch, allTasks);

  return {
    batch: batchSummary,
    tasks: taskDetails,
  };
}

/**
 * API: Start Batch (with backend validation invariant)
 */
export async function startBatch(batchId: string): Promise<{
  success: boolean;
  startedAt?: string;
  batch?: BatchRecord;
  error?: string;
}> {
  // 1. Fetch current batch state from Airtable to verify invariant
  const currentBatch = await fetchRecordById<BatchFields>('Batches', batchId);

  // 2. Enforce invariant: A batch with a Started At value cannot be started again
  const validation = validateBatchStart(currentBatch);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  // 3. Save actual current date and time (ISO format)
  const currentIso = new Date().toISOString();
  const updated = await patchRecord<BatchFields>('Batches', batchId, {
    'Started At': currentIso,
  });

  return {
    success: true,
    startedAt: currentIso,
    batch: updated,
  };
}

/**
 * API: Complete Task (with backend validation invariant)
 */
export async function completeTask(taskId: string): Promise<{
  success: boolean;
  task?: TaskRecord;
  error?: string;
}> {
  // 1. Fetch current task state from Airtable to verify invariant
  const currentTask = await fetchRecordById<TaskFields>('Tasks', taskId);

  // 2. Enforce invariant: A task whose Task State is LOCKED cannot be marked Done
  const validation = validateTaskComplete(currentTask);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  // 3. Mark Status as 'Done' in Airtable
  const updated = await patchRecord<TaskFields>('Tasks', taskId, {
    Status: 'Done',
  });

  return {
    success: true,
    task: updated,
  };
}
