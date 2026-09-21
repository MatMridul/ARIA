/**
 * Connect payment infrastructure — Topology Ingestion Hub.
 * Features Doppelrand card enclosures, Lucide status indicators, and live graph injection.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/design/ui";
import { importTopology, useAppStore, type ImportResult } from "@/lib";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Code2,
  Database,
  Layers,
  Network,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const EXAMPLE_MANIFEST = {
  merchant: { id: "mx_1", name: "Acme Commerce" },
  methods: [
    { id: "upi", name: "UPI" },
    { id: "card", name: "Card" },
    { id: "netbanking", name: "Netbanking" },
  ],
  psps: [
    { id: "psp_1", name: "PSP-1" },
    { id: "psp_2", name: "PSP-2" },
    { id: "psp_3", name: "PSP-3" },
  ],
  banks: [
    { id: "bank_A", name: "Bank-A", role: "acquirer" },
    { id: "bank_B", name: "Bank-B", role: "acquirer" },
  ],
  routes: [
    { method: "upi", psp: "psp_1", bank: "bank_A" },
    { method: "upi", psp: "psp_2", bank: "bank_A" },
    { method: "upi", psp: "psp_3", bank: "bank_B" },
    { method: "card", psp: "psp_1", bank: "bank_A" },
    { method: "card", psp: "psp_2", bank: "bank_A" },
    { method: "card", psp: "psp_3", bank: "bank_B" },
    { method: "netbanking", psp: "psp_1", bank: "bank_A" },
    { method: "netbanking", psp: "psp_2", bank: "bank_A" },
    { method: "netbanking", psp: "psp_3", bank: "bank_B" },
  ],
};

type State =
  | { phase: "edit" }
  | { phase: "validating" }
  | { phase: "valid"; result: ImportResult }
  | { phase: "invalid"; errors: string[] };

export function ConnectPage() {
  const navigate = useNavigate();
  const { setCustomTopology } = useAppStore();
  const [text, setText] = useState(() => JSON.stringify(EXAMPLE_MANIFEST, null, 2));
  const [state, setState] = useState<State>({ phase: "edit" });

  async function validate() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setState({ phase: "invalid", errors: [`Manifest is not valid JSON: ${(e as Error).message}`] });
      return;
    }
    setState({ phase: "validating" });
    try {
      const result = await importTopology(parsed);
      setState({ phase: "valid", result });
    } catch (e) {
      setState({ phase: "invalid", errors: (e as Error).message.split("\n") });
    }
  }

  return (
    <div className="flex h-full flex-col bg-bg-base overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4 bg-[#07080C]/90 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-3xs font-semibold uppercase tracking-widest text-text-muted">
          <Layers className="h-4 w-4 text-accent" />
          Infrastructure Ingestion
        </div>
        <h1 className="text-xl font-bold text-text-primary tracking-tight mt-0.5">
          Custom Payment Network Topology Manifest
        </h1>
        <p className="mt-1 text-xs text-text-secondary leading-relaxed">
          Supply a JSON definition of payment methods, PSP gateways, and underlying bank settlement routes.
          ARIA will automatically construct relational dependency models and extract shared banking bottlenecks.
        </p>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Manifest Editor Container */}
        <section className="flex min-w-0 flex-1 flex-col border-r border-white/[0.06] bg-[#05060A]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-2.5 bg-white/[0.01]">
            <div className="flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5 text-accent" />
              <span className="text-3xs font-semibold uppercase tracking-wider text-text-muted">
                topology_manifest.json
              </span>
            </div>
            <button
              onClick={() => {
                setText(JSON.stringify(EXAMPLE_MANIFEST, null, 2));
                setState({ phase: "edit" });
              }}
              className="text-3xs uppercase tracking-wider text-text-muted hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Reset Template
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (state.phase !== "edit") setState({ phase: "edit" });
            }}
            spellCheck={false}
            aria-label="Topology manifest JSON"
            className="tabular min-h-0 flex-1 resize-none bg-transparent p-5 font-mono text-xs leading-relaxed text-text-primary outline-none focus:ring-0 selection:bg-accent/30"
          />

          <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3 bg-[#08090D]">
            <Button
              variant="default"
              size="sm"
              onClick={validate}
              disabled={state.phase === "validating"}
              className="text-xs font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {state.phase === "validating" ? "Validating Topology…" : "Validate & Synthesize Graph"}
            </Button>
            <span className="text-3xs font-mono text-text-muted">
              Live Schema Validation (Zod) · Memory Scoped
            </span>
          </div>
        </section>

        {/* Validation Result Rail */}
        <aside className="w-[420px] shrink-0 flex flex-col overflow-y-auto bg-[#07080C] p-5 space-y-4">
          <div className="text-3xs uppercase font-semibold tracking-wider text-text-muted">
            Ingestion Diagnostic Status
          </div>

          {state.phase === "edit" && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center space-y-2">
              <Database className="h-8 w-8 text-text-muted mx-auto opacity-50" />
              <div className="text-xs font-medium text-text-secondary">
                Awaiting Manifest Validation
              </div>
              <p className="text-3xs text-text-muted leading-relaxed">
                Click &quot;Validate & Synthesize Graph&quot; to ingest your custom routing schema into ARIA&apos;s simulation engine.
              </p>
            </div>
          )}

          {state.phase === "validating" && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center space-y-3">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent mx-auto block" />
              <div className="text-xs font-medium text-text-primary">
                Analyzing Relational Topology…
              </div>
            </div>
          )}

          {state.phase === "invalid" && (
            <div className="rounded-2xl border border-status-down/40 bg-status-down/10 p-4 space-y-3">
              <div className="flex items-center gap-2 text-status-down text-xs font-bold uppercase tracking-wide">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Topology Validation Failed</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-2xs text-text-secondary">
                {state.errors.map((e, i) => (
                  <li key={i} className="font-mono leading-relaxed">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {state.phase === "valid" && (
            <ValidResult
              result={state.result}
              onOpen={() => {
                setCustomTopology(state.result.topology);
                navigate("/");
              }}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function ValidResult({ result, onOpen }: { result: ImportResult; onOpen: () => void }) {
  const c = result.counts;
  const sharedIds = Object.keys(result.shared_dependencies);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="rounded-2xl border border-status-healthy/40 bg-status-healthy/10 p-4 space-y-3">
        <div className="flex items-center gap-2 text-status-healthy text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="h-4 w-4" />
          <span>Topology Synthesized Cleanly</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-2xs font-mono pt-1">
          <div className="bg-black/40 p-2 rounded-xl border border-white/[0.04]">
            <span className="text-text-muted text-3xs uppercase block">Methods</span>
            <strong className="text-white text-sm">{c.methods} Rails</strong>
          </div>
          <div className="bg-black/40 p-2 rounded-xl border border-white/[0.04]">
            <span className="text-text-muted text-3xs uppercase block">PSPs</span>
            <strong className="text-white text-sm">{c.psps} Gateways</strong>
          </div>
          <div className="bg-black/40 p-2 rounded-xl border border-white/[0.04]">
            <span className="text-text-muted text-3xs uppercase block">Banks</span>
            <strong className="text-white text-sm">{c.banks} Acquirers</strong>
          </div>
          <div className="bg-black/40 p-2 rounded-xl border border-white/[0.04]">
            <span className="text-text-muted text-3xs uppercase block">Routes</span>
            <strong className="text-accent text-sm">{c.routes} Edges</strong>
          </div>
        </div>
      </div>

      {/* Shared Dependencies Extraction */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
        <div className="text-3xs uppercase font-semibold text-text-muted tracking-widest flex items-center gap-1.5">
          <Network className="h-3.5 w-3.5 text-status-info" /> Extracted Shared Dependencies
        </div>

        {sharedIds.length === 0 ? (
          <p className="text-2xs text-text-muted leading-relaxed">
            No shared banking dependencies detected across multiple PSPs.
          </p>
        ) : (
          <ul className="space-y-2">
            {sharedIds.map((bid) => (
              <li
                key={bid}
                className="flex items-center justify-between text-2xs bg-black/40 p-2.5 rounded-xl border border-white/[0.04]"
              >
                <span className="font-mono font-bold text-status-info">{bid}</span>
                <span className="text-text-secondary font-mono text-3xs">
                  Settles: {result.shared_dependencies[bid].join(", ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button variant="glow" size="lg" onClick={onOpen} className="w-full text-xs font-bold">
        Launch Active Session in Command Center <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </motion.div>
  );
}
