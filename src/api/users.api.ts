import { api } from './axios';
import { User, Role } from '../types';

export interface UserFilters {
  role?: Role | 'ALL' | string;
  search?: string;
}

export const usersApi = {
  list: async (filtersOrRole?: UserFilters | Role | string): Promise<User[]> => {
    const params: Record<string, string> = {};

    if (typeof filtersOrRole === 'string') {
      if (filtersOrRole !== 'ALL') {
        params.role = filtersOrRole;
      }
    } else if (filtersOrRole) {
      if (filtersOrRole.role && filtersOrRole.role !== 'ALL') {
        params.role = filtersOrRole.role;
      }
      if (filtersOrRole.search && filtersOrRole.search.trim()) {
        params.search = filtersOrRole.search.trim();
      }
    }

    const response = await api.get<{ users: User[] } | User[]>('/users', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).users || [];
  },
};
