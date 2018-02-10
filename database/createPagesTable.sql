CREATE TABLE IF NOT EXISTS pages
(
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  from_links_count INTEGER NOT NULL,
  to_links_count INTEGER NOT NULL
);

.mode csv
.separator "\t"
.import /dev/stdin pages

CREATE INDEX pages_title_index ON pages(title COLLATE NOCASE);
