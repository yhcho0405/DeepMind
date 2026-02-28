"use client";

import dynamic from "next/dynamic";
import { useAppStore } from "@/lib/store";
import BottomNav from "@/components/layout/BottomNav";
import CapturePanel from "@/components/capture/CapturePanel";
import AnalysisCard from "@/components/analysis/AnalysisCard";
import MonsterRevealDialog from "@/components/collect/MonsterRevealDialog";
import SettingsDialog from "@/components/settings/SettingsDialog";

// Dynamic imports to avoid SSR issues
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <main className="flex-1 flex items-center justify-center">
      <div className="animate-spin">
        <span className="material-symbols-outlined text-main text-3xl">
          progress_activity
        </span>
      </div>
    </main>
  ),
});

const DexGrid = dynamic(() => import("@/components/dex/DexGrid"), {
  ssr: false,
  loading: () => (
    <main className="flex-1 flex items-center justify-center">
      <div className="animate-spin">
        <span className="material-symbols-outlined text-main text-3xl">
          progress_activity
        </span>
      </div>
    </main>
  ),
});

export default function Home() {
  const { activeTab, captureStep } = useAppStore();

  return (
    <>
      {/* Header */}
      <Header />

      {/* Main content area */}
      {activeTab === "capture" && (
        <>
          {(captureStep === "idle" || !captureStep) && <CapturePanel />}
          {(captureStep === "analyzing" || captureStep === "analyzed") && (
            <AnalysisCard />
          )}
          {(captureStep === "collecting" || captureStep === "collected") && (
            <MonsterRevealDialog />
          )}
        </>
      )}
      {activeTab === "map" && <MapView />}
      {activeTab === "dex" && <DexGrid />}

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Settings dialog */}
      <SettingsDialog />
    </>
  );
}

function Header() {
  const { activeTab, captureStep, setSettingsOpen } = useAppStore();

  // Don't show header on map (it has its own overlay)
  if (activeTab === "map") return null;
  // Don't show header on dex (DexGrid has its own header)
  if (activeTab === "dex") return null;
  // Don't show header when analysis/collect is showing (they have back buttons)
  if (
    activeTab === "capture" &&
    (captureStep === "analyzed" || captureStep === "collecting" || captureStep === "collected")
  )
    return null;

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        CivicQuest Seoul
      </h1>
      <button
        onClick={() => setSettingsOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"
      >
        <span className="material-symbols-outlined">settings</span>
      </button>
    </header>
  );
}
