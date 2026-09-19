import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks.api';
import { TaskStatus } from '../types';

export interface UpdateTaskStatusArgs {
  id: string;
  status: TaskStatus;
}

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: UpdateTaskStatusArgs) => tasksApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      // Invalidate relevant queries so the UI updates with fresh data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
