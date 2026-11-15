export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class BatchAlreadyStartedError extends DomainError {
  constructor(batchName: string, startedAt?: string) {
    super(`Batch "${batchName}" has already been started${startedAt ? ` at ${startedAt}` : ''}.`);
    this.name = 'BatchAlreadyStartedError';
  }
}

export class TaskLockedError extends DomainError {
  constructor(taskName: string) {
    super(`Task "${taskName}" is LOCKED and cannot be marked Done.`);
    this.name = 'TaskLockedError';
  }
}

export class RecordNotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with ID "${id}" was not found.`);
    this.name = 'RecordNotFoundError';
  }
}
