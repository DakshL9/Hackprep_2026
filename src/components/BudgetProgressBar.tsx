'use client';

import { BudgetProgress } from '@/types';
import { AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface BudgetProgressBarProps {
  budgets: BudgetProgress[];
  limit?: number;
}

export default function BudgetProgressBar({ budgets, limit = 5 }: BudgetProgressBarProps) {
  const displayed = budgets.slice(0, limit);

  if (!budgets || budgets.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center">
        <Target className="w-6 h-6 text-slate-500 mx-auto mb-2" />
        <p className="text-xs text-slate-400">No monthly budgets configured yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Budget Progress & Caps
          </h3>
          <p className="text-xs text-slate-400">Category limits vs. real-time SQLite spent totals</p>
        </div>
        <span className="text-xs font-medium text-slate-400">Current Month</span>
      </div>

      <div className="space-y-4">
        {displayed.map((b) => {
          const isOver = b.isOverBudget;
          const barColor = isOver 
            ? 'bg-rose-500 shadow-rose-500/30' 
            : b.percentage > 85 
            ? 'bg-amber-500 shadow-amber-500/30' 
            : 'bg-emerald-500 shadow-emerald-500/30';

          return (
            <div key={b.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{b.category}</span>
                  {isOver ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Over Budget
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ${b.remaining.toFixed(0)} left
                    </span>
                  )}
                </div>
                <div className="font-semibold text-slate-300">
                  ${b.spentAmount.toFixed(0)} / <span className="text-slate-400">${b.budgetAmount.toFixed(0)}</span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 shadow-md ${barColor}`}
                  style={{ width: `${Math.min(100, b.percentage)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
