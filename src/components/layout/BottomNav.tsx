"use client";

import { useAppStore, type AppTab } from "@/lib/store";

const tabs: { id: AppTab; icon: string; label: string }[] = [
  { id: "map", icon: "map", label: "Map" },
  { id: "capture", icon: "photo_camera", label: "Scan" },
  { id: "dex", icon: "auto_stories", label: "Dex" },
];

export default function BottomNav() {
  const { activeTab, setActiveTab, setSettingsOpen } = useAppStore();

  return (
    <nav className="absolute bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-bg-dark/90 backdrop-blur-md px-6 pb-6 pt-3 z-50">
      <div className="flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isCenter = tab.id === "capture";

          if (isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative -top-6"
              >
                <div
                  className={`size-14 rounded-full shadow-xl flex items-center justify-center border-4 border-white dark:border-bg-dark transition-all ${
                    isActive
                      ? "bg-main text-white shadow-main/40"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl">
                    {tab.icon}
                  </span>
                </div>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive
                  ? "text-main"
                  : "text-slate-400 hover:text-main"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={
                  isActive
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {tab.icon}
              </span>
              <span className="text-[10px] font-bold uppercase">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Settings button */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-main transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-bold uppercase">Settings</span>
        </button>
      </div>
    </nav>
  );
}
