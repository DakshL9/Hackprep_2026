import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Transaction } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const currentMonth = new Date().toISOString().slice(0, 7);

    // 1. Total Income
    const incomeRow = db
      .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income'")
      .get() as { total: number };
    const totalIncome = incomeRow?.total || 0;

    // 2. Total Expenses
    const expenseRow = db
      .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'")
      .get() as { total: number };
    const totalExpenses = expenseRow?.total || 0;

    // 3. Current Balance
    const currentBalance = totalIncome - totalExpenses;

    // 4. Monthly Spending (Current Month)
    const monthlySpendingRow = db
      .prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM transactions 
        WHERE type = 'expense' AND strftime('%Y-%m', date) = ?
      `)
      .get(currentMonth) as { total: number };
    const monthlySpending = monthlySpendingRow?.total || 0;

    // 5. Average Spending per transaction (Expense)
    const avgRow = db
      .prepare("SELECT COALESCE(AVG(amount), 0) as avgSpend FROM transactions WHERE type = 'expense'")
      .get() as { avgSpend: number };
    const averageSpending = Math.round((avgRow?.avgSpend || 0) * 100) / 100;

    // 6. Largest Transaction (Expense)
    const largestTx = db
      .prepare("SELECT * FROM transactions WHERE type = 'expense' ORDER BY amount DESC LIMIT 1")
      .get() as Transaction | undefined;

    // 7. Spending by Category (Real SQLite SUM query requested in specs)
    const categoryRows = db
      .prepare(`
        SELECT 
          category, 
          SUM(amount) as total,
          COUNT(*) as count
        FROM transactions 
        WHERE type = 'expense' 
        GROUP BY category 
        ORDER BY total DESC
      `)
      .all() as Array<{ category: string; total: number; count: number }>;

    const categoryBreakdown = categoryRows.map((cat) => ({
      category: cat.category,
      total: cat.total,
      count: cat.count,
      percentage: totalExpenses > 0 ? Math.round((cat.total / totalExpenses) * 1000) / 10 : 0,
    }));

    // Highest Spending Category
    const highestCategory = categoryBreakdown.length > 0
      ? { category: categoryBreakdown[0].category, amount: categoryBreakdown[0].total }
      : null;

    // 8. Monthly Breakdown (Last 6 Months Income vs Expenses)
    const monthlyRows = db
      .prepare(`
        SELECT 
          strftime('%Y-%m', date) as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month ASC
        LIMIT 6
      `)
      .all() as Array<{ month: string; income: number; expense: number }>;

    const monthlyBreakdown = monthlyRows.map((m) => ({
      month: m.month,
      income: m.income,
      expense: m.expense,
      net: m.income - m.expense,
    }));

    // 9. Budget Progress & Over-budget categories
    const budgetRows = db
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
        ORDER BY spentAmount DESC
      `)
      .all(currentMonth) as Array<{ category: string; budgetAmount: number; spentAmount: number }>;

    let totalBudgeted = 0;
    let totalSpentInBudgets = 0;

    const overBudgetCategories: any[] = [];

    const budgetProgressList = budgetRows.map((b) => {
      totalBudgeted += b.budgetAmount;
      totalSpentInBudgets += b.spentAmount;
      const percentage = b.budgetAmount > 0 ? Math.round((b.spentAmount / b.budgetAmount) * 100) : 0;
      const isOver = b.spentAmount > b.budgetAmount;
      const item = {
        category: b.category,
        budgetAmount: b.budgetAmount,
        spentAmount: b.spentAmount,
        percentage,
        remaining: Math.max(0, b.budgetAmount - b.spentAmount),
        isOverBudget: isOver,
      };
      if (isOver) {
        overBudgetCategories.push(item);
      }
      return item;
    });

    const budgetUsagePercentage = totalBudgeted > 0 ? Math.round((totalSpentInBudgets / totalBudgeted) * 100) : 0;

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpenses,
        currentBalance,
        monthlySpending,
        averageSpending,
        largestTransaction: largestTx || null,
        highestCategory,
        budgetUsagePercentage,
        overBudgetCategoriesCount: overBudgetCategories.length,
        overBudgetCategories,
        categoryBreakdown,
        monthlyBreakdown,
        budgetProgressList,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to compute analytics', details: error.message },
      { status: 500 }
    );
  }
}
