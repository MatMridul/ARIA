import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Building2,
  CheckCircle,
  Dna,
  FileCode,
  Gauge,
  Layers,
  LayoutDashboard,
  Network,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import type { IncidentTypeId } from "@/lib/schemas";

export function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setScenario,
    setSelectedWindow,
    setIsPlaying,
  } = useAppStore();
  const navigate = useNavigate();

  // Listen for Cmd+K and number keys
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const handleSelectScenario = (type: IncidentTypeId) => {
    setScenario({ incident_type: type });
    setSelectedWindow(19);
    setIsPlaying(false);
    setCommandPaletteOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setCommandPaletteOpen(false);
  };

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Type a command or search incidents..." />
      <CommandList>
        <CommandEmpty>No matching commands found.</CommandEmpty>

        {/* Navigation Views */}
        <CommandGroup heading="Navigation & Consoles">
          <CommandItem onSelect={() => handleNavigate("/")}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-accent" />
            <span>Command Center Overview</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/topology")}>
            <Network className="mr-2 h-4 w-4 text-status-healthy" />
            <span>Living Topology Canvas</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/evaluation")}>
            <BarChart3 className="mr-2 h-4 w-4 text-status-info" />
            <span>Evaluation & Pareto Frontier</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/audit")}>
            <FileCode className="mr-2 h-4 w-4 text-text-muted" />
            <span>Simulation Audit Trail & Logs</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/connect")}>
            <Layers className="mr-2 h-4 w-4 text-indigo-400" />
            <span>Import Custom Topology JSON</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Injected Incidents */}
        <CommandGroup heading="Injected Scenario Library">
          <CommandItem onSelect={() => handleSelectScenario("A_shared_bank")}>
            <Dna className="mr-2 h-4 w-4 text-accent" />
            <span>Incident A: Shared Bank Outage (Core Thesis)</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelectScenario("B_single_psp")}>
            <Layers className="mr-2 h-4 w-4 text-status-healthy" />
            <span>Incident B: Isolated Single PSP-1 Failure</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelectScenario("C_method")}>
            <Zap className="mr-2 h-4 w-4 text-status-degraded" />
            <span>Incident C: UPI Payment Method Degradation</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelectScenario("D_ambiguous")}>
            <AlertOctagon className="mr-2 h-4 w-4 text-text-muted" />
            <span>Incident D: Ambiguous Distributed Noise</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelectScenario("E_coincidental")}>
            <Sparkles className="mr-2 h-4 w-4 text-status-down" />
            <span>Incident E: Dual PSP Coincidence</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="System Control & Actions">
          <CommandItem
            onSelect={() => {
              setScenario({ intervention_threshold: 0.7 });
              setCommandPaletteOpen(false);
            }}
          >
            <Gauge className="mr-2 h-4 w-4 text-accent" />
            <span>Reset Risk Appetite Threshold to Baseline (τ = 0.70)</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setSelectedWindow(0);
              setIsPlaying(true);
              setCommandPaletteOpen(false);
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4 text-status-healthy" />
            <span>Play Scenario from Window 00</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
