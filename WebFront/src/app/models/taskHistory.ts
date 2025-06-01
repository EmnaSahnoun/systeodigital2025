// Example of what TaskHistory interface might need
export interface TaskHistory {
  id: string;
  action: string;
  idUser?: string;
  username?: string; // Ensure this property exists
  createdAt: string | Date;
  // ... other properties
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  subTaskId?: string;
}
