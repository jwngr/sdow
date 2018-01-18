CREATE TABLE IF NOT EXISTS pages(
  id INTEGER PRIMARY KEY,
  name TEXT,
  popularity INTEGER
);

.mode csv
.separator "\t"
.import /dev/stdin pages

CREATE INDEX pages_name_popularity_index ON pages(name COLLATE NOCASE, popularity DESC);
