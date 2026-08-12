'use client';

import { CategorySpending } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

interface CategoryDonutChartProps {
  data: CategorySpending[];
}

const COLORS = [
  '#6366f1', // Indigo
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#84cc16', // Lime
  '#14b8a6', // Teal
  '#a855f7', // Purple
  '#64748b', // Slate
];

export default function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const totalExpense = data.reduce((sum, item) => sum + item.total, 0);

  if (!data || data.length === 0 || totalExpense === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[340px] text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3">
          <PieIcon className="w-6 h-6 text-slate-500" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">No Expense Data</h3>
        <p className="text-xs text-slate-400 max-w-[240px] mt-1">
          Add expense transactions to see your spending breakdown by category.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as CategorySpending;
      return (
        <div className="bg-slate-900/95 backdrop-blur border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
          <div className="font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payload[0].color }}></span>
            {item.category}
          </div>
          <div className="text-slate-300 mt-1 font-semibold">
            Amount: <span className="text-emerald-400">${item.total.toFixed(2)}</span>
          </div>
          <div className="text-slate-400">
            Share: <span className="text-indigo-300 font-bold">{item.percentage}%</span> ({item.count} txns)
          </div>
        </div>
      );
    };
    return null;
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-400" />
            Spending by Category
          </h3>
          <p className="text-xs text-slate-400">Live SQLite query calculation (`SUM WHERE type='expense' GROUP BY category`)</p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          ${totalExpense.toFixed(2)} Total
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Donut Chart */}
        <div className="md:col-span-7 h-[240px] relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="total"
                nameKey="category"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="rgba(15, 23, 42, 0.8)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[11px] text-slate-400 font-medium">Categories</span>
            <span className="text-lg font-extrabold text-white">{data.length}</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="md:col-span-5 space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {data.map((item, index) => (
            <div 
              key={item.category} 
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center gap-2 truncate">
                <span 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                <span className="font-medium text-slate-200 truncate">{item.category}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-slate-100">${item.total.toFixed(0)}</span>
                <span className="text-[10px] text-slate-400 block font-medium">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
