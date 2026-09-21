/** Global scenario, playback, navigation, guidance, and persona lens store.
 * Synchronizes active scenario selection (incident, seed, threshold, system),
 * 20-window time-travel scrubber, slide-over drawer selection, command palette,
 * executive vs. forensic lens, and guided help tour across all views.
 */
import { create } from "zustand";
import type { SimulateRequest, Topology } from "./schemas";

export type ViewLens = "executive" | "forensic";
export type MerchantProfileId = "ecommerce_retail" | "quick_commerce" | "travel_airlines" | "enterprise_saas";

export interface MerchantProfileConfig {
  id: MerchantProfileId;
  name: string;
  tagline: string;
  aov: number; // in INR
  tps: number;
  multiplier: number; // financial scaling multiplier
  timeoutMs: number;
  badge: string;
}

export const MERCHANT_PROFILES: Record<MerchantProfileId, MerchantProfileConfig> = {
  ecommerce_retail: {
    id: "ecommerce_retail",
    name: "E-Commerce Flagship",
    tagline: "High volume apparel & electronics",
    aov: 2800,
    tps: 6500,
    multiplier: 1.0,
    timeoutMs: 800,
    badge: "Retail Scale",
  },
  quick_commerce: {
    id: "quick_commerce",
    name: "Quick Commerce (10-Min Delivery)",
    tagline: "Ultra-high velocity, instant checkout",
    aov: 450,
    tps: 18500,
    multiplier: 0.45,
    timeoutMs: 350,
    badge: "Zepto / Blinkit",
  },
  travel_airlines: {
    id: "travel_airlines",
    name: "Travel & Airlines Booking",
    tagline: "High ticket size, high drop penalty",
    aov: 14500,
    tps: 1200,
    multiplier: 3.8,
    timeoutMs: 1200,
    badge: "Airlines / OTA",
  },
  enterprise_saas: {
    id: "enterprise_saas",
    name: "Enterprise B2B Recurring SaaS",
    tagline: "Mandates & subscription billing",
    aov: 48000,
    tps: 450,
    multiplier: 6.2,
    timeoutMs: 2000,
    badge: "Global SaaS",
  },
};

export interface AppState {
  scenario: SimulateRequest;
  customTopology: Topology | null;
  selectedWindow: number;
  isPlaying: boolean;
  playbackSpeed: number; // 1, 2, 5
  selectedNodeId: string | null;
  commandPaletteOpen: boolean;
  helpDialogOpen: boolean;
  postMortemOpen: boolean;
  inspectorOpen: boolean;
  whatIfOpen: boolean;
  whatIfReroutePercent: number; // 0 - 100
  whatIfCapacityPercent: number; // 50 - 100
  merchantProfile: MerchantProfileId;
  storyAutoplay: boolean;
  tourActive: boolean;
  tourStep: number;
  viewLens: ViewLens;

  setScenario: (update: Partial<SimulateRequest>) => void;
  setCustomTopology: (topo: Topology | null) => void;
  setSelectedWindow: (window: number | ((prev: number) => number)) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setHelpDialogOpen: (open: boolean) => void;
  setPostMortemOpen: (open: boolean) => void;
  setInspectorOpen: (open: boolean) => void;
  setWhatIfOpen: (open: boolean) => void;
  setWhatIfReroutePercent: (percent: number) => void;
  setWhatIfCapacityPercent: (percent: number) => void;
  setMerchantProfile: (profile: MerchantProfileId) => void;
  setStoryAutoplay: (autoplay: boolean) => void;
  setTourActive: (active: boolean) => void;
  setTourStep: (step: number) => void;
  setViewLens: (lens: ViewLens) => void;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endTour: () => void;
}

export const DEFAULT_SCENARIO: SimulateRequest = {
  incident_type: "A_shared_bank",
  seed: 7,
  intervention_threshold: 0.70,
  system: "ariadne",
};

export const useAppStore = create<AppState>((set) => ({
  scenario: DEFAULT_SCENARIO,
  customTopology: null,
  selectedWindow: 19,
  isPlaying: false,
  playbackSpeed: 1,
  selectedNodeId: null,
  commandPaletteOpen: false,
  helpDialogOpen: false,
  postMortemOpen: false,
  inspectorOpen: false,
  whatIfOpen: false,
  whatIfReroutePercent: 100,
  whatIfCapacityPercent: 100,
  merchantProfile: "ecommerce_retail",
  storyAutoplay: false,
  tourActive: false,
  tourStep: 0,
  viewLens: "forensic",

  setScenario: (update) =>
    set((state) => ({
      scenario: { ...state.scenario, ...update },
    })),
  setCustomTopology: (customTopology) => set({ customTopology }),
  setSelectedWindow: (selectedWindow) =>
    set((state) => ({
      selectedWindow:
        typeof selectedWindow === "function"
          ? selectedWindow(state.selectedWindow)
          : selectedWindow,
    })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setSelectedNodeId: (selectedNodeId) =>
    set({ selectedNodeId, inspectorOpen: selectedNodeId !== null }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setHelpDialogOpen: (helpDialogOpen) => set({ helpDialogOpen }),
  setPostMortemOpen: (postMortemOpen) => set({ postMortemOpen }),
  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
  setWhatIfOpen: (whatIfOpen) => set({ whatIfOpen }),
  setWhatIfReroutePercent: (whatIfReroutePercent) => set({ whatIfReroutePercent }),
  setWhatIfCapacityPercent: (whatIfCapacityPercent) => set({ whatIfCapacityPercent }),
  setMerchantProfile: (merchantProfile) => set({ merchantProfile }),
  setStoryAutoplay: (storyAutoplay) => set({ storyAutoplay }),
  setTourActive: (tourActive) => set({ tourActive }),
  setTourStep: (tourStep) => set({ tourStep }),
  setViewLens: (viewLens) => set({ viewLens }),
  startTour: () => set({ tourActive: true, tourStep: 0, helpDialogOpen: false, postMortemOpen: false, inspectorOpen: false, whatIfOpen: false }),
  nextTourStep: () => set((state) => ({ tourStep: state.tourStep + 1 })),
  prevTourStep: () => set((state) => ({ tourStep: Math.max(0, state.tourStep - 1) })),
  endTour: () => set({ tourActive: false, tourStep: 0 }),
}));
