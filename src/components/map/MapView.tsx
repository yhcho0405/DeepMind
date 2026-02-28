"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { MonsterRecord } from "@/lib/schemas";
import { getAllMonsters, getBlob } from "@/lib/storage";
import { getRarityColor, getRarityLabel } from "@/lib/scoring";
import { useAppStore } from "@/lib/store";

// Dynamic import to avoid SSR issues with leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function MapView() {
  const [monsters, setMonsters] = useState<MonsterRecord[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);
  const { setActiveTab, setSelectedMonsterId } = useAppStore();

  useEffect(() => {
    setIsClient(true);
    loadMonsters();
  }, []);

  const loadMonsters = async () => {
    const all = await getAllMonsters();
    setMonsters(all);
    const urls: Record<string, string> = {};
    for (const m of all) {
      const blob = await getBlob(m.monsterImageKey);
      if (blob) urls[m.id] = URL.createObjectURL(blob);
    }
    setImageUrls(urls);
  };

  // Default center: Seoul
  const center: [number, number] = monsters.length > 0
    ? [monsters[0].location.lat, monsters[0].location.lng]
    : [37.5665, 126.978];

  if (!isClient) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="animate-spin">
          <span className="material-symbols-outlined text-main text-3xl">
            progress_activity
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {monsters.map((monster) => (
            <Marker
              key={monster.id}
              position={[monster.location.lat, monster.location.lng]}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <div className="flex items-center gap-3 mb-2">
                    {imageUrls[monster.id] && (
                      <img
                        src={imageUrls[monster.id]}
                        alt={monster.creative.monster_name_ko}
                        className="w-12 h-12 object-contain rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-sm">
                        {monster.creative.monster_name_ko}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Lv.{monster.stats.level}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{
                        backgroundColor: getRarityColor(monster.stats.rarity),
                      }}
                    >
                      {getRarityLabel(monster.stats.rarity)}
                    </span>
                    <span className="text-xs text-slate-500">
                      Impact: {monster.stats.impact_score}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMonsterId(monster.id);
                      setActiveTab("dex");
                    }}
                    className="w-full text-center bg-[#FF9919] text-white text-xs font-bold py-1.5 rounded hover:opacity-90 transition"
                  >
                    View in Dex
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Floating collection stat */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-white/85 dark:bg-bg-dark/85 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-main/20 p-2 rounded-lg text-main">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Collection</p>
              <h3 className="text-lg font-bold leading-none">
                {monsters.length} Monsters
              </h3>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
