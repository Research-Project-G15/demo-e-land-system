import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  variant = 'default' 
}: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-display text-3xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-300",
          variant === 'default' && "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
          variant === 'success' && "bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground",
          variant === 'warning' && "bg-warning/10 text-warning group-hover:bg-warning group-hover:text-warning-foreground",
          variant === 'danger' && "bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground",
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
