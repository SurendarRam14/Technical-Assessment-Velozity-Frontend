import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        // Task statuses
        todo: 'border-transparent bg-slate-500/15 text-slate-400 border-slate-500/30',
        inProgress: 'border-transparent bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        inReview: 'border-transparent bg-amber-500/15 text-amber-400 border-amber-500/30',
        done: 'border-transparent bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        // Priorities
        low: 'border-transparent bg-slate-500/15 text-slate-400',
        medium: 'border-transparent bg-blue-500/15 text-blue-400',
        high: 'border-transparent bg-amber-500/15 text-amber-400',
        critical: 'border-transparent bg-rose-500/15 text-rose-400 font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
