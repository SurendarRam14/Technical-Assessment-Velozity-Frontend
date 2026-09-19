import { api } from './axios';
import { Project } from '../types';

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const response = await api.get<{ projects: Project[] } | Project[]>('/projects');
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).projects || [];
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get<{ project: Project } | Project>(`/projects/${id}`);
    const data = response.data;
    return (data as any).project || (data as Project);
  },

  create: async (data: { name: string; clientId: string; pmId?: string }): Promise<Project> => {
    const response = await api.post<{ project: Project } | Project>('/projects', data);
    const resData = response.data;
    return (resData as any).project || (resData as Project);
  },

  createTask: async (
    projectId: string,
    data: {
      title: string;
      description?: string;
      assigneeId?: string;
      status?: string;
      priority?: string;
      dueDate?: string;
    }
  ) => {
    const response = await api.post(`/projects/${projectId}/tasks`, data);
    return response.data;
  },
};
