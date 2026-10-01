import { Link } from "react-router-dom";
import { ArrowLeft, Home, ShieldAlert, Terminal } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center instrument-grid instrument-vignette">
      <div className="relative z-10 max-w-md space-y-6 rounded-2xl border border-white/[0.08] bg-[#07080C]/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-status-danger/30 bg-status-danger/10 text-status-danger shadow-[0_0_24px_rgba(244,63,94,0.3)]">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <div className="font-mono text-3xs uppercase tracking-widest text-text-muted flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-status-danger animate-pulse" />
            <span>404 // UNROUTABLE_COORDINATE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Vector Not Found in Topology
          </h1>
          <p className="text-xs text-text-muted leading-relaxed">
            The requested resource path does not exist within the active ARIA payment graph or telemetry plane.
          </p>
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-black/40 p-3 font-mono text-2xs text-left space-y-1">
          <div className="text-text-muted flex items-center gap-1.5">
            <Terminal className="h-3 w-3 text-accent" />
            <span>sys.routing_error: route_unmapped</span>
          </div>
          <div className="text-text-secondary truncate">
            target: <span className="text-status-warning">{window.location.pathname}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/20 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_16px_rgba(99,102,241,0.25)] hover:bg-accent/30 hover:border-accent/60 transition-all"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Command Center</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-text-secondary hover:bg-white/[0.08] hover:text-white transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
