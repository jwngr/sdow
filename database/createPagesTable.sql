CREATE TABLE pages(id INTEGER, name TEXT);

.mode csv
.separator "\t"
.import /dev/stdin pages

CREATE INDEX pages_id_index ON pages(id);
CREATE INDEX pages_name_index ON pages(name);
