-- Document collections (ADR 0007).
CREATE TABLE IF NOT EXISTS documents (
  collection text NOT NULL,
  id text NOT NULL,
  data jsonb NOT NULL,
  PRIMARY KEY (collection, id)
);
CREATE INDEX IF NOT EXISTS documents_data ON documents USING gin (data jsonb_path_ops);

-- Uploaded and processed media: photos and certificate copies.
CREATE TABLE IF NOT EXISTS media (
  id text PRIMARY KEY,
  content_type text NOT NULL,
  bytes bytea NOT NULL
);
