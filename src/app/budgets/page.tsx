'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import TransactionModal from '@/components/TransactionModal';
import { Target, Plus, Tag, AlertTriangle, Trash2, CheckCircle } from 'lucide-react';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [bRes, cRes] = await Promise.all([
        fetch('/api/budgets'),
        fetch('/api/categories'),
      ]);

      const bData = await bRes.json();
      const cData = await cRes.json();

      if (bData.budgets) setBudgets(bData.budgets);
      if (cData.categories) {
        setCategories(cData.categories);
        if (cData.categories.length > 0 && !selectedCategory) {
          setSelectedCategory(cData.categories[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load budgets & categories', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(budgetAmount);
    if (isNaN(amt) || amt < 0 || !selectedCategory) return;

    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory, amount: amt }),
      });

      if (res.ok) {
        setMessage(`Budget cap for ${selectedCategory} updated to $${amt.toFixed(2)}`);
        setBudgetAmount('');
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to set budget', err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (res.ok) {
        setMessage(`New category "${newCategoryName.trim()}" created!`);
        setNewCategoryName('');
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add category');
      }
    } catch (err) {
      console.error('Failed to add category', err);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Cannot delete category in use');
      }
    } catch (err) {
      console.error('Failed to delete category', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        onAddTransaction={() => setModalOpen(true)}
        onRefreshData={fetchData}
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Set Budget Form Card */}
          <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Configure Category Budget</h3>
                <p className="text-xs text-slate-400">Set monthly spending limits for categories</p>
              </div>
            </div>

            <form onSubmit={handleSetBudget} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Monthly Limit ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white gradient-emerald hover:opacity-90 transition shadow-lg shadow-emerald-500/20"
              >
                Save Category Budget
              </button>
            </form>
          </div>

          {/* Add Category Form Card */}
          <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Add New Category</h3>
                <p className="text-xs text-slate-400">Expand your category taxonomy</p>
              </div>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Fitness, Software, Pet Care"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-500/20"
              >
                Create Category
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 mb-2">Existing System Categories ({categories.length})</h4>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {categories.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    {c.name}
                    <button
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      className="text-slate-500 hover:text-rose-400 transition"
                      title="Delete category"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Budgets Overview Grid */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" /> Current Month Budget Utilization
          </h3>

          {budgets.length === 0 ? (
            <p className="text-xs text-slate-400">No category limits set yet. Use the form above to add your first budget limit.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map((b) => {
                const isOver = b.isOverBudget;
                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl border ${
                      isOver
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                      <span>{b.category}</span>
                      {isOver && (
                        <span className="text-[10px] text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Over Cap
                        </span>
                      )}
                    </div>

                    <div className="text-xl font-extrabold text-white mb-1">
                      ${b.spentAmount.toFixed(2)}{' '}
                      <span className="text-xs text-slate-400 font-normal">/ ${b.budgetAmount.toFixed(2)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver ? 'bg-rose-500' : b.percentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>{b.percentage}% consumed</span>
                      <span>${b.remaining.toFixed(2)} left</span>
                    </div>
                  </div>
                );
              })}
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
