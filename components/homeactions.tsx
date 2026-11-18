"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { syncCollections } from "@/lib/sync";

export default function HomeActions() {
  const [online, setOnline] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  async function download() {
    try {
      await syncCollections((d, t) => setMsg(`Saving ${d}/${t}`));
      setMsg("Ready offline");
    } catch {
      setMsg("Download failed");
    }
  }

  return (
    <div className="fixed bottom-16 inset-x-0 flex flex-col items-center gap-3 z-10">
      <Link href="/game" className="px-10 py-3 bg-[#e8e4d3] border-2 border-[#2b2b24] text-xl">Play</Link>
      <button disabled={!online} onClick={download} className="px-6 py-2 bg-[#e8e4d3] border border-[#2b2b24] disabled:opacity-40">
        Download for offline
      </button>
      <p className="text-sm bg-[#e8e4d3] px-2">{!online ? "Offline" : msg}</p>
    </div>
  );
}
