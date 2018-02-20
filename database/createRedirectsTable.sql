CREATE TABLE IF NOT EXISTS redirects
(
  source_id INTEGER PRIMARY KEY,
  target_id INTEGER NOT NULL
);

.mode csv
.separator "\t"
.import /dev/stdin redirects
