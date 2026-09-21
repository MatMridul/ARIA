/** Application shell — a cyber-financial mission control console.
 * Semantic nav grouping (CONTROL / SYSTEM / PROOF), compact run context, hairline
 * structure, global Command Palette, and interactive System Guide & Tour.
 */
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/design/ui";
import { useAppStore } from "@/lib";
import { useOperatorShortcuts } from "@/lib/useOperatorShortcuts";
import { CommandPalette } from "@/components/command/CommandPalette";
import { SystemGuideDialog, GuidedTour } from "@/components/help";
import { PostMortemDialog } from "@/components/verdict/PostMortemDialog";
import { NodeInspectorDrawer } from "@/components/inspector/NodeInspectorDrawer";
import { WhatIfModal } from "@/components/sandbox/WhatIfModal";
import {
  Activity,
  BarChart3,
  Dna,
  FileCode,
  HelpCircle,
  Layers,
  LayoutDashboard,
  Network,
  Shield,
  Terminal,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

const GROUPS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Control Plane",
    items: [
      { to: "/", label: "Command Center", icon: LayoutDashboard, end: true },
      { to: "/connect", label: "Topology Importer", icon: Layers },
    ],
  },
  {
    heading: "System Telemetry",
    items: [
      { to: "/topology", label: "Living Network", icon: Network },
      { to: "/incidents", label: "Incident RCA", icon: Dna },
    ],
  },
  {
    heading: "Empirical Proof",
    items: [
      { to: "/evaluation", label: "Pareto Frontier", icon: BarChart3 },
      { to: "/audit", label: "Execution Audit", icon: FileCode },
    ],
  },
];

export function AppShell() {
  const { scenario, customTopology, setCommandPaletteOpen, setHelpDialogOpen } = useAppStore();
  useOperatorShortcuts();

  return (
    <div className="flex h-full bg-bg-base text-text-primary selection:bg-accent/30">
      {/* Global Command Palette, Guidance Tour, Inspector, & Modals */}
      <CommandPalette />
      <SystemGuideDialog />
      <GuidedTour />
      <PostMortemDialog />
      <NodeInspectorDrawer />
      <WhatIfModal />

      <aside className="flex w-60 shrink-0 flex-col border-r border-white/[0.06] bg-[#07080C]/95 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/40 bg-accent/15 shadow-[0_0_12px_rgba(99,102,241,0.4)]">
              <Shield className="h-4 w-4 text-accent" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                ARIA <span className="text-[10px] font-mono text-accent font-semibold px-1 py-0.2 rounded bg-accent/10 border border-accent/20">v2.0</span>
              </div>
              <div className="text-3xs uppercase tracking-widest text-text-muted">
                Mission Control
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setHelpDialogOpen(true)}
              className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-text-muted hover:text-white transition-colors"
              title="Open System Architecture Guide (?)"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-text-muted hover:text-white transition-colors"
              title="Open Command Palette (Cmd + K)"
            >
              <Terminal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Semantic Nav Groups */}
        <nav className="flex flex-1 flex-col gap-6 px-3 py-4 overflow-y-auto">
          {GROUPS.map((g) => (
            <div key={g.heading}>
              <div className="px-2 pb-1.5 text-3xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                {g.heading}
              </div>
              <div className="flex flex-col gap-0.5">
                {g.items.map((n) => {
                  const Icon = n.icon;
                  return (
                    <NavLink
                      key={n.to}
                      to={n.to}
                      end={n.end}
                      className={({ isActive }) =>
                        cn(
                          "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all duration-150",
                          isActive
                            ? "bg-white/[0.08] text-white border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] shadow-glow-accent/20"
                            : "text-text-secondary hover:bg-white/[0.03] hover:text-white"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              isActive ? "text-accent" : "text-text-muted group-hover:text-text-secondary"
                            )}
                          />
                          <span>{n.label}</span>
                          {isActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Dynamic Run Context Footer */}
        <div className="border-t border-white/[0.06] p-3.5 bg-black/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-3xs uppercase tracking-widest text-text-muted font-semibold">
              Live Session
            </span>
            {customTopology && (
              <span className="rounded-full bg-status-info/15 border border-status-info/30 px-1.5 py-0.2 text-[9px] font-medium text-status-info">
                Custom Topo
              </span>
            )}
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 space-y-1">
            <div className="flex items-center justify-between text-2xs font-mono">
              <span className="text-text-muted">SEED</span>
              <span className="font-bold text-text-primary">#{String(scenario.seed).padStart(2, "0")}</span>
            </div>
            <div className="flex items-center justify-between text-2xs font-mono">
              <span className="text-text-muted">RISK τ</span>
              <span className="font-bold text-accent">{scenario.intervention_threshold.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => setHelpDialogOpen(true)}
            className="w-full flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] px-2.5 py-1.5 text-3xs font-medium text-text-secondary hover:text-white transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="h-3 w-3 text-accent" />
              <span>Interactive Guide & Tour</span>
            </span>
            <span className="font-mono text-[9px] bg-white/[0.1] px-1.5 py-0.2 rounded font-bold">?</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-bg-base overflow-hidden">
        <main className="min-h-0 flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
