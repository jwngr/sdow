CREATE TABLE IF NOT EXISTS pages
(
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  is_redirect INTEGER NOT NULL 
);

.mode csv
.separator "\t"
.import /dev/stdin pages

CREATE INDEX pages_title_index ON pages(title COLLATE NOCASE);
