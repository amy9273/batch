import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateBatchStart, validateTaskComplete } from '../src/lib/airtable';
import { BatchRecord, TaskRecord } from '../src/types/airtable';

describe('Backend Invariant Validation Tests (Mock Data)', () => {
  describe('Rule 1: Start Batch Validation', () => {
    test('blocks starting a batch that already has a Started At timestamp', () => {
      const mockStartedBatch: BatchRecord = {
        id: 'recBatch001',
        fields: {
          'Batch Name': 'ANA-20261022-B',
          Worker: 'Ana',
          'Target Date': '2026-10-22',
          'Started At': '2026-10-22T02:15:00.000Z',
          Tasks: ['recTask1', 'recTask2'],
        },
      };

      const result = validateBatchStart(mockStartedBatch);

      assert.equal(result.valid, false);
      assert.match(result.error || '', /already been started/i);
    });

    test('permits starting a batch that has no Started At value', () => {
      const mockUnstartedBatch: BatchRecord = {
        id: 'recBatch002',
        fields: {
          'Batch Name': 'ANA-20261022-A',
          Worker: 'Ana',
          'Target Date': '2026-10-22',
          'Started At': undefined,
          Tasks: ['recTask3', 'recTask4'],
        },
      };

      const result = validateBatchStart(mockUnstartedBatch);

      assert.equal(result.valid, true);
      assert.equal(result.error, undefined);
    });
  });

  describe('Rule 2: Complete Task Validation', () => {
    test('blocks marking a task as Done when Task State is LOCKED', () => {
      const mockLockedTask: TaskRecord = {
        id: 'recTaskLocked',
        fields: {
          'Task Name': 'T053 - Repainting - Hoka Mach X',
          Sequence: 3,
          Status: 'Not Started',
          'Task State': 'LOCKED',
          Item: ['recItem01'],
          Batch: ['recBatch01'],
        },
      };

      const result = validateTaskComplete(mockLockedTask);

      assert.equal(result.valid, false);
      assert.match(result.error || '', /LOCKED and cannot be marked Done/i);
    });

    test('blocks marking a task as Done when Status is already Done', () => {
      const mockDoneTask: TaskRecord = {
        id: 'recTaskDone',
        fields: {
          'Task Name': 'T050 - Sorting - Hoka Mach X',
          Sequence: 1,
          Status: 'Done',
          'Task State': 'DONE',
          Item: ['recItem01'],
          Batch: ['recBatch01'],
        },
      };

      const result = validateTaskComplete(mockDoneTask);

      assert.equal(result.valid, false);
      assert.match(result.error || '', /already been marked Done/i);
    });

    test('permits marking a task as Done when Task State is READY or IN PROGRESS', () => {
      const mockReadyTask: TaskRecord = {
        id: 'recTaskReady',
        fields: {
          'Task Name': 'T051 - Deep Cleaning - Hoka Mach X',
          Sequence: 1,
          Status: 'In Progress',
          'Task State': 'IN PROGRESS',
          Item: ['recItem01'],
          Batch: ['recBatch01'],
        },
      };

      const result = validateTaskComplete(mockReadyTask);

      assert.equal(result.valid, true);
      assert.equal(result.error, undefined);
    });
  });
});
