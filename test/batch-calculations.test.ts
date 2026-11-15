import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { computeBatchSummary, filterBatches } from '../src/lib/airtable';
import { BatchRecord, TaskRecord } from '../src/types/airtable';

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

  test('correctly identifies a fully completed and started batch', () => {
    const batch = mockBatches.find((b) => b.id === 'recBatch4')!;
    const summary = computeBatchSummary(batch, mockTasks);

    assert.equal(summary.name, 'ANA-20261022-B');
    assert.equal(summary.totalTasks, 2);
    assert.equal(summary.completedTasks, 2); // t4 and t5 are Done
    assert.equal(summary.hasStarted, true);
    assert.equal(summary.isCompleted, true);
  });
});
