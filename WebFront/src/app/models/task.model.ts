export enum TaskStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELED = "CANCELED"
  }
  
  export enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
  }
  
  export interface Task {
    subtasks: any;
    attachments: any;
    activities: any;
    _id?: string;
    name: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    status: TaskStatus;
    priority: TaskPriority;
    phase: string; // ID de la phase
    subTasks?: Task[];
  }
  