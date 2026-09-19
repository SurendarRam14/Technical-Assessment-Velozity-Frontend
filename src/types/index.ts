export type Role = 'ADMIN' | 'PM' | 'DEVELOPER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  projects?: Project[];
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  client?: Client;
  pmId: string;
  pm?: User;
  createdAt: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  projectId: string;
  project?: Project;
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  assignee?: User | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  task?: {
    id: string;
    title: string;
    projectId: string;
  };
  projectId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  fromStatus?: TaskStatus | null;
  toStatus: TaskStatus;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  taskId?: string | null;
  task?: {
    id: string;
    title: string;
    projectId: string;
  } | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
