const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'spendsense.db');
const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Categories
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const DEFAULT_CATEGORIES = [
  'Food & Dining', 'Travel', 'Shopping', 'Entertainment',
  'Bills & Utilities', 'Health', 'Education', 'Transport',
  'Subscriptions', 'Rent & Housing', 'Personal Care', 'Groceries', 'Other'
];

const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
for (const cat of DEFAULT_CATEGORIES) {
  insertCat.run(cat);
}

// Transactions
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL CHECK(amount > 0),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
  CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
`);

// Budgets
db.exec(`
  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    amount REAL NOT NULL CHECK(amount >= 0),
    month TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, month)
  );
  CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
`);

// Clear & seed
db.exec('DELETE FROM transactions');
db.exec('DELETE FROM budgets');

const currentMonth = new Date().toISOString().slice(0, 7);

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

const insertBudget = db.prepare('INSERT INTO budgets (category, amount, month) VALUES (?, ?, ?)');
for (const b of sampleBudgets) {
  insertBudget.run(b.category, b.amount, currentMonth);
}

const today = new Date();
function formatDate(daysAgo) {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

const insertTx = db.prepare('INSERT INTO transactions (amount, category, description, date, type) VALUES (?, ?, ?, ?, ?)');

const transactions = [
  { amount: 4500, category: 'Other', description: 'Tech Company Monthly Salary', date: formatDate(0), type: 'income' },
  { amount: 850, category: 'Other', description: 'Freelance Design Retainer', date: formatDate(5), type: 'income' },
  { amount: 120, category: 'Other', description: 'Dividend Payout', date: formatDate(10), type: 'income' },

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

  { amount: 4500, category: 'Other', description: 'Monthly Salary', date: formatDate(30), type: 'income' },
  { amount: 1450, category: 'Rent & Housing', description: 'Monthly Rent', date: formatDate(31), type: 'expense' },
  { amount: 240, category: 'Groceries', description: 'Supermarket Groceries', date: formatDate(33), type: 'expense' },
  { amount: 310, category: 'Food & Dining', description: 'Restaurant Dining & Takeout', date: formatDate(35), type: 'expense' },
  { amount: 180, category: 'Shopping', description: 'Summer Clothing Sale', date: formatDate(40), type: 'expense' },
  { amount: 210, category: 'Bills & Utilities', description: 'Water & Electricity', date: formatDate(42), type: 'expense' },

  { amount: 4500, category: 'Other', description: 'Monthly Salary', date: formatDate(60), type: 'income' },
  { amount: 1450, category: 'Rent & Housing', description: 'Monthly Rent', date: formatDate(61), type: 'expense' },
  { amount: 380, category: 'Travel', description: 'Train Tickets & Airbnb Stay', date: formatDate(65), type: 'expense' },
  { amount: 290, category: 'Groceries', description: 'Bi-Weekly Grocery Run', date: formatDate(68), type: 'expense' }
];

for (const tx of transactions) {
  insertTx.run(tx.amount, tx.category, tx.description, tx.date, tx.type);
}

console.log('Successfully initialized spendsense.db and seeded demo financial records!');
db.close();
