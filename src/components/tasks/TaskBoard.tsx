import React from 'react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { Badge } from '@/components/ui/badge';

interface TaskBoardProps {
  tasks: Task[];
  isLoading?: boolean;
}

interface ColumnConfig {
  status: TaskStatus;
  title: string;
  colorClass: string;
  badgeVariant: 'todo' | 'inProgress' | 'inReview' | 'done';
}

const COLUMNS: ColumnConfig[] = [
  {
    status: 'TODO',
    title: 'To Do',
    colorClass: 'bg-slate-400',
    badgeVariant: 'todo',
  },
  {
    status: 'IN_PROGRESS',
    title: 'In Progress',
    colorClass: 'bg-cyan-400',
    badgeVariant: 'inProgress',
  },
  {
    status: 'IN_REVIEW',
    title: 'In Review',
    colorClass: 'bg-amber-400',
    badgeVariant: 'inReview',
  },
  {
    status: 'DONE',
    title: 'Done',
    colorClass: 'bg-emerald-400',
    badgeVariant: 'done',
  },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, isLoading = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div key={col.status} className="flex flex-col rounded-xl bg-card/40 border border-border/60 p-3 space-y-3 min-h-[400px]">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.colorClass}`} />
                <h3 className="font-bold text-sm text-foreground tracking-tight">{col.title}</h3>
              </div>
              <Badge variant={col.badgeVariant} className="text-[11px] font-bold px-2 py-0">
                {columnTasks.length}
              </Badge>
            </div>

            {/* Column Tasks */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((idx) => (
                    <div key={idx} className="h-28 rounded-xl bg-secondary/30 animate-pulse" />
                  ))}
                </div>
              ) : columnTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center border border-dashed border-border/40 rounded-xl text-xs text-muted-foreground/60 italic">
                  No tasks
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
