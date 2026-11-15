import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { computeBatchSummary, filterBatches, BatchMetricsCalculator } from '../src/lib/airtable';
import { BatchRecord, TaskRecord, ItemRecord } from '../src/types/airtable';

describe('Batch Calculations & Filtering Tests (Mock Data)', () => {
  const mockBatches: BatchRecord[] = [
    {
      id: 'recBatch1',
      fields: {
        'Batch Name': 'ANA-20261021-A',
        Worker: 'Ana',
        'Target Date': '2026-10-21', // Different date
        Tasks: ['t1', 't2'],
      },
    },
    {
      id: 'recBatch2',
      fields: {
        'Batch Name': 'ANA-20261022-A',
        Worker: 'Ana',
        'Target Date': '2026-10-22', // Matching
        Tasks: ['t1', 't2', 't3'],
      },
    },
    {
      id: 'recBatch3',
      fields: {
        'Batch Name': 'BEN-20261022-A',
        Worker: 'Ben', // Different worker
        'Target Date': '2026-10-22',
        Tasks: ['t4'],
      },
    },
    {
      id: 'recBatch4',
      fields: {
        'Batch Name': 'ANA-20261022-B',
        Worker: 'Ana',
        'Target Date': '2026-10-22', // Matching
        'Started At': '2026-10-22T02:15:00.000Z',
        Tasks: ['t4', 't5'],
      },
    },
  ];

  const mockTasks: TaskRecord[] = [
    {
      id: 't1',
      fields: {
        'Task Name': 'Task 1',
        Sequence: 1,
        Status: 'Done',
        'Task State': 'DONE',
      },
    },
    {
      id: 't2',
      fields: {
        'Task Name': 'Task 2',
        Sequence: 2,
        Status: 'Done',
        'Task State': 'DONE',
      },
    },
    {
      id: 't3',
      fields: {
        'Task Name': 'Task 3',
        Sequence: 3,
        Status: 'Not Started',
        'Task State': 'IN PROGRESS',
      },
    },
    {
      id: 't4',
      fields: {
        'Task Name': 'Task 4',
        Sequence: 1,
        Status: 'Done',
        'Task State': 'DONE',
      },
    },
    {
      id: 't5',
      fields: {
        'Task Name': 'Task 5',
        Sequence: 2,
        Status: 'Done',
        'Task State': 'DONE',
      },
    },
  ];

  test('filters batches to only Ana on October 22, 2026', () => {
    const filtered = filterBatches(mockBatches, 'Ana', '2026-10-22');

    assert.equal(filtered.length, 2);
    assert.deepEqual(
      filtered.map((b) => b.fields['Batch Name']),
      ['ANA-20261022-A', 'ANA-20261022-B']
    );
  });

  test('correctly calculates total and completed tasks for a partially completed batch', () => {
    const batch = mockBatches.find((b) => b.id === 'recBatch2')!;
    const summary = computeBatchSummary(batch, mockTasks);

    assert.equal(summary.name, 'ANA-20261022-A');
    assert.equal(summary.totalTasks, 3);
    assert.equal(summary.completedTasks, 2); // t1, t2 are Done, t3 is Not Started
    assert.equal(summary.hasStarted, false);
    assert.equal(summary.isCompleted, false);
  });

  test('correctly maps task details with unique queue numbering and authoritative unified status', () => {
    const rawBatchTasks: TaskRecord[] = [
      {
        id: 'taskA',
        fields: {
          'Task Name': 'T119 - Dismantling and Prep - Nike AM90',
          Sequence: 1,
          Status: 'Done',
          'Task State': 'DONE',
        },
      },
      {
        id: 'taskB',
        fields: {
          'Task Name': 'T113 - Dismantling and Prep - Adidas POD-S 3.1',
          Sequence: 1,
          Status: 'Done',
          'Task State': 'DONE',
        },
      },
      {
        id: 'taskC',
        fields: {
          'Task Name': 'T115 - Parts Fabrication - Adidas POD-S 3.1',
          Sequence: 3,
          Status: 'Not Started',
          'Task State': 'IN PROGRESS',
        },
      },
      {
        id: 'taskD',
        fields: {
          'Task Name': 'T116 - Regluing - Adidas POD-S 3.1',
          Sequence: 4,
          Status: 'Not Started',
          'Task State': 'LOCKED',
        },
      },
    ];

    const itemsMap = new Map<string, ItemRecord>();
    const taskDetails = BatchMetricsCalculator.mapTaskDetails(rawBatchTasks, itemsMap, [
      'taskA',
      'taskB',
      'taskC',
      'taskD',
    ]);

    // 1. Verify strictly unique sequential queue numbers #1..#4
    assert.deepEqual(
      taskDetails.map((t) => t.queueNumber),
      [1, 2, 3, 4]
    );

    // 2. Verify authoritative single unified statuses
    assert.deepEqual(
      taskDetails.map((t) => t.unifiedStatus),
      ['Done', 'Done', 'In Progress', 'Locked']
    );

    // 3. Verify clean title separation (actionName and taskCode)
    assert.equal(taskDetails[0].actionName, 'Dismantling and Prep');
    assert.equal(taskDetails[0].taskCode, 'T113');
    assert.equal(taskDetails[0].itemName, 'Adidas POD-S 3.1');

    assert.equal(taskDetails[1].actionName, 'Dismantling and Prep');
    assert.equal(taskDetails[1].taskCode, 'T119');
    assert.equal(taskDetails[1].itemName, 'Nike AM90');

    // 4. Verify canMarkDone invariant
    assert.equal(taskDetails[0].canMarkDone, false); // Done
    assert.equal(taskDetails[1].canMarkDone, false); // Done
    assert.equal(taskDetails[2].canMarkDone, true); // In Progress (ready to complete)
    assert.equal(taskDetails[3].canMarkDone, false); // Locked (cannot complete)

    // 5. Verify lengthy description separation into clean itemName and itemNotes
    const descriptiveTask: TaskRecord = {
      id: 'taskDesc',
      fields: {
        'Task Name':
          'T026 - Deep Cleaning - Jordan 1 with worn contrasting panels, decorative stitching, mixed materials, a padded collar and custom laces requiring careful handling during cleaning, patching and repainting',
        Sequence: 1,
        Status: 'Done',
        'Task State': 'DONE',
      },
    };
    const mappedDesc = BatchMetricsCalculator.mapTaskDetails([descriptiveTask], itemsMap);
    assert.equal(mappedDesc[0].itemName, 'Jordan 1');
    assert.match(mappedDesc[0].itemNotes || '', /with worn contrasting panels/);
  });
});
