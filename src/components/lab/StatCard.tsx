import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number; // positive = up, negative = down
  trendLabel?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'destructive';
  className?: string;
}

const variantConfig = {
  default: {
    card: 'bg-card',
    icon: 'bg-muted text-muted-foreground',
    value: 'text-foreground',
  },
  primary: {
    card: 'bg-primary text-primary-foreground',
    icon: 'bg-primary-foreground/20 text-primary-foreground',
    value: 'text-primary-foreground',
  },
  success: {
    card: 'bg-card',
    icon: 'bg-success/15 text-success',
    value: 'text-foreground',
  },
  warning: {
    card: 'bg-card',
    icon: 'bg-warning/15 text-warning',
    value: 'text-foreground',
  },
  info: {
    card: 'bg-card',
    icon: 'bg-info/15 text-info',
    value: 'text-foreground',
  },
  destructive: {
    card: 'bg-card',
    icon: 'bg-destructive/15 text-destructive',
    value: 'text-foreground',
  },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, trendLabel, variant = 'default', className }: StatCardProps) {
  const config = variantConfig[variant];
  const isPrimary = variant === 'primary';

  return (
    <Card className={cn('shadow-card p-5 border flex flex-col gap-4 transition-all duration-200 hover:shadow-elevated', config.card, className)}>
      <div className="flex items-start justify-between">
        <div className={cn('p-2.5 rounded-lg', config.icon)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            isPrimary
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : trend > 0
                ? 'bg-success/15 text-success'
                : trend < 0
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-muted text-muted-foreground'
          )}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className={cn('text-2xl font-bold tracking-tight', config.value)}>{value}</p>
        <p className={cn('text-sm font-medium mt-0.5', isPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{title}</p>
        {subtitle && (
          <p className={cn('text-xs mt-1', isPrimary ? 'text-primary-foreground/60' : 'text-muted-foreground/70')}>{subtitle}</p>
        )}
        {trendLabel && (
          <p className={cn('text-xs mt-1', isPrimary ? 'text-primary-foreground/60' : 'text-muted-foreground/70')}>{trendLabel}</p>
        )}
      </div>
    </Card>
  );
}
