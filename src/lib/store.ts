import { create } from "zustand";
import type { AnalysisResult, ComputedStats, CreativeResult, MonsterRecord } from "./schemas";

export type AppTab = "capture" | "map" | "dex";
export type CaptureStep = "idle" | "analyzing" | "analyzed" | "collecting" | "collected";

interface AppState {
  // Navigation
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Capture session
  captureStep: CaptureStep;
  setCaptureStep: (step: CaptureStep) => void;
  capturedImage: File | null;
  setCapturedImage: (file: File | null) => void;
  capturedImageUrl: string | null;
  setCapturedImageUrl: (url: string | null) => void;
  location: { lat: number; lng: number; address?: string } | null;
  setLocation: (loc: { lat: number; lng: number; address?: string } | null) => void;

  // Analysis result
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (r: AnalysisResult | null) => void;

  // Computed stats
  computedStats: ComputedStats | null;
  setComputedStats: (s: ComputedStats | null) => void;
  integrityToken: string | null;
  setIntegrityToken: (t: string | null) => void;

  // Creative result
  creativeResult: CreativeResult | null;
  setCreativeResult: (c: CreativeResult | null) => void;

  // Generated assets
  monsterImageUrl: string | null;
  setMonsterImageUrl: (url: string | null) => void;
  audioCryUrl: string | null;
  setAudioCryUrl: (url: string | null) => void;

  // Current collected monster
  collectedMonster: MonsterRecord | null;
  setCollectedMonster: (m: MonsterRecord | null) => void;

  // Dex
  selectedMonsterId: string | null;
  setSelectedMonsterId: (id: string | null) => void;

  // Settings
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;

  // Reset session
  resetSession: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "capture",
  setActiveTab: (tab) => set({ activeTab: tab }),

  captureStep: "idle",
  setCaptureStep: (step) => set({ captureStep: step }),
  capturedImage: null,
  setCapturedImage: (file) => set({ capturedImage: file }),
  capturedImageUrl: null,
  setCapturedImageUrl: (url) => set({ capturedImageUrl: url }),
  location: null,
  setLocation: (loc) => set({ location: loc }),

  analysisResult: null,
  setAnalysisResult: (r) => set({ analysisResult: r }),
  computedStats: null,
  setComputedStats: (s) => set({ computedStats: s }),
  integrityToken: null,
  setIntegrityToken: (t) => set({ integrityToken: t }),

  creativeResult: null,
  setCreativeResult: (c) => set({ creativeResult: c }),

  monsterImageUrl: null,
  setMonsterImageUrl: (url) => set({ monsterImageUrl: url }),
  audioCryUrl: null,
  setAudioCryUrl: (url) => set({ audioCryUrl: url }),

  collectedMonster: null,
  setCollectedMonster: (m) => set({ collectedMonster: m }),

  selectedMonsterId: null,
  setSelectedMonsterId: (id) => set({ selectedMonsterId: id }),

  settingsOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),

  resetSession: () =>
    set({
      captureStep: "idle",
      capturedImage: null,
      capturedImageUrl: null,
      location: null,
      analysisResult: null,
      computedStats: null,
      integrityToken: null,
      creativeResult: null,
      monsterImageUrl: null,
      audioCryUrl: null,
      collectedMonster: null,
    }),
}));
