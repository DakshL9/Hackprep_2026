# System Architecture Document — SpendSense

**Product Name:** SpendSense  
**Architecture Pattern:** Monolithic Full-Stack Next.js (App Router) with Embedded SQLite  
**Database Driver:** Node.js 26 Native `node:sqlite` (`DatabaseSync`)  
**Status:** Implemented & Verified  

---

## 1. High-Level Architecture Overview

SpendSense is engineered as a unified, zero-latency full-stack web application. The system consists of three primary tiers operating within the Next.js runtime environment:

1. **Presentation Layer (Frontend UI):** React 19 components with Tailwind CSS for glassmorphic styling, Recharts for dynamic visual chart rendering, and Lucide icons for UI controls.
2. **API & Business Logic Layer (Backend Services):** Next.js App Router Route Handlers (`/api/*`) executing synchronous, prepared SQL queries against the database and synthesizing analytical insights.
3. **Database Layer (Storage Engine):** Embedded, persistent SQLite database (`spendsense.db`) using Write-Ahead Logging (WAL) mode for fast, atomic database operations.

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|                                                                                   |
|  +-------------------+  +-------------------+  +-------------------+              |
|  |   Dashboard View  |  | Transactions View |  | AI Analyst Chat   |              |
|  | (KPIs, Donut Chart|  |  (CRUD & Filters) |  | (Natural Queries) |              |
|  +---------+---------+  +---------+---------+  +---------+---------+              |
+------------|----------------------|----------------------|------------------------+
             |                      |                      |
             +----------------------+----------------------+
                                    | HTTP REST Requests
                                    v
+-----------------------------------------------------------------------------------+
|                                 APPLICATION LAYER                                 |
|                               (Next.js App Router)                                |
|                                                                                   |
|  +--------------------+  +-------------------+  +------------------------------+  |
|  | /api/transactions  |  |   /api/analytics  |  |       /api/ai-analyst        |  |
|  | (GET, POST, PUT,   |  | (SQL Aggregates:  |  | (Dynamic Analytical Engine:  |  |
|  |  DELETE)           |  |  SUM, AVG, COUNT) |  |  lib/aiEngine.ts)            |  |
|  +---------+----------+  +---------+---------+  +--------------+---------------+  |
+------------|-----------------------|---------------------------|------------------+
             |                       |                           |
             +-----------------------+---------------------------+
                                     | Prepared SQL Queries
                                     v
+-----------------------------------------------------------------------------------+
|                                  DATABASE LAYER                                   |
|                           (Node.js 26 `node:sqlite`)                              |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                    spendsense.db (SQLite Database File)                     |  |
|  |                                                                             |  |
|  |  +-------------------+   +--------------------+   +---------------------+   |  |
|  |  |    categories     |   |    transactions    |   |       budgets       |   |  |
|  |  | (id, name, date)  |   | (id, amount, date, |   | (id, category, amt, |   |  |
|  |  |                   |   |  category, type)   |   |  month YYYY-MM)     |   |  |
|  |  +-------------------+   +--------------------+   +---------------------+   |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Technology Stack & Component Matrix

| Tier | Component / Module | Technology / Library | Purpose |
|---|---|---|---|
| **Framework** | Full-Stack Framework | Next.js 15.1 (App Router) | Server-side rendering, API routes, routing |
| **Frontend** | UI Library | React 19 | Declarative UI state management |
| **Styling** | Design System | Tailwind CSS v3.4 | Glassmorphism aesthetics, responsive layouts |
| **Charts** | Data Visualization | Recharts v2.15 | Responsive SVG Donut Chart and Bar Charts |
| **Icons** | Visual Icons | Lucide React | Clean, scalable visual controls |
| **Database** | Database Engine | SQLite 3 (`spendsense.db`) | Persistent local database storage |
| **DB Driver** | Database Connector | Node.js 26 `node:sqlite` | Native C-level synchronous SQLite binding |
| **Language** | Type Safety | TypeScript 5.7 | Strict interface contracts & error checking |

---

## 3. Database Schema & Data Modeling

Database File Path: `./spendsense.db`

### 3.1 `categories` Table
Stores unique expense/income taxonomy categories.
```sql
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 `transactions` Table
Stores individual financial transactions.
```sql
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL CHECK(amount > 0),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL, -- Format: YYYY-MM-DD
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category) REFERENCES categories(name) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
```

### 3.3 `budgets` Table
Stores monthly budget caps per category.
```sql
CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount >= 0),
  month TEXT NOT NULL, -- Format: YYYY-MM
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, month),
  FOREIGN KEY (category) REFERENCES categories(name) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Performance Index
CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
```

---

## 4. Component & Module Architecture

### Directory Layout
```
src/
├── app/
│   ├── layout.tsx            # Main App Layout with Sidebar Navigation
│   ├── page.tsx              # Dashboard View (KPI Cards, Donut Chart, Trends)
│   ├── transactions/
│   │   └── page.tsx          # Full Transactions CRUD Page
│   ├── budgets/
│   │   └── page.tsx          # Monthly Category Budget Manager Page
│   ├── analytics/
│   │   └── page.tsx          # Financial Analytics Suite Page
│   ├── ai-analyst/
│   │   └── page.tsx          # Interactive AI Assistant Interface Page
│   └── api/
│       ├── transactions/     # GET, POST, PUT, DELETE REST Handlers
│       ├── categories/       # Category Management Handlers
│       ├── budgets/          # Category Budget Allocation Handlers
│       ├── analytics/        # Aggregate SQL Analytics Engine Endpoint
│       ├── ai-analyst/       # AI Natural Language Synthesis Endpoint
│       └── seed/             # Demo Data Seeder Endpoint
├── components/
│   ├── Sidebar.tsx           # Navigation Sidebar Component
│   ├── Header.tsx            # Top Bar with Seed & Action Triggers
│   ├── StatCard.tsx          # KPI Metric Card Widget
│   ├── CategoryDonutChart.tsx # Recharts Donut Chart (`SUM GROUP BY`)
│   ├── MonthlyBarChart.tsx   # Income vs. Expense Bar Chart
│   ├── BudgetProgressBar.tsx # Budget Usage Bar & Alert Badges
│   ├── TransactionModal.tsx  # Add / Edit Transaction Dialog
│   ├── TransactionTable.tsx  # Transaction Table with Search & Filters
│   └── AIAnalystChat.tsx     # AI Assistant Chat Widget
├── lib/
│   ├── db.ts                 # SQLite Database Connection & Migrations
│   ├── constants.ts          # Default Category Definitions
│   ├── seedData.ts           # Demo Transaction Generator
│   └── aiEngine.ts           # Database Aggregate Query Engine for AI
└── types/
    └── index.ts              # TypeScript Domain Interfaces
```

---

## 5. Data Flow Sequences

### 5.1 Transaction Creation & Live Donut Chart Update Flow
```
User -> TransactionModal: Submits new expense ($80, "Groceries", "2026-08-12")
TransactionModal -> API (/api/transactions): POST JSON payload
API -> SQLite (spendsense.db): INSERT INTO transactions (amount, category, description, date, type)
SQLite --> API: Transaction ID created
API --> TransactionModal: HTTP 201 Created
TransactionModal -> Dashboard: Triggers fetchData() callback
Dashboard -> API (/api/analytics): GET Request
API -> SQLite: Execute `SELECT category, SUM(amount) FROM transactions WHERE type = 'expense' GROUP BY category`
SQLite --> API: Aggregate Category Array
API --> Dashboard: Returns recalculated AnalyticsSummary
Dashboard -> CategoryDonutChart: Re-renders SVG Donut Chart with updated percentage slices
```

### 5.2 AI Analyst Natural Language Query Flow
```
User -> AIAnalystChat: Clicks prompt pill "Where am I spending the most?"
AIAnalystChat -> API (/api/ai-analyst): POST { prompt: "Where am I spending the most?" }
API -> aiEngine.ts: Evaluates intent ("top_spending")
aiEngine.ts -> SQLite: Execute `SELECT category, SUM(amount) as total FROM transactions WHERE type='expense' GROUP BY category ORDER BY total DESC LIMIT 3`
SQLite --> aiEngine.ts: Returns top category data (Rent & Housing: $4,350)
aiEngine.ts -> API: Synthesizes response text + dataPoints payload
API --> AIAnalystChat: Returns verified answer JSON
AIAnalystChat -> User: Displays formatted Markdown answer & DB source verification card
```

---

## 6. Security, Performance & Data Integrity

1. **Zero Client API Key Leakage:** The AI Analyst runs locally on SQLite aggregate functions inside server endpoints. No external LLM keys are exposed to the client.
2. **Atomic SQL Execution:** All database mutations use synchronous prepared statements (`DatabaseSync`), preventing SQL injection vulnerabilities.
3. **Database Indexing:** B-Tree indexes on `date`, `category`, `type`, and `month` maintain O(log N) lookup time for analytics and charts.
4. **Validation Pipeline:** Strict schema validation checks non-zero positive amounts, valid date strings, and enum types (`income` | `expense`) before database execution.
