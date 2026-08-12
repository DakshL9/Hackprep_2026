'use client';

import { useState } from 'react';
import { AIResponse } from '@/types';
import { Bot, Send, Sparkles, TrendingDown, DollarSign, Target, HelpCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "Where am I spending the most?",
  "How much did I spend this month?",
  "Am I over budget?",
  "How can I reduce my spending?"
];

export default function AIAnalystChat() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; data?: AIResponse }>>([
    {
      role: 'assistant',
      text: "Hello! I am your **SpendSense AI Financial Analyst**. I evaluate your real SQLite database in real-time to give you exact spending insights, budget warnings, and actionable savings advice.\n\nChoose a question below or type your own!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (promptText: string) => {
    const textToSend = promptText || input;
    if (!textToSend.trim() || loading) return;

    // Add user message
    const updatedMessages = [
      ...messages,
      { role: 'user' as const, text: textToSend }
    ];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-analyst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend }),
      });

      const data: AIResponse = await res.json();
      if (!res.ok) throw new Error((data as any).error || 'Failed to consult AI');

      setMessages([
        ...updatedMessages,
        { role: 'assistant', text: data.answer, data }
      ]);
    } catch (err: any) {
      setMessages([
        ...updatedMessages,
        { role: 'assistant', text: `⚠️ Error fetching analytical response: ${err.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 flex flex-col h-[650px] shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              SpendSense AI Analyst <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified SQLite Database Calculations
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Zero Hallucination
        </span>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/40 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Suggestions:</span>
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-purple-500/50 hover:text-purple-300 transition shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Container */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20 rounded-br-none'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">
                {msg.text.split('\n').map((paragraph, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Data Card if returned */}
              {msg.data && msg.data.dataPoints && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-indigo-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Database Query Source Verification
                  </div>
                  {msg.data.queryType === 'top_spending' && (
                    <div>Highest Category: <strong className="text-white">{msg.data.dataPoints.category}</strong> (${msg.data.dataPoints.totalSpent})</div>
                  )}
                  {msg.data.queryType === 'monthly_spend' && (
                    <div>Month {msg.data.dataPoints.month}: Spent <strong className="text-rose-400">${msg.data.dataPoints.totalExpense}</strong> | Net Cashflow <strong className="text-emerald-400">${msg.data.dataPoints.netCashFlow}</strong></div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-bl-none p-4 text-xs text-slate-400 flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400 animate-bounce" />
              <span>Analyzing SQLite tables & calculating numbers...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center gap-3"
      >
        <input
          type="text"
          placeholder="Ask AI about your spending, budget, or tips..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl gradient-emerald text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          Ask AI
        </button>
      </form>
    </div>
  );
}
