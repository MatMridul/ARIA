import * as React from "react";
import { useAppStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/design/ui";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Flame,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";

async function computeHmacSha256(secret: string, message: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await window.crypto.subtle.sign("HMAC", key, enc.encode(message));
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (e) {
    console.warn("WebCrypto HMAC unavailable, falling back:", e);
    return "browser_sig_fallback";
  }
}

export function LiveWebhookDrawer() {
  const {
    liveDrawerOpen,
    setLiveDrawerOpen,
    liveVerdict,
    liveStreamConnected,
    liveGeneratorActive,
    setLiveGeneratorActive,
    liveGeneratorScenario,
    setLiveGeneratorScenario,
    liveGeneratorTps,
    setLiveGeneratorTps,
    setIsLiveMode,
  } = useAppStore();

  const [copied, setCopied] = React.useState(false);

  // In-browser live transaction generator loop
  React.useEffect(() => {
    if (!liveGeneratorActive) return;

    const interval = setInterval(async () => {
      const psps = ["psp_1", "psp_2", "psp_3"];
      const methods = ["card", "upi", "netbanking"];
      const banks: Record<string, string> = {
        psp_1: "bank_A",
        psp_2: "bank_A",
        psp_3: "bank_B",
      };

      const count = Math.max(1, Math.round(liveGeneratorTps / 2));
      const events = [];

      for (let i = 0; i < count; i++) {
        const psp = psps[Math.floor(Math.random() * psps.length)];
        const method = methods[Math.floor(Math.random() * methods.length)];
        let success = true;
        let failureCode: string | null = null;
        let latency = 45 + Math.random() * 20;

        if (liveGeneratorScenario === "psp_outage" && psp === "psp_1") {
          success = Math.random() < 0.1;
          if (!success) {
            failureCode = "GATEWAY_TIMEOUT";
            latency = 4800 + Math.random() * 400;
          }
        } else if (liveGeneratorScenario === "bank_outage" && (psp === "psp_1" || psp === "psp_2")) {
          success = Math.random() < 0.15;
          if (!success) {
            failureCode = "BANK_ISSUER_UNAVAILABLE";
            latency = 3900 + Math.random() * 300;
          }
        } else {
          success = Math.random() < 0.98;
          if (!success) failureCode = "INSUFFICIENT_FUNDS";
        }

        events.push({
          transaction_id: `tx_web_${Date.now()}_${i}`,
          amount: Math.round(20 + Math.random() * 300),
          method,
          psp_id: psp,
          bank_id: banks[psp],
          success,
          latency_ms: latency,
          failure_code: failureCode,
          timestamp: Date.now() / 1000,
        });
      }

      try {
        const ts = Math.floor(Date.now() / 1000);
        const bodyString = JSON.stringify({ events });
        const sig = await computeHmacSha256("whsec_aria_reference_secret_default", `${ts}.${bodyString}`);
        const sigHeader = `t=${ts},v1=${sig}`;

        await fetch("/api/telemetry/ingest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Aria-Signature": sigHeader,
          },
          body: bodyString,
        });
      } catch (err) {
        console.error("Live generator ingest failed:", err);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [liveGeneratorActive, liveGeneratorScenario, liveGeneratorTps]);

  const handleReset = async () => {
    try {
      await fetch("/api/telemetry/reset", { method: "POST" });
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  const curlSnippet = `# 1. Use the Python signing CLI:
python scripts/send_webhook.py --scenario bank_outage --count 20

# 2. Or post via signed cURL:
curl -X POST https://aria-ionv.onrender.com/api/telemetry/ingest \\
  -H "Content-Type: application/json" \\
  -H "X-Aria-Signature: t=1791421500,v1=9c4a7e..." \\
  -d '{"transaction_id": "tx_live_7891", "amount": 149.50, "psp_id": "psp_1", "bank_id": "bank_A", "success": false}'`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={liveDrawerOpen} onOpenChange={setLiveDrawerOpen}>
      <DialogContent className="max-w-2xl bg-[#090C16]/98 border-white/[0.12] p-6 space-y-5">
        <DialogHeader className="border-b border-white/[0.08] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                  Live Telemetry & Ingestion Plane
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] font-mono",
                      liveStreamConnected
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-status-warning/40 bg-status-warning/10 text-status-warning"
                    )}
                  >
                    {liveStreamConnected ? "SSE CONNECTED" : "AWAITING STREAM"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-mono border-cyan-500/40 bg-cyan-500/10 text-cyan-400 flex items-center gap-1"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    HMAC-SHA256 SIGNED
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-2xs text-text-muted">
                  Stream real-time transactions into ARIA or inject live gateway fault scenarios.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* In-Browser Traffic Generator */}
        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-accent" />
              In-Browser Live Traffic Generator
            </span>
            <Button
              variant="glass"
              size="sm"
              onClick={handleReset}
              className="text-3xs text-text-muted hover:text-white flex items-center gap-1 px-2"
              title="Reset live buffer and circuit breakers"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset State</span>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "healthy", label: "Steady Baseline", desc: "98% normal auth rate" },
              { id: "psp_outage", label: "PSP-1 Timeout Spike", desc: "PSP-1 trips circuit breaker" },
              { id: "bank_outage", label: "Bank-A Dual Outage", desc: "Shared bank failure on PSP 1 & 2" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setLiveGeneratorScenario(s.id as any)}
                className={cn(
                  "flex flex-col text-left p-2.5 rounded-xl border transition-all text-xs",
                  liveGeneratorScenario === s.id
                    ? "bg-accent/15 border-accent/50 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                    : "bg-white/[0.02] border-white/[0.06] text-text-muted hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <span className="font-semibold text-2xs">{s.label}</span>
                <span className="text-[10px] text-text-muted mt-0.5 leading-snug">{s.desc}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <span className="text-2xs text-text-muted">Target Throughput:</span>
              <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/[0.06]">
                {[5, 15, 30].map((tps) => (
                  <button
                    key={tps}
                    onClick={() => setLiveGeneratorTps(tps)}
                    className={cn(
                      "px-2 py-0.5 text-2xs font-mono rounded font-medium transition-colors",
                      liveGeneratorTps === tps
                        ? "bg-accent text-white"
                        : "text-text-muted hover:text-white"
                    )}
                  >
                    {tps} TPS
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => {
                const next = !liveGeneratorActive;
                setLiveGeneratorActive(next);
                if (next) setIsLiveMode(true);
              }}
              className={cn(
                "flex items-center gap-1.5 px-4 text-xs font-semibold shadow-lg",
                liveGeneratorActive
                  ? "bg-status-danger/80 hover:bg-status-danger text-white border-status-danger/40"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/40"
              )}
            >
              {liveGeneratorActive ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause Stream</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Start Live Stream</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Live Radar Summary */}
        {liveVerdict && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 space-y-2 font-mono text-2xs">
            <div className="flex items-center justify-between text-text-muted">
              <span>ACTIVE BUFFER: {liveVerdict.total_events} events</span>
              <span className={liveVerdict.overall_success_rate < 0.9 ? "text-status-danger font-bold" : "text-emerald-400"}>
                SUCCESS RATE: {(liveVerdict.overall_success_rate * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-text-muted">CIRCUIT BREAKERS:</span>
              {Object.entries(liveVerdict.circuit_states || {}).map(([psp, state]) => (
                <span
                  key={psp}
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-bold border",
                    state === "OPEN"
                      ? "bg-status-danger/20 border-status-danger/40 text-status-danger"
                      : state === "HALF_OPEN"
                      ? "bg-status-warning/20 border-status-warning/40 text-status-warning"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  )}
                >
                  {psp.toUpperCase()}: {state}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* External Webhook Curl Snippet */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-2xs text-text-muted">
            <span className="flex items-center gap-1 font-semibold">
              <Terminal className="h-3.5 w-3.5 text-accent" />
              Direct HTTP Ingestion Webhook
            </span>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-accent hover:text-white transition-colors"
            >
              {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? "Copied" : "Copy cURL"}</span>
            </button>
          </div>
          <pre className="rounded-xl border border-white/[0.06] bg-black/60 p-3 font-mono text-[11px] text-text-secondary overflow-x-auto leading-relaxed">
            {curlSnippet}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
