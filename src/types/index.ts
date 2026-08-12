export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Budget {
  id: number;
  category: string;
  amount: number;
  month: string; // YYYY-MM
  created_at: string;
}

export interface CategorySpending {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

export interface MonthlySpending {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  net: number;
}

export interface BudgetProgress {
  category: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
}

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  monthlySpending: number;
  averageSpending: number;
  largestTransaction: Transaction | null;
  highestCategory: { category: string; amount: number } | null;
  budgetUsagePercentage: number;
  overBudgetCategoriesCount: number;
  overBudgetCategories: BudgetProgress[];
  categoryBreakdown: CategorySpending[];
  monthlyBreakdown: MonthlySpending[];
  budgetProgressList: BudgetProgress[];
}

export interface AIResponse {
  answer: string;
  queryType: string;
  dataPoints?: Record<string, any>;
  suggestions?: string[];
}
