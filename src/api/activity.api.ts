import { api } from './axios';
import { ActivityLog } from '../types';

export interface ActivityListParams {
  projectId?: string;
  since?: string;
  limit?: number;
}

export const activityApi = {
  list: async (params: ActivityListParams = {}): Promise<ActivityLog[]> => {
    const query = new URLSearchParams();
    if (params.projectId) query.append('projectId', params.projectId);
    if (params.since) query.append('since', params.since);
    if (params.limit) query.append('limit', String(params.limit));

    const response = await api.get<{ activityLogs: ActivityLog[] } | ActivityLog[]>('/activity', { params: query });
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).activityLogs || [];
  },
};
