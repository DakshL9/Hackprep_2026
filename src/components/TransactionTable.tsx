'use client';

import { useState } from 'react';
import { Transaction } from '@/types';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Calendar,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: number) => void;
  categories: string[];
  limit?: number;
  showFilters?: boolean;
}

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  categories,
  limit,
  showFilters = true,
}: TransactionTableProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Filter transactions in memory
  const filtered = transactions.filter((tx) => {
    const matchesSearch = 
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;
    const matchesType = selectedType === 'All' || tx.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const displayed = limit ? filtered.slice(0, limit) : filtered;

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            Transaction History
          </h3>
          <p className="text-xs text-slate-400">
            Showing {displayed.length} of {transactions.length} recorded entries
          </p>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search entries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 appearance-none pr-8 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Filter className="w-3 h-3 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Type Filter */}
            <div className="relative shrink-0">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 appearance-none pr-8 cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="expense">Expenses Only</option>
                <option value="income">Income Only</option>
              </select>
              <Filter className="w-3 h-3 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Table Content */}
      {displayed.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl">
          <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-400">No matching transactions</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or click 'Add Transaction'.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Transaction</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {displayed.map((tx) => {
                const isExpense = tx.type === 'expense';
                return (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition group">
                    {/* Description & Icon */}
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isExpense
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {isExpense ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-semibold">{tx.description}</span>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        {tx.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {tx.date}
                    </td>

                    {/* Amount */}
                    <td
                      className={`py-3.5 px-4 text-right font-extrabold text-sm ${
                        isExpense ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}${tx.amount.toFixed(2)}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
                          title="Edit transaction"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(tx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
