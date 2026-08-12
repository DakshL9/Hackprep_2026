'use client';

import { useState } from 'react';
import { Plus, Database, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  onAddTransaction: () => void;
  onRefreshData?: () => void;
}

export default function Header({ onAddTransaction, onRefreshData }: HeaderProps) {
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      setSeedMessage(null);
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSeedMessage('Demo data loaded successfully!');
        if (onRefreshData) onRefreshData();
        setTimeout(() => setSeedMessage(null), 3000);
      } else {
        setSeedMessage(data.error || 'Failed to seed');
      }
    } catch (err) {
      setSeedMessage('Network error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 glass-card border-b border-slate-800/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Overview & Analytics</h2>
        <p className="text-xs text-slate-400">Track earnings, expenses, budgets & AI insights in real-time</p>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {seedMessage && (
          <div className="text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {seedMessage}
          </div>
        )}

        <button
          onClick={handleSeedDemo}
          disabled={seeding}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition flex items-center gap-2 shrink-0 disabled:opacity-50"
          title="Populate demo transactions & budget limits"
        >
          <Database className={`w-3.5 h-3.5 text-indigo-400 ${seeding ? 'animate-spin' : ''}`} />
          {seeding ? 'Seeding...' : 'Seed Demo Data'}
        </button>

        <button
          onClick={onAddTransaction}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white gradient-emerald hover:opacity-90 transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Transaction
        </button>
      </div>
    </header>
  );
}
