export type TaskStatus = 'Not Started' | 'In Progress' | 'Done';
export type TaskState = 'LOCKED' | 'IN PROGRESS' | 'READY' | 'DONE';
export type UnifiedTaskStatus = 'Done' | 'In Progress' | 'Ready' | 'Locked';

export interface AirtableRecord<T> {
  id: string;
  createdTime?: string;
  fields: T;
}

export interface BatchFields {
  'Batch Name': string;
  Worker: string;
  'Target Date': string;
  'Started At'?: string;
  'Ended At'?: string;
  Tasks?: string[];
}

export interface TaskFields {
  'Task Name': string;
  Sequence: number;
  Status: TaskStatus;
  Item?: string[];
  Batch?: string[];
  'Item Level'?: number[];
  'Task State': TaskState;
}

export interface ItemFields {
  'Item ID'?: string;
  Name: string;
  Service?: string;
  Delicate?: boolean;
  'Due Date'?: string;
  Tasks?: string[];
  'Done Count'?: number;
}

export type BatchRecord = AirtableRecord<BatchFields>;
export type TaskRecord = AirtableRecord<TaskFields>;
export type ItemRecord = AirtableRecord<ItemFields>;

export interface BatchSummary {
  id: string;
  name: string;
  worker: string;
  targetDate: string;
  startedAt?: string;
  endedAt?: string;
  hasStarted: boolean;
  isCompleted: boolean;
  totalTasks: number;
  completedTasks: number;
  taskIds: string[];
}

export interface TaskDetail {
  id: string;
  name: string;
  queueNumber: number; // Strictly sequential batch position (#1, #2, #3, ...)
  stepNumber: number; // Workflow step for this shoe/item (e.g. 1, 2, 3...)
  sequence: number; // Backward compatibility
  actionName: string; // e.g. "Dismantling and Prep"
  taskCode: string; // e.g. "T119"
  unifiedStatus: UnifiedTaskStatus; // Authoritative single status
  status: TaskStatus;
  taskState: TaskState;
  itemId?: string;
  itemName: string;
  itemNotes?: string; // Specific handling / material notes separated from item title
  itemService?: string;
  isLocked: boolean;
  isDone: boolean;
  canMarkDone: boolean;
}

export interface BatchDetailData {
  batch: BatchSummary;
  tasks: TaskDetail[];
}
