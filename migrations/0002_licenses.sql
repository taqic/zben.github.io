-- License keys issued after Paddle checkout
CREATE TABLE IF NOT EXISTS licenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  transaction_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  license_key TEXT NOT NULL,
  email_sent INTEGER NOT NULL DEFAULT 0,
  product_id TEXT,
  price_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_licenses_email ON licenses(email);
CREATE INDEX IF NOT EXISTS idx_licenses_created_at ON licenses(created_at);
