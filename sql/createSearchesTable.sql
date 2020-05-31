CREATE TABLE IF NOT EXISTS searches
(
  source_id INTEGER NOT NULL,
  target_id INTEGER NOT NULL,
  duration REAL NOT NULL,
  degrees_count INTEGER,
  paths_count INTEGER NOT NULL,
  t TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX searches_ids_index ON searches(source_id, target_id);
