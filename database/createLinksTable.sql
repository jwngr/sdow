CREATE TABLE IF NOT EXISTS links(
  from_id INTEGER,
  to_id INTEGER,
  PRIMARY KEY (from_id, to_id)
) WITHOUT ROWID;

.mode csv
.separator "\t"
.import /dev/stdin links

CREATE INDEX links_to_id_index ON links(to_id, from_id);
