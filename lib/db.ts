import type { PGlite } from "@electric-sql/pglite";

const schema = `
CREATE TABLE IF NOT EXISTS collections (
  col_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  col_name VARCHAR(24) NOT NULL,
  col_desc VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS locations (
  loc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  col_id UUID NOT NULL REFERENCES collections(col_id) ON DELETE CASCADE,
  loc_latitude DOUBLE PRECISION NOT NULL,
  loc_longitude DOUBLE PRECISION NOT NULL,
  loc_image TEXT NOT NULL,
  loc_credit TEXT
);
CREATE TABLE IF NOT EXISTS scores (
  score_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  col_id UUID REFERENCES collections(col_id) ON DELETE SET NULL,
  mode VARCHAR(8) NOT NULL,
  total INTEGER NOT NULL,
  played_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

let db: Promise<PGlite> | null = null;

export function getDb() {
  if (!db) {
    db = (async () => {
      const { PGlite } = await import("@electric-sql/pglite");
      const instance = new PGlite("idb://vegvisir");
      await instance.exec(schema);
      return instance;
    })();
  }
  return db;
}
