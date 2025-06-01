import { Task } from "./task.model";

export interface Phase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  projectId: string;
  taskIds: string[];
  phaseAccessIds: string[];
  createdAt: string;
}