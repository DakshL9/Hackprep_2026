# Product Requirement Document (PRD) — SpendSense

**Product Name:** SpendSense  
**Version:** 1.0.0  
**Methodology:** BMAD (Agile AI-Driven Development)  
**Status:** Approved & Implemented  
**Author:** Antigravity AI & Harshi  

---

## 1. Executive Summary & Product Vision

**SpendSense** is a modern, high-performance, AI-powered personal expense management and financial intelligence web application. Designed to provide users with complete visibility into their financial health, SpendSense combines real-time SQLite database transaction tracking, category budget enforcement, visual spending analytics, and a database-backed AI Financial Analyst.

Unlike generic financial tools that use dummy numbers or external LLM hallucination, SpendSense uses **real-time database-derived aggregate calculations** to guarantee 100% financial accuracy, zero number hallucination, and total data privacy.

---

## 2. Problem Statement & Solution

### The Problem
- **Lack of Real-time Insight:** Most expense trackers fail to provide immediate, actionable visual feedback when transactions occur.
- **AI Hallucinations in Financial Tools:** Many AI financial assistants fabricate numbers, hallucinate balances, or leak private API keys on the client side.
- **Rigid Budgeting:** Users struggle to track monthly category limits against real-time spending.

### The Solution
- **SpendSense** integrates a lightweight, persistent SQLite database (`spendsense.db`) directly into a modern Next.js stack.
- It provides a visual dashboard with a real-time **Category Donut Chart** running live `SUM(amount) WHERE type = 'expense' GROUP BY category` queries.
- An **AI Financial Analyst** queries the database directly to provide precise, verifiable financial answers to queries like *"Where am I spending the most?"*, *"How much did I spend this month?"*, and *"Am I over budget?"*.

---

## 3. Core Requirements & Feature Specifications

### 3.1 Persistent SQLite Database Architecture
- **Engine:** Persistent SQLite database stored at `./spendsense.db` using Node.js native `DatabaseSync` driver with Write-Ahead Logging (WAL) and foreign key enforcement.
- **Default Taxonomies (13 Categories):**
  - Food & Dining, Travel, Shopping, Entertainment, Bills & Utilities, Health, Education, Transport, Subscriptions, Rent & Housing, Personal Care, Groceries, Other.
- **Database Tables:**
  1. `categories`: `(id, name UNIQUE, created_at)`
  2. `transactions`: `(id, amount > 0, category, description, date YYYY-MM-DD, type ['income'|'expense'], created_at)`
  3. `budgets`: `(id, category, amount >= 0, month YYYY-MM, created_at, UNIQUE(category, month))`

### 3.2 Transaction Management (CRUD)
- **Create:** Input modal supporting amount, category dropdown, description, date picker, and Income/Expense toggle.
- **Read:** Table view displaying transaction history with inline search, category filtering, and transaction type filtering.
- **Update:** Edit existing transaction attributes with live database reflection.
- **Delete:** Safely remove transactions with instant dashboard recalculation.

### 3.3 Interactive Financial Dashboard
- **KPI Metrics Cards:** Total Income, Total Expenses, Net Current Balance, and Current Month Spending.
- **Spending by Category Donut Chart:** Recharts Donut chart driven by real SQLite `SUM(amount) GROUP BY category` query, featuring category percentages, total amounts, and hover tooltips. Automatically updates whenever transactions change.
- **Income vs. Expense Monthly Bar Chart:** Multi-month trend analysis.
- **Budget Progress Tracker:** Category cap progress bars with remaining balance badges and over-budget alerts.
- **Recent Transactions Widget:** Quick access table with edit/delete actions.

### 3.4 Financial Analytics Suite (`/analytics`)
Calculates real-time metrics from the database:
- Average expense spending per transaction.
- Largest individual transaction details.
- Highest spending category name and amount.
- Overall budget usage percentage.
- Over-budget categories list and overrun details.

### 3.5 Database-Backed AI Financial Analyst (`/ai-analyst`)
- Natural language chat assistant supporting prompt buttons:
  - *"Where am I spending the most?"*
  - *"How much did I spend this month?"*
  - *"Am I over budget?"*
  - *"How can I reduce my spending?"*
- **Strict Accuracy Guarantee:** All responses are generated from deterministic SQL aggregate queries (`SUM`, `AVG`, `MAX`, `COUNT`, `GROUP BY`).
- **Security:** Zero client-side API key exposure.

### 3.6 User Interface & User Experience (UI/UX)
- **Aesthetic:** Dark glassmorphism UI with vibrant emerald, rose, and indigo accents.
- **Responsiveness:** Full desktop and mobile viewport support.
- **States:** Comprehensive empty states, loading indicators, skeleton states, and input error validations.

---

## 4. Non-Functional Requirements (NFRs)

- **Performance:** Sub-50ms query execution time on local SQLite database. Sub-100ms API response time.
- **Data Integrity:** Database foreign key constraints prevent orphan transactions or invalid categories.
- **Security:** Local data storage without external third-party data transmission. No sensitive financial keys exposed.
- **Scalability:** Indexed SQLite fields (`date`, `category`, `type`, `month`) ensure smooth performance across thousands of transactions.

---

## 5. BMAD Implementation Milestones

| Milestone | Scope & Deliverable | Status |
|---|---|---|
| **Milestone 1** | SQLite Database setup, Schema migrations, Default categories, Seed API | ✅ Completed |
| **Milestone 2** | Transaction CRUD REST APIs (`/api/transactions`) & UI Modal/Table | ✅ Completed |
| **Milestone 3** | Categories & Monthly Budgets Manager (`/api/categories`, `/api/budgets`) | ✅ Completed |
| **Milestone 4** | Dashboard View, KPI cards & SQLite Donut Chart (`SUM GROUP BY`) | ✅ Completed |
| **Milestone 5** | Financial Analytics Suite (`/api/analytics`, `/analytics`) | ✅ Completed |
| **Milestone 6** | AI Analyst Engine (`/lib/aiEngine.ts`, `/api/ai-analyst`, `/ai-analyst`) | ✅ Completed |
| **Milestone 7** | UI/UX Polish, Glassmorphic Theme, Animations, Validation States | ✅ Completed |
| **Milestone 8** | End-to-End Build Verification, API Testing, Walkthrough & Docs | ✅ Completed |

---

## 6. Future Roadmap

- **CSV / OFX Import & Export:** Bulk import transaction history from bank exports.
- **Recurring Transactions Automator:** Automated scheduled subscription and rent logging.
- **Multi-Currency Support:** Dynamic currency conversion for global users.
