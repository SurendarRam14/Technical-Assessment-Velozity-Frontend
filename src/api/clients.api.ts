import { api } from './axios';
import { Client } from '../types';

export const clientsApi = {
  list: async (): Promise<Client[]> => {
    const response = await api.get<{ clients: Client[] } | Client[]>('/clients');
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).clients || [];
  },
};
