"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import StreetView from "@/components/streetview";
import MapsSelector from "@/components/mapselector";
import { getDb } from "@/lib/db";
import { syncCollections } from "@/lib/sync";
import { distanceKm, scoreFor, type Pt } from "@/lib/geo";
import { MODES, ROUNDS, type Mode } from "@/lib/modes";

type Phase = "menu" | "round" | "reveal" | "final";
type Col = { col_id: string; col_name: string; col_desc: string | null; n: number };
type Loc = { loc_id: string; loc_latitude: number; loc_longitude: number; loc_image: string };

const COLS_SQL = `SELECT c.col_id, c.col_name, c.col_desc, COUNT(l.loc_id)::int AS n
  FROM collections c LEFT JOIN locations l USING (col_id)
  GROUP BY c.col_id ORDER BY c.col_name`;

const fmt = (s: number) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;
const btn = "px-4 py-2 border-2 border-[#2b2b24] text-left";

export default function Game() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [cols, setCols] = useState<Col[]>([]);
  const [best, setBest] = useState<Record<string, number>>({});
  const [colId, setColId] = useState("");
  const [mode, setMode] = useState<Mode>("easy");
  const [locs, setLocs] = useState<Loc[]>([]);
  const [idx, setIdx] = useState(0);
  const [guess, setGuess] = useState<Pt | null>(null);
  const [result, setResult] = useState<{ km: number | null; pts: number } | null>(null);
  const [total, setTotal] = useState(0);
  const [clock, setClock] = useState(0);
  const [status, setStatus] = useState("");

  const cfg = MODES[mode];
  const loc = locs[idx];

  const loadMenu = useCallback(async () => {
    const db = await getDb();
    let list = (await db.query<Col>(COLS_SQL)).rows;
    if (!list.length && navigator.onLine) {
      setStatus("Downloading collections");
      await syncCollections();
      setStatus("");
      list = (await db.query<Col>(COLS_SQL)).rows;
    }
    const b = (await db.query<{ mode: string; best: number }>(`SELECT mode, MAX(total)::int AS best FROM scores GROUP BY mode`)).rows;
    setCols(list);
    setBest(Object.fromEntries(b.map((r) => [r.mode, r.best])));
    setColId((c) => c || list[0]?.col_id || "");
  }, []);

  useEffect(() => {
    if (phase === "menu") loadMenu().catch(() => setStatus("Storage unavailable"));
  }, [phase, loadMenu]);

  const submit = useCallback(() => {
    const l = locs[idx];
    if (!l) return;
    let km: number | null = null;
    let pts = 0;
    if (guess) {
      km = distanceKm(guess, { lat: l.loc_latitude, lng: l.loc_longitude });
      pts = Math.round(scoreFor(km) * MODES[mode].mult);
    }
    setResult({ km, pts });
    setTotal((t) => t + pts);
    setPhase("reveal");
  }, [locs, idx, guess, mode]);

  useEffect(() => {
    if (phase !== "round") return;
    const id = setInterval(() => setClock((c) => (cfg.seconds ? c - 1 : c + 1)), 1000);
    return () => clearInterval(id);
  }, [phase, cfg.seconds]);

  useEffect(() => {
    if (phase === "round" && cfg.seconds && clock <= 0) submit();
  }, [clock, phase, cfg.seconds, submit]);

  async function start() {
    const db = await getDb();
    const r = await db.query<Loc>(
      `SELECT loc_id, loc_latitude, loc_longitude, loc_image FROM locations WHERE col_id = $1 ORDER BY random() LIMIT $2`,
      [colId, ROUNDS]
    );
    if (!r.rows.length) return;
    setLocs(r.rows);
    setIdx(0);
    setTotal(0);
    setGuess(null);
    setResult(null);
    setClock(cfg.seconds);
    setPhase("round");
  }

  async function next() {
    if (idx + 1 >= locs.length) {
      const db = await getDb();
      await db.query(`INSERT INTO scores (col_id, mode, total) VALUES ($1, $2, $3)`, [colId, mode, total]);
      setPhase("final");
      return;
    }
    setIdx((i) => i + 1);
    setGuess(null);
    setResult(null);
    setClock(cfg.seconds);
    setPhase("round");
  }

  const answer = loc ? { lat: loc.loc_latitude, lng: loc.loc_longitude } : null;
  const playing = phase === "round" || phase === "reveal";

  return (
    <main className="min-h-screen bg-[#d9d4bd]">
      {playing && loc && <StreetView key={`${loc.loc_id}-${mode}`} src={loc.loc_image} mode={mode} />}

      <div className="flex items-center w-full h-20 gap-3 p-6 bg-[#e8e4d3] fixed top-0 left-0 z-50">
        <Link href="/">
          <Image className="object-contain" src="/logo.svg" alt="" width={128} height={32} priority />
        </Link>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-400" />
        <Image src="/icons/timer.svg" alt="" width={32} height={32} priority />
        <p className="text-xl tabular-nums">{playing ? fmt(clock) : "0:00"}</p>
        {playing && (
          <p className="ml-4 text-lg">
            {idx + 1}/{locs.length} · {total}
          </p>
        )}
        <button className="ml-auto" onClick={() => setPhase("menu")}>
          <Image src="/icons/menu.svg" alt="" width={32} height={32} priority />
        </button>
      </div>

      {phase === "round" && (
        <div className="fixed bottom-0 right-0 z-50 w-[min(94vw,520px)] bg-[#e8e4d3] border-2 border-[#2b2b24]">
          <MapsSelector guess={guess} onGuess={setGuess} />
          <button disabled={!guess} onClick={submit} className="w-full py-3 text-lg bg-[#2b2b24] text-[#e8e4d3] disabled:opacity-40">
            Guess
          </button>
        </div>
      )}

      {phase === "reveal" && result && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-[min(96vw,760px)] bg-[#e8e4d3] border-2 border-[#2b2b24]">
            <MapsSelector guess={guess} answer={answer} />
            <div className="flex items-center justify-between p-4">
              <p className="text-lg">
                {result.km === null ? "No guess placed" : `${Math.round(result.km).toLocaleString()} km away`} · +{result.pts}
              </p>
              <button onClick={next} className="px-6 py-2 bg-[#2b2b24] text-[#e8e4d3]">
                {idx + 1 >= locs.length ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "final" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-[min(92vw,420px)] bg-[#e8e4d3] border-2 border-[#2b2b24] p-8 flex flex-col gap-4">
            <p className="text-5xl tabular-nums">{total}</p>
            <p>of {Math.round(ROUNDS * 5000 * cfg.mult)} possible on {cfg.label}</p>
            <button className={btn} onClick={start}>Play again</button>
            <button className={btn} onClick={() => setPhase("menu")}>Menu</button>
          </div>
        </div>
      )}

      {phase === "menu" && (
        <div className="min-h-screen flex items-center justify-center pt-20 p-4">
          <div className="w-[min(94vw,480px)] bg-[#e8e4d3] border-2 border-[#2b2b24] p-6 flex flex-col gap-3">
            <p className="text-lg">Collection</p>
            {cols.length === 0 && <p className="text-sm">{status || "No collections saved. Connect once to download them."}</p>}
            {cols.map((c) => (
              <button key={c.col_id} onClick={() => setColId(c.col_id)} className={`${btn} ${colId === c.col_id ? "bg-[#2b2b24] text-[#e8e4d3]" : ""}`}>
                {c.col_name} · {c.n}
                {c.col_desc && <span className="block text-sm opacity-70">{c.col_desc}</span>}
              </button>
            ))}
            <p className="text-lg mt-2">Difficulty</p>
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`${btn} ${mode === m ? "bg-[#2b2b24] text-[#e8e4d3]" : ""}`}>
                {MODES[m].label} ×{MODES[m].mult}
                <span className="block text-sm opacity-70">
                  {MODES[m].desc}
                  {best[m] ? ` · best ${best[m]}` : ""}
                </span>
              </button>
            ))}
            <button disabled={!colId} onClick={start} className="mt-2 py-3 text-lg bg-[#2b2b24] text-[#e8e4d3] disabled:opacity-40">
              Start
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
