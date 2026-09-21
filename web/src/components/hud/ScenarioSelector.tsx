import * as React from "react";
import { useAppStore } from "@/lib/store";
import { useIncidents } from "@/lib/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Dna, Layers, Zap } from "lucide-react";
import type { IncidentTypeId } from "@/lib/schemas";

const INCIDENT_LABELS: Record<
  IncidentTypeId,
  { label: string; tag: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }
> = {
  A_shared_bank: {
    label: "HDFC Clearing Outage (Shared Bank)",
    tag: "Shared Dep",
    subtitle: "PSP-1 & PSP-2 Degraded via Bank-A",
    icon: Dna,
  },
  B_single_psp: {
    label: "Paytm Gateway Timeout (Single PSP)",
    tag: "Single PSP",
    subtitle: "PSP-1 Isolated Fluke",
    icon: Layers,
  },
  C_method: {
    label: "NPCI UPI Rail Congestion (Method Rail)",
    tag: "Method Rail",
    subtitle: "Network-Wide UPI Degradation",
    icon: Zap,
  },
  D_ambiguous: {
    label: "Midnight Noise Dip (Safe Hold Standby)",
    tag: "Safe Hold",
    subtitle: "Below Confidence Threshold τ",
    icon: AlertCircle,
  },
  E_coincidental: {
    label: "Multi-Bank Dual Failure (Independent)",
    tag: "Coincidence",
    subtitle: "Bank-A & Bank-B Dual Fault",
    icon: AlertCircle,
  },
};

export function ScenarioSelector() {
  const { scenario, setScenario } = useAppStore();
  const { data: catalog } = useIncidents();

  return (
    <div className="flex items-center gap-2">
      {/* Incident Switcher */}
      <div className="w-56 sm:w-64">
        <Select
          value={scenario.incident_type}
          onValueChange={(val) => setScenario({ incident_type: val as IncidentTypeId })}
        >
          <SelectTrigger className="h-8 bg-white/[0.04] border-white/[0.1] text-xs font-medium">
            <div className="flex items-center gap-2 truncate">
              {React.createElement(INCIDENT_LABELS[scenario.incident_type]?.icon || Dna, {
                className: "h-3.5 w-3.5 text-accent shrink-0",
              })}
              <span className="truncate">{INCIDENT_LABELS[scenario.incident_type]?.label}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Injected Incidents</SelectLabel>
              {(Object.keys(INCIDENT_LABELS) as IncidentTypeId[]).map((type) => {
                const item = INCIDENT_LABELS[type];
                const Icon = item.icon;
                return (
                  <SelectItem key={type} value={type} className="text-xs py-2">
                    <div className="flex items-center justify-between w-full gap-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <Icon className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
                        <div className="min-w-0 text-left">
                          <div className="font-semibold text-text-primary truncate">{item.label}</div>
                          <div className="text-3xs text-text-muted truncate">{item.subtitle}</div>
                        </div>
                      </div>
                      <Badge
                        variant={item.tag === "Shared Dep" ? "accent" : "secondary"}
                        className="text-3xs px-1.5 py-0 shrink-0 font-mono"
                      >
                        {item.tag}
                      </Badge>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Seed Selector */}
      <div className="w-24">
        <Select
          value={String(scenario.seed)}
          onValueChange={(val) => setScenario({ seed: parseInt(val, 10) })}
        >
          <SelectTrigger className="h-8 bg-white/[0.04] border-white/[0.1] text-xs tabular">
            <span className="text-text-muted mr-1 font-mono text-2xs">SEED</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-56">
            <SelectGroup>
              <SelectLabel>Deterministic Seeds (1-20)</SelectLabel>
              {Array.from({ length: 20 }, (_, i) => i + 1).map((s) => (
                <SelectItem key={s} value={String(s)} className="text-xs tabular font-mono">
                  Seed #{s.toString().padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* System Mode Switcher */}
      <div className="w-28 hidden md:block">
        <Select
          value={scenario.system}
          onValueChange={(val) => setScenario({ system: val as "ariadne" | "baseline" })}
        >
          <SelectTrigger className="h-8 bg-white/[0.04] border-white/[0.1] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ariadne">
              <span className="font-semibold text-accent">ARIADNE</span>
            </SelectItem>
            <SelectItem value="baseline">
              <span className="text-text-secondary">Baseline</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
