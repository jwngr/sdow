CREATE TABLE IF NOT EXISTS redirects(
  from_id INTEGER PRIMARY KEY,
  to_id INTEGER
);

.mode csv
.separator "\t"
.import /dev/stdin redirects
