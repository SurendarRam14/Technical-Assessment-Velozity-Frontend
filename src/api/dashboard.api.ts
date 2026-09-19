import { api } from './axios';
import { ActivityLog, Priority, Task, TaskStatus } from '../types';

export interface AdminDashboardData {
  totals: {
    totalProjects: number;
    totalTasks: number;
    totalClients: number;
    totalUsers: number;
    overdueTasksCount: number;
    onlineUsersCount: number;
  };
  tasksByStatus: Record<TaskStatus, number>;
  recentActivity: ActivityLog[];
}

export interface PmProjectSummary {
  id: string;
  name: string;
  client: { id: string; name: string } | null;
  createdAt: string;
  taskCounts: {
    total: number;
    todo: number;
    inProgress: number;
    inReview: number;
    done: number;
    overdue: number;
  };
  progressPercentage: number;
}

export interface PmDashboardData {
  totals: {
    totalProjects: number;
    totalTasks: number;
    overdueTasksCount: number;
    dueThisWeekCount: number;
  };
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<Priority, number>;
  projects: PmProjectSummary[];
  recentActivity: ActivityLog[];
}

export interface DeveloperDashboardData {
  totals: {
    totalAssignedTasks: number;
    overdueTasksCount: number;
    completedTasksCount: number;
  };
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<Priority, number>;
  assignedTasks: (Task & {
    project: {
      id: string;
      name: string;
      client: { id: string; name: string } | null;
    };
  })[];
}

export const dashboardApi = {
  getAdmin: async (): Promise<AdminDashboardData> => {
    const res = await api.get<AdminDashboardData>('/dashboard/admin');
    return res.data;
  },

  getPm: async (): Promise<PmDashboardData> => {
    const res = await api.get<PmDashboardData>('/dashboard/pm');
    return res.data;
  },

  getDeveloper: async (): Promise<DeveloperDashboardData> => {
    const res = await api.get<DeveloperDashboardData>('/dashboard/developer');
    return res.data;
  },
};
