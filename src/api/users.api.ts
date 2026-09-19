import { api } from './axios';
import { User, Role } from '../types';

export const usersApi = {
  list: async (role?: Role): Promise<User[]> => {
    const params = role ? { role } : undefined;
    const response = await api.get<{ users: User[] } | User[]>('/users', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).users || [];
  },
};
