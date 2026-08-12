'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  PieChart, 
  Bot, 
  Sparkles, 
  TrendingUp,
  Wallet
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/budgets', label: 'Budgets & Categories', icon: Target },
  { href: '/analytics', label: 'Analytics', icon: PieChart },
  { href: '/ai-analyst', label: 'AI Analyst', icon: Bot, badge: 'AI' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 glass-card border-r border-slate-800 flex flex-col justify-between hidden md:flex shrink-0 min-h-screen">
      <div>
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              SpendSense <Sparkles className="w-4 h-4 text-purple-400 fill-purple-400" />
            </h1>
            <p className="text-xs text-slate-400 font-medium">BMAD AI Expense Tracker</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / Seed Badge */}
      <div className="p-4 m-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          SQLite Database Active
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Real-time persistence with <code className="text-indigo-300">spendsense.db</code>
        </p>
      </div>
    </aside>
  );
}
