import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Task, TaskStatus } from '../../types';
import { useUpdateTaskStatus } from '../../hooks/useUpdateTaskStatus';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, User as UserIcon, FolderKanban, Loader2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { mutate: updateStatus, isPending } = useUpdateTaskStatus();

  // Format priority badge variant
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'low';
      case 'MEDIUM': return 'medium';
      case 'HIGH': return 'high';
      case 'CRITICAL': return 'critical';
      default: return 'outline';
    }
  };

  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), 'MMM dd, yyyy')
    : null;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = e.target.value as TaskStatus;
    if (newStatus && newStatus !== task.status) {
      updateStatus({ id: task.id, status: newStatus });
    }
  };

  return (
    <Link to={`/tasks/${task.id}`} className="block group">
      <Card className="glass-card hover:border-primary/40 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-primary/5 hover:-translate-y-0.5 relative">
        <CardContent className="p-4 space-y-3">
          {/* Top Row: Interactive Status Selector & Badges */}
          <div className="flex items-center justify-between gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Interactive Status Selector */}
              <div className="relative inline-flex items-center" onClick={(e) => e.stopPropagation()}>
                <select
                  value={task.status}
                  onChange={handleStatusChange}
                  disabled={isPending}
                  className="h-6 text-[11px] font-bold uppercase rounded-md border border-input bg-secondary/80 px-2 py-0.5 text-secondary-foreground hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer transition-all disabled:opacity-50"
                  title="Change task status"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                </select>
                {isPending && (
                  <Loader2 className="w-3 h-3 ml-1 animate-spin text-primary shrink-0" />
                )}
              </div>

              <Badge variant={getPriorityVariant(task.priority) as any} className="text-[10px] font-semibold">
                {task.priority}
              </Badge>
            </div>

            {/* Overdue Badge (read strictly from API, never computed client-side) */}
            {task.isOverdue && (
              <Badge
                variant="destructive"
                className="text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 animate-pulse border border-rose-500/50 bg-rose-500/25 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
              >
                <AlertTriangle className="w-3 h-3 shrink-0 text-rose-400" />
                <span>OVERDUE</span>
              </Badge>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Bottom Metadata */}
          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground gap-2 flex-wrap">
            {/* Assignee */}
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-[9px] font-bold shrink-0">
                {task.assignee ? task.assignee.name.charAt(0) : <UserIcon className="w-3 h-3" />}
              </div>
              <span className="truncate max-w-[110px]">
                {task.assignee ? task.assignee.name : 'Unassigned'}
              </span>
            </div>

            {/* Due Date & Project */}
            <div className="flex items-center gap-3 shrink-0">
              {task.project && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80">
                  <FolderKanban className="w-3 h-3" />
                  <span className="truncate max-w-[90px]">{task.project.name}</span>
                </div>
              )}

              {formattedDueDate && (
                <div className={`flex items-center gap-1 ${task.isOverdue ? 'text-rose-400 font-semibold' : ''}`}>
                  <Calendar className="w-3 h-3" />
                  <span>{formattedDueDate}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
