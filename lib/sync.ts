import { getDb } from "./db";

type Manifest = {
  collections: {
    id: string;
    name: string;
    desc: string;
    locations: { id: string; lat: number; lng: number; image: string; credit?: string }[];
  }[];
};

export async function syncCollections(onProgress?: (done: number, total: number) => void) {
  const res = await fetch("/data/collections.json", { cache: "no-store" });
  const manifest: Manifest = await res.json();
  const db = await getDb();
  const cache = await caches.open("panos");
  const total = manifest.collections.reduce((n, c) => n + c.locations.length, 0);
  let done = 0;
  for (const c of manifest.collections) {
    await db.query(
      `INSERT INTO collections (col_id, col_name, col_desc) VALUES ($1, $2, $3)
       ON CONFLICT (col_id) DO UPDATE SET col_name = EXCLUDED.col_name, col_desc = EXCLUDED.col_desc`,
      [c.id, c.name, c.desc]
    );
    for (const l of c.locations) {
      if (!(await cache.match(l.image))) await cache.add(l.image);
      await db.query(
        `INSERT INTO locations (loc_id, col_id, loc_latitude, loc_longitude, loc_image, loc_credit)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (loc_id) DO UPDATE SET col_id = EXCLUDED.col_id, loc_latitude = EXCLUDED.loc_latitude,
           loc_longitude = EXCLUDED.loc_longitude, loc_image = EXCLUDED.loc_image, loc_credit = EXCLUDED.loc_credit`,
        [l.id, c.id, l.lat, l.lng, l.image, l.credit ?? null]
      );
      done++;
      onProgress?.(done, total);
    }
  }
}
