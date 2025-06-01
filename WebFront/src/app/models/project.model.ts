import { Phase } from "./phase.model";

export interface Project {
  _id?: string;
  name: string;
  description?: string;
  createdAt?: Date;
  phases?: Phase[];
}
