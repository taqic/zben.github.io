-- Feedback submissions for zbens.com apps
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  app_id TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  email TEXT,
  message TEXT NOT NULL,
  rating INTEGER,
  user_agent TEXT,
  ip_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_app_id ON feedback(app_id);
