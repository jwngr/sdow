CREATE TABLE IF NOT EXISTS to_links(
  id INTEGER PRIMARY KEY,
  to_links TEXT NOT NULL
);

.mode csv
.separator "\t"
.import /dev/stdin to_links
