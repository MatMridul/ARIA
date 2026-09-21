import * as React from "react";
import { useAppStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Binary,
  BookOpen,
  Building2,
  CheckCircle2,
  Compass,
  Dna,
  FileCode,
  Gauge,
  HelpCircle,
  Keyboard,
  Layers,
  Network,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export function SystemGuideDialog() {
  const { helpDialogOpen, setHelpDialogOpen, startTour } = useAppStore();

  // Listen for ? key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "?" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        setHelpDialogOpen(!helpDialogOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [helpDialogOpen, setHelpDialogOpen]);

  return (
    <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 bg-[#0B0D14]/98 border-white/[0.12]">
        <DialogHeader className="border-b border-white/[0.06] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  ARIA System Architecture & Forensic Guide
                </DialogTitle>
                <DialogDescription className="text-xs text-text-muted mt-0.5">
                  Adaptive Revenue Intelligence & Action — Operational Reference & Mathematical Model
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="glow"
              size="sm"
              onClick={startTour}
              className="text-xs font-bold shadow-glow-accent"
            >
              <Compass className="h-3.5 w-3.5 mr-1.5" /> Start Interactive Tour
            </Button>
          </div>
        </DialogHeader>

        {/* Tabbed Guide Content */}
        <Tabs defaultValue="thesis" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full h-9 bg-white/[0.03] border-white/[0.08]">
            <TabsTrigger value="thesis" className="text-2xs font-semibold">
              <Dna className="h-3 w-3 mr-1" /> Core Thesis
            </TabsTrigger>
            <TabsTrigger value="math" className="text-2xs font-semibold">
              <Binary className="h-3 w-3 mr-1" /> Mathematics
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="text-2xs font-semibold">
              <Layers className="h-3 w-3 mr-1" /> Scenario Catalog
            </TabsTrigger>
            <TabsTrigger value="keybindings" className="text-2xs font-semibold">
              <Keyboard className="h-3 w-3 mr-1" /> Keybindings
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Core Thesis */}
          <TabsContent value="thesis" className="space-y-4 pt-3 text-xs leading-relaxed text-text-secondary">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Network className="h-4 w-4 text-accent" />
                The Shared Dependency Problem in Modern Payments
              </h4>
              <p>
                In production payment architectures, a single upstream acquirer or clearing bank (e.g. <strong className="text-white font-mono">Bank-A</strong>) is often shared by multiple independent Payment Service Providers (e.g. <strong className="text-white font-mono">PSP-1</strong> and <strong className="text-white font-mono">PSP-2</strong>).
              </p>
              <p>
                When <strong className="text-status-down font-mono">Bank-A</strong> suffers an internal outage, payments fail across both PSPs simultaneously.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-status-down/30 bg-status-down/10 p-3.5 space-y-2">
                <div className="text-3xs uppercase font-bold text-status-down tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5" /> Naive Graph-Blind Baseline
                </div>
                <p className="text-2xs text-text-secondary">
                  Treats each PSP as an isolated silo. Sees two separate alerts: <span className="font-mono text-white">&quot;PSP-1 degraded&quot;</span> and <span className="font-mono text-white">&quot;PSP-2 degraded&quot;</span>. It naively attempts to reroute traffic between the two failing PSPs, causing repeated transaction failures and revenue loss.
                </p>
              </div>

              <div className="rounded-xl border border-status-healthy/30 bg-status-healthy/10 p-3.5 space-y-2">
                <div className="text-3xs uppercase font-bold text-status-healthy tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> ARIA Relational Graph Intelligence
                </div>
                <p className="text-2xs text-text-secondary">
                  Models the full multi-tier dependency graph (Method → PSP → Bank). Derives upstream bank health from the converging failure signature, isolates <strong className="text-white">Bank-A</strong> as the root cause with 100% confidence, and immediately executes a clean bypass to <strong className="text-status-healthy">PSP-3 (Bank-B)</strong>.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Mathematics */}
          <TabsContent value="math" className="space-y-4 pt-3 text-xs leading-relaxed text-text-secondary">
            <div className="rounded-xl border border-white/[0.08] bg-black/50 p-4 space-y-3 font-mono">
              <div className="text-3xs uppercase font-bold text-accent tracking-wider">
                Formal Graph Attribution Theorem
              </div>

              <div className="space-y-2 text-2xs">
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-text-muted block text-3xs uppercase">1. Coverage Formula</span>
                  <strong className="text-white text-xs">Coverage(X) = |D ∩ P(X)| / |P(X)|</strong>
                  <p className="text-3xs text-text-muted mt-1">
                    Fraction of candidate X&apos;s downstream dependents that have breached baseline.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-text-muted block text-3xs uppercase">2. Specificity Formula</span>
                  <strong className="text-white text-xs">Specificity(X) = 1 − |D \ P(X)| / |D|</strong>
                  <p className="text-3xs text-text-muted mt-1">
                    Fraction of all breached entities explained exclusively by candidate X (penalizes spillover).
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-text-muted block text-3xs uppercase">3. Action Policy Gating</span>
                  <strong className="text-status-healthy text-xs">If S(X) = Coverage · Specificity ≥ τ → REROUTE; Else HOLD</strong>
                  <p className="text-3xs text-text-muted mt-1">
                    Guarantees zero false interventions when noise or ambiguous anomalies occur.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Scenario Catalog */}
          <TabsContent value="scenarios" className="space-y-3 pt-3 text-xs">
            <div className="space-y-2">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Badge variant="accent">Scenario A</Badge> Shared Bank Outage (Thesis)
                  </span>
                  <span className="text-3xs font-mono text-status-healthy">Expected: Attribute Bank-A & Reroute</span>
                </div>
                <p className="text-2xs text-text-secondary mt-1">
                  Bank-A goes down. PSP-1 & PSP-2 breach simultaneously. ARIA attributes Bank-A and reroutes to PSP-3.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Badge variant="secondary">Scenario B</Badge> Isolated PSP Failure (Control)
                  </span>
                  <span className="text-3xs font-mono text-status-info">Expected: Blame PSP-1, Not Bank</span>
                </div>
                <p className="text-2xs text-text-secondary mt-1">
                  PSP-1 experiences gateway timeout; Bank-A and PSP-2 remain healthy. Proves ARIA does not over-attribute to banks.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Badge variant="secondary">Scenario C</Badge> Payment Method Fault
                  </span>
                  <span className="text-3xs font-mono text-status-degraded">Expected: Blame UPI Rail</span>
                </div>
                <p className="text-2xs text-text-secondary mt-1">
                  UPI method rail degrades across all PSPs. ARIA isolates the method rather than blaming infrastructure.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Badge variant="secondary">Scenario D</Badge> Ambiguous Noise Dip
                  </span>
                  <span className="text-3xs font-mono text-text-muted">Expected: Do Nothing (Hold)</span>
                </div>
                <p className="text-2xs text-text-secondary mt-1">
                  Distributed statistical noise. Confidence stays below τ (0.70), triggering a safe hold.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Badge variant="down">Scenario E</Badge> Coincidental Dual Outage (Anti-Triviality)
                  </span>
                  <span className="text-3xs font-mono text-status-down">Expected: Blame 2 Independent PSPs</span>
                </div>
                <p className="text-2xs text-text-secondary mt-1">
                  PSP-1 (Bank-A) and PSP-3 (Bank-B) fail simultaneously on different banks. Proves ARIA reasons over graph topology rather than raw correlation.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: Keybindings */}
          <TabsContent value="keybindings" className="space-y-3 pt-3 text-xs">
            <div className="grid grid-cols-2 gap-2.5 font-mono text-2xs">
              <div className="p-3 rounded-xl border border-white/[0.06] bg-black/40 flex items-center justify-between">
                <span className="text-text-secondary">Open Command Palette</span>
                <kbd className="px-2 py-0.5 rounded bg-white/[0.1] border border-white/[0.2] text-white font-bold">⌘K</kbd>
              </div>
              <div className="p-3 rounded-xl border border-white/[0.06] bg-black/40 flex items-center justify-between">
                <span className="text-text-secondary">Open System Guide</span>
                <kbd className="px-2 py-0.5 rounded bg-white/[0.1] border border-white/[0.2] text-white font-bold">?</kbd>
              </div>
              <div className="p-3 rounded-xl border border-white/[0.06] bg-black/40 flex items-center justify-between">
                <span className="text-text-secondary">Play / Pause Timeline</span>
                <kbd className="px-2 py-0.5 rounded bg-white/[0.1] border border-white/[0.2] text-white font-bold">Space</kbd>
              </div>
              <div className="p-3 rounded-xl border border-white/[0.06] bg-black/40 flex items-center justify-between">
                <span className="text-text-secondary">Step Timeline Windows</span>
                <kbd className="px-2 py-0.5 rounded bg-white/[0.1] border border-white/[0.2] text-white font-bold">← / →</kbd>
              </div>
              <div className="p-3 rounded-xl border border-white/[0.06] bg-black/40 flex items-center justify-between">
                <span className="text-text-secondary">Exit Tour / Modal</span>
                <kbd className="px-2 py-0.5 rounded bg-white/[0.1] border border-white/[0.2] text-white font-bold">Esc</kbd>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
