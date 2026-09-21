import * as React from "react";
import { useAppStore } from "./store";
import type { IncidentTypeId } from "./schemas";

const INCIDENT_MAP: Record<string, IncidentTypeId> = {
  "1": "A_shared_bank",
  "2": "B_single_psp",
  "3": "C_method",
  "4": "D_ambiguous",
  "5": "E_coincidental",
};

export function useOperatorShortcuts() {
  const {
    togglePlayback,
    selectedWindow,
    setSelectedWindow,
    setScenario,
    viewLens,
    setViewLens,
    postMortemOpen,
    setPostMortemOpen,
    whatIfOpen,
    setWhatIfOpen,
    helpDialogOpen,
    setHelpDialogOpen,
    inspectorOpen,
    setInspectorOpen,
    commandPaletteOpen,
    setCommandPaletteOpen,
  } = useAppStore();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        target.closest("[role='dialog']")?.contains(target) && e.key !== "Escape"
      ) {
        return;
      }

      // Ignore if modifier keys (Cmd, Ctrl, Alt) are active to protect browser hotkeys (Cmd+D, Cmd+1, etc.)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // Space: Toggle Playback
      if (e.code === "Space") {
        e.preventDefault();
        togglePlayback();
        return;
      }

      // [ : Step Back
      if (e.key === "[") {
        e.preventDefault();
        setSelectedWindow(Math.max(0, selectedWindow - 1));
        return;
      }

      // ] : Step Forward
      if (e.key === "]") {
        e.preventDefault();
        setSelectedWindow(Math.min(19, selectedWindow + 1));
        return;
      }

      // 1-5: Incident selection
      if (INCIDENT_MAP[e.key]) {
        e.preventDefault();
        setScenario({ incident_type: INCIDENT_MAP[e.key] });
        return;
      }

      // E: Toggle Lens
      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        setViewLens(viewLens === "executive" ? "forensic" : "executive");
        return;
      }

      // D: Open Post-Mortem Dossier
      if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        setPostMortemOpen(!postMortemOpen);
        return;
      }

      // W: Open What-If Sandbox
      if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        setWhatIfOpen(!whatIfOpen);
        return;
      }

      // ?: Open Architecture Guide
      if (e.key === "?") {
        e.preventDefault();
        setHelpDialogOpen(!helpDialogOpen);
        return;
      }

      // Esc: Close any active overlays
      if (e.key === "Escape") {
        if (inspectorOpen) setInspectorOpen(false);
        if (postMortemOpen) setPostMortemOpen(false);
        if (whatIfOpen) setWhatIfOpen(false);
        if (helpDialogOpen) setHelpDialogOpen(false);
        if (commandPaletteOpen) setCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    togglePlayback,
    selectedWindow,
    setSelectedWindow,
    setScenario,
    viewLens,
    setViewLens,
    postMortemOpen,
    setPostMortemOpen,
    whatIfOpen,
    setWhatIfOpen,
    helpDialogOpen,
    setHelpDialogOpen,
    inspectorOpen,
    setInspectorOpen,
    commandPaletteOpen,
    setCommandPaletteOpen,
  ]);
}
