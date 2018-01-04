CREATE TABLE links(from_id INTEGER, to_id INTEGER);

.mode csv
.separator "\t"
.import /dev/stdin links

CREATE INDEX links_from_id_index ON links(from_id, to_id);
CREATE INDEX links_to_id_index ON links(to_id, from_id);
