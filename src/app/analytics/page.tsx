'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import CategoryDonutChart from '@/components/CategoryDonutChart';
import MonthlyBarChart from '@/components/MonthlyBarChart';
import TransactionModal from '@/components/TransactionModal';
import { AnalyticsSummary } from '@/types';
import { 
  PieChart, 
  TrendingDown, 
  DollarSign, 
  Award, 
  AlertTriangle, 
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      console.error('Failed to load analytics data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        onAddTransaction={() => setModalOpen(true)}
        onRefreshData={fetchData}
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>AVERAGE EXPENSE</span>
              <DollarSign className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              ${summary?.averageSpending.toFixed(2) || '0.00'}
            </div>
            <p className="text-[11px] text-slate-400">Average transaction size</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>LARGEST EXPENSE</span>
              <Award className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-rose-400">
              ${summary?.largestTransaction?.amount.toFixed(2) || '0.00'}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {summary?.largestTransaction ? summary.largestTransaction.description : 'No expenses logged'}
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>HIGHEST CATEGORY</span>
              <PieChart className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-purple-300 truncate">
              {summary?.highestCategory?.category || 'None'}
            </div>
            <p className="text-[11px] text-slate-400">
              ${summary?.highestCategory?.amount.toFixed(2) || '0.00'} total spend
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>BUDGET OVERRUNS</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400">
              {summary?.overBudgetCategoriesCount || 0} Categories
            </div>
            <p className="text-[11px] text-slate-400">Exceeding monthly limit</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <CategoryDonutChart data={summary?.categoryBreakdown || []} />
          </div>
          <div className="lg:col-span-5">
            <MonthlyBarChart data={summary?.monthlyBreakdown || []} />
          </div>
        </div>

        {/* Over Budget Categories Breakdown Table */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Over-Budget Categories Audit
              </h3>
              <p className="text-xs text-slate-400">Real-time database comparison of caps vs expenses</p>
            </div>
          </div>

          {(!summary?.overBudgetCategories || summary.overBudgetCategories.length === 0) ? (
            <div className="p-8 text-center border border-slate-800 rounded-xl bg-slate-900/40">
              <p className="text-xs font-semibold text-emerald-400">🎉 No categories are currently over budget!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Budget Cap</th>
                    <th className="py-3 px-4">Real Spend</th>
                    <th className="py-3 px-4 text-right">Over Limit By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {summary.overBudgetCategories.map((ob) => (
                    <tr key={ob.category} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-white">{ob.category}</td>
                      <td className="py-3 px-4 text-slate-300">${ob.budgetAmount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-rose-400 font-bold">${ob.spentAmount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-rose-500">
                        +${(ob.spentAmount - ob.budgetAmount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
