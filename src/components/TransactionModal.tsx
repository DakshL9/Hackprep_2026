'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '@/types';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { X, DollarSign, Calendar, Tag, FileText, ArrowDownRight, ArrowUpRight, AlertCircle } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialTransaction?: Transaction | null;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  initialTransaction,
}: TransactionModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORIES[0]);
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<TransactionType>('expense');
  
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          const names = data.categories.map((c: any) => c.name);
          setCategories(names);
        }
      })
      .catch(() => {});

    if (initialTransaction) {
      setAmount(initialTransaction.amount.toString());
      setCategory(initialTransaction.category);
      setDescription(initialTransaction.description);
      setDate(initialTransaction.date);
      setType(initialTransaction.type);
    } else {
      setAmount('');
      setCategory(DEFAULT_CATEGORIES[0]);
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      setType('expense');
    }
    setError(null);
  }, [initialTransaction, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (!date) {
      setError('Date is required');
      return;
    }

    try {
      setLoading(true);
      const endpoint = initialTransaction ? `/api/transactions/${initialTransaction.id}` : '/api/transactions';
      const method = initialTransaction ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          category,
          description: description.trim(),
          date,
          type,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save transaction');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-lg rounded-2xl border border-slate-700/80 p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {initialTransaction ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                  type === 'expense'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/10'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                  type === 'income'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                Income
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Amount ($)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="e.g. Whole Foods Groceries, Rent, Salary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-emerald hover:opacity-90 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialTransaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
