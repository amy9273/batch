import { BatchRecord, TaskRecord } from '@/types/airtable';
import { BatchAlreadyStartedError, TaskLockedError } from '@/types/errors';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Domain Validator for Sole Surgeon Production Control System
 * Follows Single Responsibility Principle (SRP)
 */
export class ProductionRuleEngine {
  /**
   * Rule 1: A batch with a Started At value cannot be started again.
   */
  public static validateBatchStart(batch: BatchRecord): ValidationResult {
    if (batch.fields['Started At']) {
      const err = new BatchAlreadyStartedError(
        batch.fields['Batch Name'] || batch.id,
        batch.fields['Started At']
      );
      return { valid: false, error: err.message };
    }
    return { valid: true };
  }

  /**
   * Rule 2: A task whose Task State is LOCKED cannot be marked Done.
   * Also ensures an already completed task cannot be completed again.
   */
  public static validateTaskComplete(task: TaskRecord): ValidationResult {
    if (task.fields.Status === 'Done') {
      return {
        valid: false,
        error: `Task "${task.fields['Task Name'] || task.id}" has already been marked Done.`,
      };
    }
    if (task.fields['Task State'] === 'LOCKED') {
      const err = new TaskLockedError(task.fields['Task Name'] || task.id);
      return { valid: false, error: err.message };
    }
    return { valid: true };
  }
}

// Backward-compatible standalone exports for existing test suites
export const validateBatchStart = ProductionRuleEngine.validateBatchStart;
export const validateTaskComplete = ProductionRuleEngine.validateTaskComplete;
