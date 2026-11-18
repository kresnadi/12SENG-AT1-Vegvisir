export type Pt = { lat: number; lng: number };

const R = 6371;
const rad = (d: number) => (d * Math.PI) / 180;

export function distanceKm(a: Pt, b: Pt) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export const scoreFor = (km: number) => Math.round(5000 * Math.exp(-km / 1492.7));
