# ARIA Deployment Guide: Taking Your Project Live

> **Why deploying matters:** Recruiters and engineering managers spend an average of 15–30 seconds reviewing a student's resume. Almost **no one** will `git clone`, `npm install`, and configure Python virtual environments just to see your project. A clean, responsive live URL transforms your application from "another unverified GitHub repo" into "a working production system."

---

## Architecture: The Unified Single-Origin Container

Instead of the common beginner trap of deploying the frontend to Vercel and the backend to Render (which causes CORS headaches, cold-start desyncs, and two different URLs), ARIA is packaged as a **Unified Single-Origin Web Service**:

* **Backend:** FastAPI runs the Python routing engine.
* **Frontend:** The React/Vite SPA is pre-compiled into static HTML/JS/CSS assets.
* **Single Port:** FastAPI serves API requests under `/api/*` and serves the React SPA on all other routes (`/*`).
* **Zero CORS:** In production, requests to `/api` are same-origin (`window.location.origin`), completely eliminating cross-origin errors.

---

## Option 1: 1-Click Free Deploy on Render (Recommended)

Render provides a completely free tier for Docker web services with automatic HTTPS (`https://aria-defense-engine.onrender.com`).

### Steps:
1. **Push your code to GitHub:**
   Ensure your latest commits (including `Dockerfile`, `render.yaml`, and `requirements.txt`) are pushed to your GitHub repository:
   ```bash
   git push origin feat/elevated-mission-control-ui
   ```
2. **Sign in to [Render.com](https://render.com):**
   * Log in with your GitHub account.
3. **Create New Web Service:**
   * Click **New +** $\rightarrow$ **Web Service**.
   * Select your GitHub repository (`ARIADNE`).
   * Render will automatically detect the `Dockerfile` and `render.yaml`.
   * **Instance Type:** Select **Free**.
   * **Health Check Path:** `/api/topology`
4. **Click Deploy:**
   * Render will build the Node frontend, package the Python backend, and spin up your container.
   * Within 2–3 minutes, you will get a live URL:  
     `https://aria-defense-engine.onrender.com`

> **Note on Free Tier Sleeping:** Free instances on Render spin down after 15 minutes of inactivity. When someone clicks the link after a dormant period, it takes ~45 seconds to wake up. This is standard across free tiers.

---

## Option 2: Railway (Ultra-Fast, No Cold Starts)

If you have a student GitHub pack or $5 trial on Railway:
1. Sign in to [railway.app](https://railway.app) with GitHub.
2. Click **New Project** $\rightarrow$ **Deploy from GitHub Repo**.
3. Select your repository.
4. Railway will automatically build the `Dockerfile` and give you an instant live URL with zero cold-start delay.

---

## Pre-Flight Local Check (Test Container Locally)

Before deploying to the cloud, you can verify the production container locally if you have Docker Desktop installed:

```bash
# 1. Build the production container
docker build -t aria-engine .

# 2. Run the container locally on port 8000
docker run -p 8000:8000 -e PORT=8000 aria-engine

# 3. Open in your browser
# http://localhost:8000 -> You should see the full Mission Control dashboard!
```

---

## How to Format This on Your Resume

```markdown
**ARIA — Autonomous Cyber-Financial Routing & Revenue Defense Engine**
[Live Mission Control](https://aria-defense-engine.onrender.com) | [GitHub Repository](https://github.com/your-username/ARIADNE)
- Architected a deterministic payment routing engine using set-theoretic attribute deduction, recovering lost transaction volume during multi-PSP outages.
- Engineered a resilient 3-state Circuit Breaker (CLOSED/OPEN/HALF-OPEN) with canary traffic ratios and hysteresis damping to eliminate route flapping.
- Implemented real-time forensic mission control in TypeScript/React, bundled into a production container serving sub-millisecond counterfactual telemetry.
```
