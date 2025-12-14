import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, trend, iconColor = 'text-accent-primary' }: StatCardProps) {
    return (
        <div className="stat-card bg-white">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="stat-label text-neutral-700">{title}</p>
                    <p className="stat-value mt-2 text-neutral-900">{value}</p>
                    {trend && (
                        <p className={cn(
                            'text-sm mt-2 flex items-center gap-1',
                            trend.isPositive ? 'text-success' : 'text-error'
                        )}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-neutral-500">vs mês anterior</span>
                        </p>
                    )}
                </div>
                <div className={cn('p-3 rounded-lg bg-white border border-neutral-300', iconColor)}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}
