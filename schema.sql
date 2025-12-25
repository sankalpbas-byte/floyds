-- 1. Table for the digital menu
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  imageUrl TEXT,
  category TEXT NOT NULL
);

-- 2. Table for all activities (Orders, Wallet Loads, Expenses, Service Requests)
-- We store the full object in the 'payload' column as JSON to allow 
-- the app state to evolve without needing constant schema migrations.
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,           -- 'order', 'load', 'expense', 'service'
  userPhone TEXT,               -- NULL for system-wide expenses
  payload TEXT NOT NULL,        -- Full JSON blob of the transaction
  createdAt TEXT NOT NULL       -- ISO 8601 date string
);

-- Indices for faster lookups when filtering by user or activity type
CREATE INDEX IF NOT EXISTS idx_transactions_phone ON transactions(userPhone);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);