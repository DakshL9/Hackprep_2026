import { getDb } from './db';

export function seedDemoData() {
  const db = getDb();

  // Clear existing transactions & budgets
  db.exec('DELETE FROM transactions');
  db.exec('DELETE FROM budgets');

  const insertTx = db.prepare(`
    INSERT INTO transactions (amount, category, description, date, type)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertBudget = db.prepare(`
    INSERT INTO budgets (category, amount, month)
    VALUES (?, ?, ?)
  `);

  const currentYearMonth = new Date().toISOString().slice(0, 7); // e.g., "2026-08"

  // Seed realistic Budgets for current month
  const sampleBudgets = [
    { category: 'Food & Dining', amount: 600 },
    { category: 'Groceries', amount: 500 },
    { category: 'Travel', amount: 350 },
    { category: 'Shopping', amount: 400 },
    { category: 'Entertainment', amount: 200 },
    { category: 'Bills & Utilities', amount: 450 },
    { category: 'Subscriptions', amount: 80 },
    { category: 'Rent & Housing', amount: 1500 },
    { category: 'Transport', amount: 150 },
    { category: 'Personal Care', amount: 120 },
  ];

  for (const b of sampleBudgets) {
    insertBudget.run(b.category, b.amount, currentYearMonth);
  }

  // Generate sample transactions over the past 3 months
  const today = new Date();
  const transactions = [
    // Current Month Incomes
    { amount: 4500, category: 'Other', description: 'Tech Company Monthly Salary', date: formatDate(0), type: 'income' },
    { amount: 850, category: 'Other', description: 'Freelance Design Retainer', date: formatDate(5), type: 'income' },
    { amount: 120, category: 'Other', description: 'Dividend Payout', date: formatDate(10), type: 'income' },

    // Current Month Expenses
    { amount: 1450, category: 'Rent & Housing', description: 'Monthly Apartment Rent', date: formatDate(1), type: 'expense' },
    { amount: 185.50, category: 'Groceries', description: 'Whole Foods Market Weekly Stockup', date: formatDate(2), type: 'expense' },
    { amount: 64.20, category: 'Food & Dining', description: 'Dinner at Italian Bistro', date: formatDate(3), type: 'expense' },
    { amount: 42.00, category: 'Transport', description: 'Uber Ride to Tech Meetup', date: formatDate(4), type: 'expense' },
    { amount: 215.00, category: 'Bills & Utilities', description: 'Electric & High-Speed Internet', date: formatDate(5), type: 'expense' },
    { amount: 149.99, category: 'Shopping', description: 'Wireless Noise Cancelling Headphones', date: formatDate(6), type: 'expense' },
    { amount: 28.50, category: 'Food & Dining', description: 'Coffee & Bakery Snacks', date: formatDate(7), type: 'expense' },
    { amount: 15.99, category: 'Subscriptions', description: 'Netflix Premium 4K Plan', date: formatDate(8), type: 'expense' },
    { amount: 119.00, category: 'Health', description: 'Monthly Gym Membership & Spa', date: formatDate(9), type: 'expense' },
    { amount: 320.00, category: 'Travel', description: 'Weekend Getaway Flight Ticket', date: formatDate(10), type: 'expense' },
    { amount: 88.00, category: 'Groceries', description: 'Trader Joe\'s Grocery Supplies', date: formatDate(11), type: 'expense' },
    { amount: 45.00, category: 'Entertainment', description: 'IMAX Cinema Movie Tickets for 2', date: formatDate(12), type: 'expense' },
    { amount: 34.00, category: 'Personal Care', description: 'Skincare & Grooming Products', date: formatDate(13), type: 'expense' },
    { amount: 95.00, category: 'Food & Dining', description: 'Seafood Buffet Lunch with Friends', date: formatDate(14), type: 'expense' },

    // Previous Month Data
    { amount: 4500, category: 'Other', description: 'Monthly Salary', date: formatDate(30), type: 'income' },
    { amount: 1450, category: 'Rent & Housing', description: 'Monthly Rent', date: formatDate(31), type: 'expense' },
    { amount: 240, category: 'Groceries', description: 'Supermarket Groceries', date: formatDate(33), type: 'expense' },
    { amount: 310, category: 'Food & Dining', description: 'Restaurant Dining & Takeout', date: formatDate(35), type: 'expense' },
    { amount: 180, category: 'Shopping', description: 'Summer Clothing Sale', date: formatDate(40), type: 'expense' },
    { amount: 210, category: 'Bills & Utilities', description: 'Water & Electricity', date: formatDate(42), type: 'expense' },

    // Two Months Ago Data
    { amount: 4500, category: 'Other', description: 'Monthly Salary', date: formatDate(60), type: 'income' },
    { amount: 1450, category: 'Rent & Housing', description: 'Monthly Rent', date: formatDate(61), type: 'expense' },
    { amount: 380, category: 'Travel', description: 'Train Tickets & Airbnb Stay', date: formatDate(65), type: 'expense' },
    { amount: 290, category: 'Groceries', description: 'Bi-Weekly Grocery Run', date: formatDate(68), type: 'expense' }
  ];

  for (const tx of transactions) {
    insertTx.run(tx.amount, tx.category, tx.description, tx.date, tx.type);
  }

  return { success: true, message: 'Database seeded with demo financial data!' };

  function formatDate(daysAgo: number): string {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  }
}
