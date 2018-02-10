CREATE TABLE IF NOT EXISTS from_links(
  id INTEGER PRIMARY KEY,
  from_links TEXT NOT NULL
);

.mode csv
.separator "\t"
.import /dev/stdin from_links
