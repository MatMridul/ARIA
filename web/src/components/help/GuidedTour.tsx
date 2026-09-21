import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Binary,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  HelpCircle,
  Layers,
  Network,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/design/ui";

interface TourStep {
  targetId: string;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  insight: string;
  placement: "bottom" | "top" | "left" | "right" | "center";
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-hud",
    title: "Mission Control Command Dock",
    badge: "Control Plane",
    icon: Compass,
    description:
      "The floating command bar allows you to select between 5 test scenarios (A through E), choose deterministic seeds (1–20), toggle the simulation playback transport, and calibrate the operator risk appetite (τ).",
    insight:
      "Scenario A is the core thesis benchmark: Bank-A fails, taking down both PSP-1 and PSP-2 simultaneously.",
    placement: "bottom",
  },
  {
    targetId: "tour-kpis",
    title: "Realized Financial Recovery",
    badge: "Yield Telemetry",
    icon: DollarSign,
    description:
      "These rolling odometer figures show the exact revenue recovered by ARIA's automated mitigation versus a holding baseline on the identical seed draws.",
    insight:
      "ARIA measures genuine counterfactual recovery: revenue(action) − revenue(no_action).",
    placement: "bottom",
  },
  {
    targetId: "tour-topology",
    title: "Living Payment Network Graph",
    badge: "Dependency Topology",
    icon: Network,
    description:
      "Visualizes payment routing: Merchant Checkout → Payment Rails (UPI, Card, Netbanking) → PSP Gateways (PSP-1, PSP-2, PSP-3) → Acquirer Banks (Bank-A, Bank-B). Each chip displays live embedded success rate sparklines.",
    insight:
      "Bank-A is a SHARED dependency for PSP-1 and PSP-2. A graph-blind system only sees two separate PSP faults.",
    placement: "right",
  },
  {
    targetId: "tour-proof",
    title: "Mathematical Deduction Matrix",
    badge: "Formal Proof",
    icon: Binary,
    description:
      "ARIA derives root causes mathematically: Coverage (|D ∩ P| / |P| = 100%) × Specificity (1 − |D \\ P| / |D| = 100%). It verifies that only Bank-A explains the exact failure signature with zero spillover.",
    insight:
      "Independent dual failures and method-level faults are formally calculated and eliminated.",
    placement: "left",
  },
  {
    targetId: "tour-recovery",
    title: "Bounded Action Execution",
    badge: "Automated Policy",
    icon: ShieldCheck,
    description:
      "When attribution confidence exceeds the risk threshold τ (e.g. 1.00 ≥ 0.70), ARIA triggers a bounded reroute around the failing bank to a healthy PSP (PSP-3 on Bank-B).",
    insight:
      "If confidence is below τ, ARIA enforces a strict 'do_nothing' hold to prevent costly false interventions.",
    placement: "left",
  },
  {
    targetId: "tour-scrubber",
    title: "20-Window Incident Timeline",
    badge: "Time-Travel Oscilloscope",
    icon: Clock,
    description:
      "Drag or click through all 20 simulation windows to inspect how anomalies emerge (crimson zone), trigger detection (t_detect), and recover to nominal throughput (emerald zone).",
    insight:
      "The entire network canvas updates in real-time as you scrub between simulation frames.",
    placement: "top",
  },
];

export function GuidedTour() {
  const { tourActive, tourStep, nextTourStep, prevTourStep, endTour } = useAppStore();
  const [targetRect, setTargetRect] = React.useState<DOMRect | null>(null);

  const step = TOUR_STEPS[tourStep];
  const isLast = tourStep === TOUR_STEPS.length - 1;
  const isFirst = tourStep === 0;

  // Track target element position
  React.useEffect(() => {
    if (!tourActive || !step) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [tourActive, tourStep, step]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!tourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") endTour();
      else if (e.key === "ArrowRight") {
        if (isLast) endTour();
        else nextTourStep();
      } else if (e.key === "ArrowLeft") {
        if (!isFirst) prevTourStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tourActive, isLast, isFirst, nextTourStep, prevTourStep, endTour]);

  if (!tourActive || !step) return null;

  const Icon = step.icon;

  // Compute callout box coordinates
  let popoverStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
  };

  if (targetRect) {
    const pad = 16;
    if (step.placement === "bottom") {
      popoverStyle.top = `${targetRect.bottom + pad}px`;
      popoverStyle.left = `${Math.max(20, Math.min(window.innerWidth - 420, targetRect.left + targetRect.width / 2 - 200))}px`;
    } else if (step.placement === "top") {
      popoverStyle.bottom = `${window.innerHeight - targetRect.top + pad}px`;
      popoverStyle.left = `${Math.max(20, Math.min(window.innerWidth - 420, targetRect.left + targetRect.width / 2 - 200))}px`;
    } else if (step.placement === "left") {
      popoverStyle.top = `${Math.max(80, Math.min(window.innerHeight - 380, targetRect.top))}px`;
      popoverStyle.right = `${window.innerWidth - targetRect.left + pad}px`;
    } else if (step.placement === "right") {
      popoverStyle.top = `${Math.max(80, Math.min(window.innerHeight - 380, targetRect.top))}px`;
      popoverStyle.left = `${targetRect.right + pad}px`;
    }
  } else {
    // Fallback center
    popoverStyle.top = "50%";
    popoverStyle.left = "50%";
    popoverStyle.transform = "translate(-50%, -50%)";
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Dimmed backdrop with cutout spotlight */}
      <div className="absolute inset-0 bg-black/60 pointer-events-auto backdrop-blur-[2px] transition-opacity duration-300" />

      {/* Target element highlight ring */}
      {targetRect && (
        <div
          style={{
            position: "fixed",
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
          className="rounded-2xl border-2 border-accent shadow-[0_0_30px_rgba(99,102,241,0.6)] ring-4 ring-accent/20 transition-all duration-300 pointer-events-none"
        />
      )}

      {/* Interactive Tour Callout Popover */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tourStep}
          initial={{ opacity: 0, scale: 0.95, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -6 }}
          transition={{ duration: 0.2 }}
          style={popoverStyle}
          className="w-[390px] max-w-[92vw] pointer-events-auto doppelrand rounded-2xl shadow-2xl"
        >
          <div className="doppelrand-inner p-4 space-y-3.5 bg-[#0C0E16]/98 border border-white/[0.12]">
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight leading-none">
                    {step.title}
                  </h4>
                  <span className="text-3xs uppercase font-mono tracking-wider text-text-muted mt-0.5 block">
                    Step {tourStep + 1} of {TOUR_STEPS.length} · {step.badge}
                  </span>
                </div>
              </div>

              <button
                onClick={endTour}
                className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Exit Tour (Esc)"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Content & Narrative */}
            <p className="text-xs text-text-secondary leading-relaxed">
              {step.description}
            </p>

            {/* Key Engineering Insight */}
            <div className="rounded-xl border border-accent/25 bg-accent/10 p-2.5 flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
              <p className="text-3xs text-indigo-200 leading-relaxed font-mono">
                {step.insight}
              </p>
            </div>

            {/* Transport Navigation */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1">
                {TOUR_STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-200",
                      i === tourStep ? "w-5 bg-accent" : "w-1.5 bg-white/20"
                    )}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {!isFirst && (
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={prevTourStep}
                    className="h-7 px-2.5 text-3xs"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" /> Back
                  </Button>
                )}

                <Button
                  variant={isLast ? "glow" : "default"}
                  size="sm"
                  onClick={isLast ? endTour : nextTourStep}
                  className="h-7 px-3 text-3xs font-bold"
                >
                  {isLast ? (
                    <>
                      Finish Tour <CheckCircle2 className="h-3 w-3 ml-1" />
                    </>
                  ) : (
                    <>
                      Next <ArrowRight className="h-3 w-3 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
