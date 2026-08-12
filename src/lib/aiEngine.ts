import { getDb } from './db';
import { AIResponse } from '@/types';

export function processAIQuery(prompt: string): AIResponse {
  const db = getDb();
  const lowerPrompt = prompt.toLowerCase().trim();
  const currentMonth = new Date().toISOString().slice(0, 7);

  // 1. "Where am I spending the most?"
  if (lowerPrompt.includes('spending the most') || lowerPrompt.includes('highest spending') || lowerPrompt.includes('most expensive category')) {
    const topCategories = db
      .prepare(`
        SELECT category, SUM(amount) as total, COUNT(*) as count
        FROM transactions
        WHERE type = 'expense'
        GROUP BY category
        ORDER BY total DESC
        LIMIT 3
      `)
      .all() as Array<{ category: string; total: number; count: number }>;

    const totalExpenseRow = db
      .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'")
      .get() as { total: number };
    const totalExp = totalExpenseRow?.total || 1;

    if (topCategories.length === 0) {
      return {
        answer: "You haven't logged any expense transactions yet! Add your recent expenses to see category breakdowns.",
        queryType: "top_spending",
      };
    }

    const top = topCategories[0];
    const topPct = Math.round((top.total / totalExp) * 100);

    const runnersUp = topCategories.slice(1).map(c => `${c.category} ($${c.total.toFixed(2)})`).join(', ');

    return {
      answer: `Based on your database records, **${top.category}** is your single highest spending category at **$${top.total.toFixed(2)}**, representing **${topPct}%** of your total expenses across ${top.count} transactions.${runnersUp ? ` Other top categories include ${runnersUp}.` : ''}`,
      queryType: "top_spending",
      dataPoints: {
        category: top.category,
        totalSpent: top.total,
        percentage: topPct,
        transactionCount: top.count,
        topCategories
      },
      suggestions: [
        "How can I reduce my spending?",
        "Am I over budget?",
        "How much did I spend this month?"
      ]
    };
  }

  // 2. "How much did I spend this month?" / "Monthly spend"
  if (lowerPrompt.includes('this month') || lowerPrompt.includes('monthly spend') || lowerPrompt.includes('how much did i spend')) {
    const monthExpRow = db
      .prepare(`
        SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
        FROM transactions
        WHERE type = 'expense' AND strftime('%Y-%m', date) = ?
      `)
      .get(currentMonth) as { total: number; count: number };

    const monthIncRow = db
      .prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE type = 'income' AND strftime('%Y-%m', date) = ?
      `)
      .get(currentMonth) as { total: number };

    const monthExp = monthExpRow?.total || 0;
    const monthInc = monthIncRow?.total || 0;
    const netSavings = monthInc - monthExp;

    const topMonthCategory = db
      .prepare(`
        SELECT category, SUM(amount) as total
        FROM transactions
        WHERE type = 'expense' AND strftime('%Y-%m', date) = ?
        GROUP BY category
        ORDER BY total DESC
        LIMIT 1
      `)
      .get(currentMonth) as { category: string; total: number } | undefined;

    return {
      answer: `In the current month (${currentMonth}), you spent a total of **$${monthExp.toFixed(2)}** across ${monthExpRow.count} expense transactions. Total income recorded is **$${monthInc.toFixed(2)}**, leaving a net cash flow of **$${netSavings >= 0 ? '+' : ''}$${netSavings.toFixed(2)}**.${topMonthCategory ? ` Your biggest expense category this month is **${topMonthCategory.category}** ($${topMonthCategory.total.toFixed(2)}).` : ''}`,
      queryType: "monthly_spend",
      dataPoints: {
        month: currentMonth,
        totalExpense: monthExp,
        totalIncome: monthInc,
        netCashFlow: netSavings,
        topCategoryThisMonth: topMonthCategory?.category
      },
      suggestions: [
        "Am I over budget?",
        "Where am I spending the most?",
        "How can I reduce my spending?"
      ]
    };
  }

  // 3. "Am I over budget?" / "Budget status"
  if (lowerPrompt.includes('over budget') || lowerPrompt.includes('budget status') || lowerPrompt.includes('check budget')) {
    const budgets = db
      .prepare(`
        SELECT 
          b.category,
          b.amount as budgetAmount,
          COALESCE(SUM(t.amount), 0) as spentAmount
        FROM budgets b
        LEFT JOIN transactions t 
          ON b.category = t.category 
          AND t.type = 'expense'
          AND strftime('%Y-%m', t.date) = b.month
        WHERE b.month = ?
        GROUP BY b.id, b.category, b.amount
      `)
      .all(currentMonth) as Array<{ category: string; budgetAmount: number; spentAmount: number }>;

    if (budgets.length === 0) {
      return {
        answer: "No budget limits have been configured for this month yet. Head to the **Budgets** page to set up category targets!",
        queryType: "budget_status",
      };
    }

    const over = budgets.filter(b => b.spentAmount > b.budgetAmount);
    const totalBudgeted = budgets.reduce((acc, b) => acc + b.budgetAmount, 0);
    const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);

    if (over.length > 0) {
      const overDetails = over
        .map(b => `**${b.category}** (Spent: $${b.spentAmount.toFixed(2)} / Budget: $${b.budgetAmount.toFixed(2)} - Over by $${(b.spentAmount - b.budgetAmount).toFixed(2)})`)
        .join(', ');

      return {
        answer: `🚨 **Attention required**: You are currently **over budget** in **${over.length}** category/categories for ${currentMonth}: ${overDetails}. Overall budget consumption is **$${totalSpent.toFixed(2)}** of your **$${totalBudgeted.toFixed(2)}** total monthly budget (${Math.round((totalSpent/totalBudgeted)*100)}%).`,
        queryType: "budget_status",
        dataPoints: {
          overBudgetCategories: over,
          totalBudgeted,
          totalSpent,
          isOverBudget: true
        },
        suggestions: [
          "How can I reduce my spending?",
          "Where am I spending the most?",
          "How much did I spend this month?"
        ]
      };
    } else {
      return {
        answer: `✅ **Great news!** You are currently **within budget** across all configured categories for ${currentMonth}. Total spent is **$${totalSpent.toFixed(2)}** out of **$${totalBudgeted.toFixed(2)}** budgeted (${Math.round((totalSpent/totalBudgeted)*100)}% utilized).`,
        queryType: "budget_status",
        dataPoints: {
          totalBudgeted,
          totalSpent,
          isOverBudget: false
        },
        suggestions: [
          "Where am I spending the most?",
          "How can I reduce my spending?"
        ]
      };
    }
  }

  // 4. "How can I reduce my spending?" / "Savings recommendations"
  if (lowerPrompt.includes('reduce') || lowerPrompt.includes('cut spend') || lowerPrompt.includes('save money') || lowerPrompt.includes('tips')) {
    // Query discretionary spending categories (Dining, Entertainment, Shopping, Subscriptions)
    const discretionary = db
      .prepare(`
        SELECT category, SUM(amount) as total
        FROM transactions
        WHERE type = 'expense' 
          AND category IN ('Food & Dining', 'Entertainment', 'Shopping', 'Subscriptions', 'Travel')
        GROUP BY category
        ORDER BY total DESC
      `)
      .all() as Array<{ category: string; total: number }>;

    const totalExpRow = db
      .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'")
      .get() as { total: number };
    const totalExp = totalExpRow?.total || 1;

    const discTotal = discretionary.reduce((acc, d) => acc + d.total, 0);
    const discPct = Math.round((discTotal / totalExp) * 100);

    const recommendations = discretionary.map(d => {
      const targetSavings = (d.total * 0.20).toFixed(2);
      return `- **${d.category}** ($${d.total.toFixed(2)} spent): Cutting back by 20% would save you **$${targetSavings}**.`;
    }).join('\n');

    return {
      answer: `Here are database-backed insights to reduce your expenses:\n\nDiscretionary categories (Dining, Shopping, Entertainment, Subscriptions) account for **$${discTotal.toFixed(2)}** (**${discPct}%** of your total spending).\n\n**Actionable Savings Potential:**\n${recommendations || '- Set strict monthly caps on non-essential purchases.'}\n\n💡 *Tip: Target your highest non-essential category first for quick savings wins!*`,
      queryType: "reduce_spending",
      dataPoints: {
        discretionaryTotal: discTotal,
        discretionaryPercentage: discPct,
        discretionaryCategories: discretionary
      },
      suggestions: [
        "Where am I spending the most?",
        "Am I over budget?",
        "How much did I spend this month?"
      ]
    };
  }

  // General Fallback Query Synthesizer (e.g. custom questions)
  const summaryRow = db
    .prepare(`
      SELECT 
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'income') as totalIncome,
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'expense') as totalExpense,
        (SELECT COUNT(*) FROM transactions) as txCount
    `)
    .get() as { totalIncome: number; totalExpense: number; txCount: number };

  const topCategoryRow = db
    .prepare("SELECT category, SUM(amount) as total FROM transactions WHERE type = 'expense' GROUP BY category ORDER BY total DESC LIMIT 1")
    .get() as { category: string; total: number } | undefined;

  return {
    answer: `Analysis based on your real database (${summaryRow.txCount} transactions recorded):\n\n- **Total Income**: $${summaryRow.totalIncome.toFixed(2)}\n- **Total Expenses**: $${summaryRow.totalExpense.toFixed(2)}\n- **Net Balance**: $${(summaryRow.totalIncome - summaryRow.totalExpense).toFixed(2)}\n${topCategoryRow ? `- **Top Category**: ${topCategoryRow.category} ($${topCategoryRow.total.toFixed(2)})` : ''}\n\nAsk me specific questions like *"Where am I spending the most?"*, *"How much did I spend this month?"*, or *"Am I over budget?"* for deep dive insights!`,
    queryType: "general_summary",
    suggestions: [
      "Where am I spending the most?",
      "How much did I spend this month?",
      "Am I over budget?",
      "How can I reduce my spending?"
    ]
  };
}
