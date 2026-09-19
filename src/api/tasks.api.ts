import { api } from './axios';
import { Task, TaskStatus, Priority } from '../types';

export interface TaskFilters {
  status?: TaskStatus | string;
  priority?: Priority | string;
  dueFrom?: string;
  dueTo?: string;
  projectId?: string;
}

export const tasksApi = {
  list: async (filters: TaskFilters = {}): Promise<Task[]> => {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.dueFrom) params.append('dueFrom', filters.dueFrom);
    if (filters.dueTo) params.append('dueTo', filters.dueTo);
    if (filters.projectId) params.append('projectId', filters.projectId);

    const response = await api.get<{ tasks: Task[] } | Task[]>('/tasks', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).tasks || [];
  },

  getById: async (id: string): Promise<Task> => {
    const response = await api.get<{ task: Task } | Task>(`/tasks/${id}`);
    const data = response.data;
    return (data as any).task || (data as Task);
  },

  updateStatus: async (id: string, status: TaskStatus): Promise<{ task: Task; activityLog: any }> => {
    const response = await api.patch<{ task: Task; activityLog: any }>(`/tasks/${id}/status`, { status });
    return response.data;
  },
};
