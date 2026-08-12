'use client';

import { MonthlySpending } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface MonthlyBarChartProps {
  data: MonthlySpending[];
}

export default function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[300px] text-center">
        <BarChart3 className="w-8 h-8 text-slate-500 mb-2" />
        <h3 className="text-sm font-semibold text-slate-300">No Monthly History</h3>
        <p className="text-xs text-slate-400">Transactions over multiple months will populate this trend chart.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <div className="font-bold text-white mb-1.5">{label}</div>
          <div className="text-emerald-400 font-semibold flex items-center justify-between gap-4">
            <span>Income:</span>
            <span>${payload[0].value?.toFixed(2)}</span>
          </div>
          <div className="text-rose-400 font-semibold flex items-center justify-between gap-4">
            <span>Expense:</span>
            <span>${payload[1].value?.toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Income vs. Expenses Trend
          </h3>
          <p className="text-xs text-slate-400">Monthly aggregate breakdown from SQLite</p>
        </div>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
            />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
