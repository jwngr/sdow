CREATE TABLE IF NOT EXISTS pages
(
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  redirect_id INTEGER,
  popularity INTEGER,
  to_links TEXT,
  from_links TEXT
);

.mode csv
.separator "\t"
.import /dev/stdin pages

CREATE INDEX pages_title_index ON pages(title COLLATE NOCASE);
