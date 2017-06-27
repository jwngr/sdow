CREATE TABLE redirects(from_id INTEGER, to_id INTEGER);

.mode csv
.separator "\t"
.import /dev/stdin redirects

CREATE INDEX redirects_from_id_index ON redirects(from_id);
