import * as React from "react";
import { useAppStore } from "@/lib/store";
import { useSimulate } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import { cn } from "@/design/ui";

export function PlaybackControls() {
  const {
    scenario,
    selectedWindow,
    setSelectedWindow,
    isPlaying,
    togglePlayback,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
  } = useAppStore();

  const { data: sim } = useSimulate(scenario);
  const totalWindows = sim?.windows?.length || 20;

  // Auto-play interval effect
  React.useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(200, 1000 / playbackSpeed);
    const timer = setInterval(() => {
      const cur = useAppStore.getState().selectedWindow;
      if (cur >= totalWindows - 1) {
        setIsPlaying(false);
      } else {
        setSelectedWindow(cur + 1);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, totalWindows, setIsPlaying, setSelectedWindow]);

  const handleStepBack = () => {
    setIsPlaying(false);
    setSelectedWindow(Math.max(0, selectedWindow - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setSelectedWindow(Math.min(totalWindows - 1, selectedWindow + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSelectedWindow(0);
  };

  const speeds = [1, 2, 5];

  return (
    <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.08] p-1 rounded-xl backdrop-blur-md">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-text-muted hover:text-text-primary"
        onClick={handleReset}
        title="Reset to Window 0"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-text-muted hover:text-text-primary"
        onClick={handleStepBack}
        disabled={selectedWindow <= 0}
        title="Step Back"
      >
        <SkipBack className="h-3.5 w-3.5" />
      </Button>

      <Button
        variant={isPlaying ? "destructive" : "glass"}
        size="icon"
        className={cn(
          "h-7 w-7 transition-all",
          isPlaying ? "bg-status-healthy text-black hover:bg-status-healthy/90 shadow-[0_0_12px_rgba(16,185,129,0.5)]" : "text-text-primary"
        )}
        onClick={togglePlayback}
        title={isPlaying ? "Pause Simulation" : "Play Simulation"}
      >
        {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-text-muted hover:text-text-primary"
        onClick={handleStepForward}
        disabled={selectedWindow >= totalWindows - 1}
        title="Step Forward"
      >
        <SkipForward className="h-3.5 w-3.5" />
      </Button>

      {/* Speed multiplier selector */}
      <div className="flex items-center ml-1 border-l border-white/[0.08] pl-1.5 gap-0.5">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => setPlaybackSpeed(s)}
            className={cn(
              "px-1.5 py-0.5 text-3xs font-mono font-semibold rounded transition-colors",
              playbackSpeed === s
                ? "bg-white/[0.12] text-accent"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
