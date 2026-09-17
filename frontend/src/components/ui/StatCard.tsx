import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'sky' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'sky',
  onClick,
}) => {
  const iconColors = {
    sky: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    amber: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    rose: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
    purple: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    slate: 'text-slate-300 bg-slate-800 border-slate-700',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-[#111827] border border-slate-800 hover:border-sky-500/50 rounded-2xl p-6 transition-all duration-200 shadow-xl ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-3 rounded-xl border shadow-lg ${iconColors[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-white tracking-tight font-sans">{value}</span>
        {trend && (
          <span
            className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
              trend.isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
            }`}
          >
            {trend.isPositive ? '▲ ' : '▼ '} {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-2 text-xs text-slate-400 leading-normal">{subtitle}</p>}
    </div>
  );
};
