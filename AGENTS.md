# Agent Instructions & Operational Rules — ARIA

This file defines mandatory operational instructions for AI agents working in this repository.

---

## 1. Mandatory Git Etiquette Protocol

Before executing ANY Git staging, committing, branching, or pushing command, you **MUST** review and satisfy the checklist in [`docs/GIT_ETIQUETTE.md`](docs/GIT_ETIQUETTE.md).

### The 6-Gate Pre-Flight Checklist:
1. **Branch Isolation:** Check current branch (`git branch --show-current`). **NEVER commit directly to `main`**. All work must be on a descriptive feature or fix branch (`feat/*`, `fix/*`, `docs/*`).
2. **Working Tree Hygiene:** Run `git status`. Verify no `.env`, secrets, debug logs, scratch files, or OS clutter are present or staged.
3. **Atomic Staging:** **`git add .` and `git add -A` ARE BANNED.** Only stage files belonging to a single logical responsibility. Chunk changes into separate commits if multiple layers were touched.
4. **Pre-Commit Verification:** Run `pytest -q` and ensure all tests pass (currently 90/90 green) before committing. If frontend code was touched, verify `tsc -b && vite build` completes without errors.
5. **Strict 5–8 Word Commit Messages:**
   - Commit titles **MUST be strictly between 5 and 8 words**.
   - Must use **imperative mood** (e.g. `add`, `fix`, `render`, `record`).
   - Must follow Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `ci:`, `chore:`.
6. **Remote Push & PR:** Push feature branches to remote (`origin <branch>`) and provide the user with the PR creation URL. Do not fast-forward merge onto `main` locally without explicit instruction.

---

## 2. Architecture & Decision Integrity

1. **Architectural Decisions:** Any significant design choice (such as event streaming, storage choices, protocol decisions) must follow the two-pass format documented in [`docs/decisions/README.md`](docs/decisions/README.md).
2. **Scope Boundaries:** Consult [`docs/ROADMAP.md`](docs/ROADMAP.md) and [`docs/SCOPE.md`](docs/SCOPE.md). Strictly avoid scope creep (no multi-tenant SaaS, no heavy distributed message queues). We are building toward the `v1.0.0` definition of done.
