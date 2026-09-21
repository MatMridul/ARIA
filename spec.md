# ARIA — Cyber-Financial Mission Control UI Specification

> **Version:** 2.0 (Elevated Mission Control Edition)  
> **Target Workspace:** `web/` (React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Framer Motion)  
> **Aesthetic Directive:** Ultra-premium, high-density cyber-financial instrument (combining Palantir Gotham, Linear, Stripe Dashboard, and Apple Pro keynote presentation).

---

## 1. Design Philosophy & Aesthetic Core

### The "Mission Control" Paradigm
ARIA is not a consumer web dashboard; it is an **active payment revenue recovery control-plane**. The UI must evoke mathematical precision, tangible physical depth, and high-frequency operational clarity:

* **OLED Obsidian Baseline:** Deepest black base (`#030305` / `#07070A`) with subtle dark-slate elevated planes. No flat, muddy 1px gray boxes.
* **Hardware Doppelrand (Double-Bezel) Architecture:** All major cards, floating docks, and HUD containers use nested physical enclosures:
  * **Outer Bezel:** Micro-ring container (`ring-1 ring-white/[0.07] bg-white/[0.02] p-1.5 rounded-2xl`).
  * **Inner Core:** Specular light-catching core (`shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] bg-[#0C0D12]/95 backdrop-blur-2xl rounded-[calc(1rem-0.375rem)]`).
* **Active Living Telemetry:** Animated SVG laser-particle streams showing real-time transaction routing, pulsating distress radar shockwaves on degraded nodes, and spring-interpolated odometer number tickers.
* **Ambient Spatial Lighting:** Cursor-following spotlight mask and soft radial glow halos behind degraded (rose/crimson) and recovered (emerald/teal) components.

---

## 2. Technology Stack & Library Blueprint

| Role | Technology / Library | Specific Purpose in ARIA |
|---|---|---|
| **UI Framework** | **React 18 + TypeScript + Vite** | Fast, strictly typed component runtime with `@/` path alias. |
| **Component Primitives** | **shadcn/ui (Radix UI)** | Headless, accessible primitives: `Select`, `Slider`, `Tooltip`, `Sheet`, `Tabs`, `Dialog`, `DropdownMenu`, `Accordion`, `Badge`, `Button`, `Card`, `Separator`. |
| **Iconography** | **`lucide-react`** | Ultra-clean, 1.25px thin stroke icons replacing raw emojis and inline SVGs. |
| **Motion Choreography** | **`framer-motion` (v11)** | Spring-physics transitions, layoutId morphing, liquid causal ribbon, animated number odometers, and `<Sheet>` slide-overs. |
| **Topology Graph Canvas** | **`@xyflow/react` (React Flow)** | Interactive node-link topology with custom cybernetic nodes, SVG particle stream edges, and dynamic radar distress waves. |
| **Analytics & Frontier Viz** | **`recharts`** | Recovery-vs-risk frontier curves, seed variance distributions, and latency histograms with custom dark glass tooltips. |
| **State Management** | **`zustand`** | Global synchronization of active scenario (incident, seed, threshold, system) and custom imported topologies. |
| **Data Fetching & Caching** | **`@tanstack/react-query` (v5)** | Deterministic API caching (`staleTime: Infinity`) for seed-reproducible simulation traces. |
| **Validation Seam** | **`zod`** | Strict runtime validation of all FastAPI JSON responses. |

---

## 3. Component Architecture & Hero Features

### 3.1 Floating Glassmorphic HUD Command Bar
A floating, pill-shaped control dock positioned at the top-center of the Command Center and Topology canvas:
* **Scenario Switcher (`<Select>`):** Glass popover with keyboard shortcuts (`Cmd+1` to `Cmd+5`) to switch between Incidents A, B, C, D, and E.
* **Seed Selector (`<Select>`):** Clean numeric seed picker (Seeds 1–20) with live deterministic badge.
* **Tactile Risk-Appetite Dial (`<Slider>`):**
  * Interactive slider for $\tau \in [0.0, 1.0]$ with glowing track.
  * Real-time visual feedback: dynamically shows whether current confidence exceeds $\tau$ (triggering action) or stays below (triggering `do_nothing`).
* **Playback Controls:** Play, Pause, Step Forward/Back, and Speed Multipliers (1x, 2x, 5x).

### 3.2 Living Cybernetic Payment Topology
An upgraded React Flow canvas featuring:
* **Frosted Glass Hardware Chips (Custom Nodes):** Nodes for Merchant, Methods (UPI, Card, Netbanking), PSPs (PSP-1, PSP-2, PSP-3), and Banks (Bank-A, Bank-B).
  * Nodes feature metallic badges, micro-LED pulse status indicators, and live success rate delta tags.
* **Pulsating Distress Radar (Shockwave Animation):** When a bank or PSP breaches detection, it emits continuous expanding concentric pulse waves.
* **Laser-Particle Stream Arteries (Custom Edges):** Animated SVG light particles traversing bezier curves from Merchant $\rightarrow$ Method $\rightarrow$ PSP $\rightarrow$ Bank.
* **Visual Reroute Surge:** When an action reroutes traffic from a failing PSP to a healthy sibling, the particle streams visibly curve away and accelerate into the healthy target with an emerald burst.

### 3.3 Interactive "Time-Travel" Waveform Scrubber
A timeline component at the bottom of the canvas:
* **20-Window Mini-Histogram/Sparkline:** Displays transaction volume and success rate across all simulation windows.
* **Visual Span Zones:**
  * Injected Incident Window span highlighted with subtle crimson overlay and hatch pattern.
  * Intervention & Recovery Window span highlighted with subtle emerald halo.
* **Scrubbing Head:** Smooth draggable thumb with magnetic snapping to simulation windows, updating node states in real time.

### 3.4 Rolling Odometer Metrics & Shimmer Readouts
* **Odometer Digits:** Metric numbers (Recovered Revenue, Expected Recovery, Success Rate) roll vertically using spring mass physics when switching scenarios or scrubbing windows.
* **Shimmer Gradient Typography:** Large KPI readouts use metallic gradients:
  * Recovered Revenue: `bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent` with soft emerald drop halo.
  * Degraded Delta: `bg-gradient-to-r from-rose-400 via-red-300 to-rose-200 bg-clip-text text-transparent`.

### 3.5 Interactive Mathematical Deduction Matrix (Proof Tree)
An interactive visual reasoning card on the intelligence rail:
* **Formula Visualization:** Displays $S = \text{Coverage} \times \text{Specificity}$ with interactive terms:
  $$\underbrace{\text{Coverage: } \frac{|D \cap P(X)|}{|P(X)|} \text{ (100\%)}}_{\text{All bank PSPs down}} \times \underbrace{\text{Specificity: } 1 - \frac{|D - P(X)|}{|D|} \text{ (100\%)}}_{\text{Zero spillover to other banks}} \longrightarrow \mathbf{\text{Confidence: } 1.00}$$
* **Animated SVG Confidence Arc Gauge:** Circular dial with metallic glowing gradient filling up to the confidence score.
* **Hover Tooltips (`<Tooltip>`):** Explain why independent PSP faults or method faults were mathematically ruled out.

### 3.6 Slide-Over Node Deep-Dive Drawer (`<Sheet>`)
Clicking any node on the topology slides open a deep diagnostic drawer from the right:
* **Historical Success Rate Sparkline:** Window-by-window performance.
* **Error Code Breakdown:** Distribution of `GATEWAY_TIMEOUT`, `BANK_DECLINE`, `INSUFFICIENT_FUNDS`.
* **Downstream Route Distribution:** Weight and volume metrics.
* **Counterfactual Prediction:** Estimated impact if this node is isolated or rerouted.

### 3.7 Pro Command Palette (`Cmd + K`)
A global spotlight command launcher:
* Quick search across all incidents, seeds, and navigation views.
* Shortcut actions: *"Simulate Incident A on Seed 7"*, *"Export Graph JSON"*, *"Toggle Baseline Comparison"*, *"Run Evaluation Sweep"*.

---

## 4. Design Tokens & Styling Guide

### Palette Definition (`tailwind.config.js`)
```javascript
colors: {
  bg: {
    base: "#040406",       // OLED Vantablack background
    inset: "#08090C",      // Deep recessed areas (editor, sidebar)
    surface: "#0D0E13",    // Standard panel surface
    raised: "#13151C",     // Interactive hover & elevated cards
    overlay: "rgba(4, 4, 6, 0.8)",
  },
  border: {
    subtle: "rgba(255, 255, 255, 0.06)",
    DEFAULT: "rgba(255, 255, 255, 0.10)",
    strong: "rgba(255, 255, 255, 0.18)",
    highlight: "rgba(255, 255, 255, 0.35)",
  },
  brand: {
    accent: "#6366F1",     // Indigo core
    accentGlow: "rgba(99, 102, 241, 0.25)",
  },
  status: {
    healthy: "#10B981",    // Emerald
    healthyGlow: "rgba(16, 185, 129, 0.3)",
    degraded: "#F59E0B",   // Amber
    degradedGlow: "rgba(245, 158, 11, 0.3)",
    down: "#EF4444",       // Rose / Crimson
    downGlow: "rgba(239, 68, 68, 0.35)",
    info: "#06B6D4",       // Cyan
    infoGlow: "rgba(6, 182, 212, 0.25)",
  }
}
```

### Typography Scale
* **Display KPIs:** JetBrains Mono / Geist Mono, `text-2xl` to `text-4xl`, `font-semibold`, `tracking-tight`.
* **Section Eyebrows:** `text-[10px] uppercase font-semibold tracking-[0.2em] text-text-muted`.
* **Body / Labels:** Plus Jakarta Sans / Inter, `text-xs` to `text-sm`, `leading-relaxed`.
* **Telemetry Data:** `.tabular` font feature settings for non-shifting tabular alignment.

---

## 5. Verification & Performance Guardrails
1. **Zero Layout Thrashing:** All animated components use exclusively GPU-accelerated properties (`transform`, `opacity`, `filter`).
2. **Strict Accessibility:** All dropdowns and modal drawers support full keyboard navigation (Radix UI).
3. **Type Safety & Schema Fidelity:** 100% compliance with TypeScript strict mode and Zod runtime schema validation.
4. **Fast Build & Small Bundle:** Efficient code splitting and lazy loading of secondary routes.
