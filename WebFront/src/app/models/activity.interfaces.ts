export interface CommentResponse {
  id: string;
  taskId: string;
  idUser: string;
  username: string;
  content: string;
  createdAt: string | Date; // Depending on how you handle dates
}

export interface TaskHistory {

  id: string;
  taskId: string;
  subTaskId: string | null;
  idUser: string;
  username: string | null;
  action: 'COMMENT' | 'UPDATE' | 'DELETE' | 'CREATE';
  fieldChanged: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  historyType:string
}


export interface CommentRequest {
  taskId: string;
  idUser: string;
  username: string;
  content: string;
}