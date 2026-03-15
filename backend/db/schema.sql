-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Income', 'Expenses', 'Assets', 'Liabilities', 'Equity')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(100) NOT NULL,
  invoice_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  status VARCHAR(20) NOT NULL DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Unpaid')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Payments for invoices
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id),
  amount NUMERIC(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Expense vouchers
CREATE TABLE IF NOT EXISTS vouchers (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  voucher_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

