'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import CategoryDonutChart from '@/components/CategoryDonutChart';
import MonthlyBarChart from '@/components/MonthlyBarChart';
import BudgetProgressBar from '@/components/BudgetProgressBar';
import TransactionTable from '@/components/TransactionTable';
import TransactionModal from '@/components/TransactionModal';
import { Transaction, AnalyticsSummary } from '@/types';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  Sparkles,
  ArrowRight,
  Bot
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch Analytics (contains SQLite real computations)
      const analyticsRes = await fetch('/api/analytics');
      const analyticsData = await analyticsRes.json();
      if (analyticsData.summary) {
        setSummary(analyticsData.summary);
      }

      // Fetch Recent Transactions
      const txRes = await fetch('/api/transactions?limit=10');
      const txData = await txRes.json();
      if (txData.transactions) {
        setTransactions(txData.transactions);
      }

      // Fetch Categories
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      if (catData.categories) {
        setCategories(catData.categories.map((c: any) => c.name));
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } fontFinally: {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header 
        onAddTransaction={() => {
          setEditingTransaction(null);
          setModalOpen(true);
        }}
        onRefreshData={fetchData}
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Income"
            value={summary?.totalIncome || 0}
            type="income"
            subtitle="All-time earnings logged"
            icon={TrendingUp}
          />
          <StatCard
            title="Total Expenses"
            value={summary?.totalExpenses || 0}
            type="expense"
            subtitle="All-time expenses logged"
            icon={TrendingDown}
          />
          <StatCard
            title="Current Balance"
            value={summary?.currentBalance || 0}
            type="balance"
            subtitle="Net total cash flow"
            icon={Wallet}
          />
          <StatCard
            title="Monthly Spending"
            value={summary?.monthlySpending || 0}
            type="neutral"
            subtitle="Current calendar month"
            icon={Calendar}
          />
        </div>

        {/* Dynamic Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Spending by Category Donut Chart (Real SQLite SUM query) */}
          <div className="lg:col-span-7">
            <CategoryDonutChart data={summary?.categoryBreakdown || []} />
          </div>

          {/* Monthly Income vs Expense Trend Bar Chart */}
          <div className="lg:col-span-5">
            <MonthlyBarChart data={summary?.monthlyBreakdown || []} />
          </div>
        </div>

        {/* AI Analyst Banner Teaser */}
        <div className="glass-card p-5 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                SpendSense AI Assistant <Sparkles className="w-4 h-4 text-purple-400" />
              </h4>
              <p className="text-xs text-slate-300">
                Ask <span className="text-indigo-300 font-semibold">"Where am I spending the most?"</span> or <span className="text-indigo-300 font-semibold">"Am I over budget?"</span> for DB-verified financial answers.
              </p>
            </div>
          </div>
          <Link
            href="/ai-analyst"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-500/20 flex items-center gap-1.5 shrink-0"
          >
            Launch AI Analyst <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Budget Progress & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <BudgetProgressBar budgets={summary?.budgetProgressList || []} limit={5} />
          </div>
          <div className="lg:col-span-7">
            <TransactionTable
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              categories={categories}
              limit={5}
              showFilters={false}
            />
          </div>
        </div>
      </main>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
        initialTransaction={editingTransaction}
      />
    </div>
  );
}
