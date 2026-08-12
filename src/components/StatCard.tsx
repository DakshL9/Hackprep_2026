'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  type?: 'income' | 'expense' | 'neutral' | 'balance';
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
}

export default function StatCard({ title, value, type = 'neutral', subtitle, icon: Icon, badge }: StatCardProps) {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);

  const getTheme = () => {
    switch (type) {
      case 'income':
        return {
          bg: 'from-emerald-500/10 to-emerald-950/20 border-emerald-500/30',
          iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          text: 'text-emerald-400',
        };
      case 'expense':
        return {
          bg: 'from-rose-500/10 to-rose-950/20 border-rose-500/30',
          iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          text: 'text-rose-400',
        };
      case 'balance':
        return {
          bg: 'from-indigo-500/10 to-purple-950/20 border-indigo-500/30',
          iconBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
          text: value >= 0 ? 'text-indigo-400' : 'text-rose-400',
        };
      default:
        return {
          bg: 'from-slate-800/40 to-slate-900/60 border-slate-800',
          iconBg: 'bg-slate-800 text-slate-300 border-slate-700',
          text: 'text-slate-100',
        };
    }
  };

  const theme = getTheme();

  return (
    <div className={`glass-card glass-card-hover bg-gradient-to-br ${theme.bg} p-5 rounded-2xl border relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border ${theme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.text}`}>
          {formattedValue}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>

      {badge && (
        <span className="absolute top-3 right-12 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
          {badge}
        </span>
      )}
    </div>
  );
}
