CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  synopsis TEXT NOT NULL,
  character_desc TEXT NOT NULL,
  page_count INTEGER NOT NULL CHECK(page_count >= 6 AND page_count <= 10),
  art_style_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  page_story TEXT NOT NULL DEFAULT '',
  image_r2_key TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE(book_id, page_number)
);
