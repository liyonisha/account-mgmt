## 1. Account Management System

### 1.1 Project overview

This is an **Account Management System** for administrators to manage accounts, invoices, payments, vouchers, and financial reports. The system provides:

- A **Chart of Accounts** (Income, Expenses, Assets, Liabilities, Equity) with create, edit, and delete.
- **Invoice management**: create invoices linked to income accounts and view their status (Paid/Unpaid).
- **Payment recording**: record payments against invoices (separate from invoice management); the system updates invoice status when payments are recorded.
- **Vouchers**: create expense vouchers linked to expense accounts.
- **Income statement**: generate monthly or yearly reports (total income, total expenses, net profit) up to a given date.

The application consists of a REST API backend and a web frontend that talks to it.

---

### 2. Technology stack

- **Frontend**: Next.js (React), Tailwind CSS  
- **Backend**: Node.js, Express  
- **Database**: PostgreSQL  

#### 2.1 Stack choice and reason

The project uses **Node.js with Express** because:

- **Familiarity and experience**: Node.js is the technology I am most familiar with and have the most experience in, so I chose it to build the backend efficiently and with confidence.
- **Simpler setup**: Fewer concepts and files for a small scope, making the codebase easier to follow and review.
- **Clear structure**: The backend is organized into **models**, **services**, **controllers**, and **routes**, so separation of concerns is still clear without a full framework.


---

### 3. Installation

#### 3.1 Prerequisites

- **Node.js** 18 or newer  
- **PostgreSQL** 13 or newer  
- A terminal and (optionally) a PostgreSQL client (e.g. psql, pgAdmin)

#### 3.2 Database setup

1. Create a PostgreSQL database:

   ```sql
   CREATE DATABASE account_management;
   ```

2. Apply the schema (run the contents of `backend/db/schema.sql` against that database), for example:

   ```bash
   psql -U your_user -d account_management -f backend/db/schema.sql
   ```

   Or use your DB tool to run `backend/db/schema.sql`.

3. In the `backend/` folder, create a `.env` file with your database URL and port:

   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/account_management
   PORT=4000
   ```

   Replace `user`, `password`, and the database name if different.

#### 3.3 Backend install

From the project root:

```bash
cd backend
npm install
```

#### 3.4 Frontend install

From the project root:

```bash
cd frontend
npm install
```

---

### 4. How to run the project

1. **Start the backend** (from project root):

   ```bash
   cd backend
   npm run dev
   ```

   The API runs at **http://localhost:4000**. A health check: `GET http://localhost:4000/health`.

2. **Start the frontend** (in a second terminal, from project root):

   ```bash
   cd frontend
   npm run dev
   ```

   The app runs at **http://localhost:3000**. It is configured to call the backend at `http://localhost:4000` (see `frontend/.env.local` or `NEXT_PUBLIC_API_BASE_URL` if you need to change it).

3. Open **http://localhost:3000** in a browser. Use the sidebar to open Dashboard, Accounts, Invoices, Payments, Vouchers, and Income Statement.

---

### 5. API endpoints (REST)

Base URL: `http://localhost:4000`

#### 5.1 Accounts

- `GET /accounts` – List all accounts.
- `POST /accounts` – Create a new account.
- `PUT /accounts/:id` – Update an existing account.
- `DELETE /accounts/:id` – Delete an account.

#### 5.2 Invoices

- `GET /invoices` – List all invoices.
- `GET /invoices/:id` – Get a single invoice by ID.
- `POST /invoices` – Create a new invoice.
- `PUT /invoices/:id` – Update an existing invoice.
- `DELETE /invoices/:id` – Delete an invoice.
- `POST /invoices/:id/payments` – Record a payment against a specific invoice.

#### 5.3 Payments

- `GET /payments` – List all payments.
- `GET /payments/:id` – Get a single payment by ID.
- `PUT /payments/:id` – Update a payment.
- `DELETE /payments/:id` – Delete a payment.

#### 5.4 Vouchers

- `GET /vouchers` – List all vouchers.
- `GET /vouchers/:id` – Get a single voucher by ID.
- `POST /vouchers` – Create a new voucher.
- `PUT /vouchers/:id` – Update a voucher.
- `DELETE /vouchers/:id` – Delete a voucher.

#### 5.5 Reports

- `GET /reports/income-statement` – Get income statement (supports query parameters for date range / filters as implemented in the backend).

---

### 6. Features (summary)

- **Chart of Accounts** – Create, list, edit, and delete accounts (Income, Expenses, Assets, Liabilities, Equity).
- **Invoices** – Create and list invoices; status is Paid/Unpaid.
- **Payments** – Record payments for invoices; invoice status updates automatically.
- **Vouchers** – Create vouchers for expense accounts.
- **Income Statement** – Monthly or yearly report (total income, total expenses, net profit) up to a date.

---

### 7. Project structure

- `backend/` – Express API with **models**, **services**, **controllers**, **routes**; PostgreSQL via `db.js`.
- `backend/db/schema.sql` – Database schema (accounts, invoices, payments, vouchers).
- `frontend/` – Next.js app with Tailwind; pages for dashboard, accounts, invoices, payments, vouchers, reports.

---

### 8. How to use (functional walkthrough)

- **Accounts**
  - Go to `Accounts`.
  - Create accounts under types (Income, Expense, Asset, Liability, Equity).
  - These accounts are later used when creating invoices and vouchers.

- **Invoices**
  - Go to `Invoices`.
  - Create a new invoice, selecting an appropriate **income account**.
  - The invoice is initially **Unpaid**.

- **Payments**
  - Go to `Payments`.
  - Select an existing invoice and record a payment.
  - Once the full amount is paid, the invoice status becomes **Paid**.

- **Vouchers**
  - Go to `Vouchers`.
  - Create an expense voucher and link it to an **expense account**.

- **Income Statement**
  - Go to `Income Statement`.
  - Choose a **month/year** or **year** and a **cut‑off date**.
  - The system calculates **total income**, **total expenses**, and **net profit** up to that date.