# Git Etiquette & Version Control Standard

> **Mandate:** Version control is not an external backup drive or an undo history—it is a **durable engineering communication log**.
>
> When hiring managers, Staff Engineers, and tech leads evaluate a candidate's GitHub repository, the Git log is one of the highest-signal indicators of seniority. A clean, atomic, disciplined Git tree immediately distinguishes an engineer with production-grade instincts from a novice committing monolithic blobs.

---

## 1. The Pre-Git Execution Checklist (6-Gate Protocol)

Before running **any** Git staging, committing, or pushing command, you must verify all six gates in sequence:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Branch Isolation Gate                                    │
│    Are you on a dedicated feature branch? (NEVER on main)   │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Working Tree Hygiene Gate                                │
│    Are untracked scratch files, .env, or OS junk excluded?   │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Atomic Staging Gate                                      │
│    Is only ONE logical change staged? (Banned: git add .)   │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Pre-Commit Verification Gate                             │
│    Did pytest / tsc pass 100% cleanly on staged changes?    │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Commit Length & Grammar Gate                             │
│    Is the message strictly 5–8 words in imperative mood?    │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Push & PR Protocol Gate                                  │
│    Is it pushed to origin with a structured PR description? │
└─────────────────────────────────────────────────────────────┘
```

---

### Gate 1: Branch Isolation
* **Rule:** **Never commit directly to `main` once production CI/CD is live.**
* **Check:** Run `git branch --show-current`.
* **Standard Naming Conventions:**
  * `feat/<feature-slug>` — New functionality (e.g. `feat/live-telemetry-plane`).
  * `fix/<bug-slug>` — Defect or regression resolution (e.g. `fix/testclient-deadlock`).
  * `docs/<topic-slug>` — Pure documentation updates (e.g. `docs/roadmap-and-v1-spec`).
  * `refactor/<module-slug>` — Code restructuring without behavioral change.
  * `perf/<target-slug>` — Performance or memory optimization.

---

### Gate 2: Working Tree Hygiene
* **Rule:** Run `git status` and inspect modified and untracked files before staging.
* **Checks:**
  * No secrets, API keys, or `.env` files present.
  * No build artifacts (`node_modules/`, `dist/`, `__pycache__/`, `.pytest_cache/`).
  * No personal scratch notes or OS clutter (`.DS_Store`, `Thumbs.db`).
  * If temporary files exist, ensure they are added to `.gitignore` or left strictly unstaged.

---

### Gate 3: Atomic Staging (The Single-Responsibility Principle)
* **Rule:** **`git add .` and `git add -A` are strictly banned.**
* **Guideline:** A single commit must represent **one** indivisible unit of work. If you modify a backend endpoint, a frontend hook, and a documentation file, they belong in **separate commits**.
* **Test:** If you revert this commit tomorrow, does it roll back only the specific feature/fix without breaking unrelated code? If yes, it is atomic.

---

### Gate 4: Pre-Commit Verification
* **Rule:** **Never commit broken code.** Every commit must build and pass existing tests.
* **Checklist for ARIA:**
  ```bash
  # 1. Backend tests must pass 100%
  pytest -q
  
  # 2. Frontend must typecheck and build cleanly without warnings
  cd web && npm run build && cd ..
  ```

---

### Gate 5: The 5–8 Word Imperative Commit Rule
* **Rule:** The commit message title must be **strictly between 5 and 8 words**, written in the **imperative mood**, using **Conventional Commit** prefixes.
* **Why:** If you cannot describe the purpose of a commit in 5–8 words, the commit is doing too much and must be chunked.

#### Format:
```text
<type>(<scope>): <imperative action phrase>
```

#### Approved Types:
* `feat`: New feature for the user or system.
* `fix`: Bug fix or regression patch.
* `refactor`: Internal refactoring that preserves external behavior.
* `test`: Adding or updating tests.
* `docs`: Documentation only changes.
* `ci`: Continuous integration or build pipeline edits.
* `chore`: Dependency updates, tooling, or project metadata.

#### Positive vs. Negative Examples:

| Status | Message | Word Count | Rationale |
| :--- | :--- | :---: | :--- |
| ❌ **Bad** | `fixed stuff` | 2 | Vague, no context, completely useless. |
| ❌ **Bad** | `added backend endpoint and updated frontend store and fixed styles` | 10 | Monolithic commit mixing three distinct layers. |
| ❌ **Bad** | `fixing typo in readme and updating roadmap` | 7 | Uses gerund ("fixing") instead of imperative ("fix"). |
| ✅ **Good** | `feat(api): add sse telemetry streaming endpoint` | 6 | Precise, imperative, scoped to API. |
| ✅ **Good** | `feat(store): add live telemetry state slice` | 6 | Scoped to frontend state store. |
| ✅ **Good** | `feat(ui): add in-browser live traffic generator` | 6 | Scoped to UI interaction component. |
| ✅ **Good** | `docs: add v1 roadmap and exit criteria` | 7 | Clear documentation milestone addition. |
| ✅ **Good** | `docs: record architecture decision for live telemetry` | 7 | High-signal ADR record commit. |

---

### Gate 6: Remote Push & PR Protocol
* **Rule:** Push the feature branch to `origin` and open a Pull Request.
* **Standard PR Template for High-Signal Portfolios:**
  1. **Problem Statement / Context:** What degradation or gap is being resolved?
  2. **Solution Breakdown:** Bulleted list of the atomic commits and architecture changes.
  3. **Verification & Proof:** Exact output of test suites, screenshots of UI changes, or benchmark reproduction.
  4. **Architectural Traceability:** Link to the relevant Architecture Decision Record (`DR-xxx`) or Roadmap milestone.

---

## 2. Red Flags That Disqualify Candidates

When reviewing candidate repositories, senior interviewers immediately scan for these red flags:

| Red Flag | What It Signals to Interviewers |
| :--- | :--- |
| **Monolithic "WIP" Commits** | Lack of version control discipline; treats Git as an afterthought. |
| **"Commit & Push to Main" Culture** | Never worked in a team or CI/CD environment; high risk of breaking production. |
| **Commented-out Code & Debug Prints** | Careless cleanup; leaves `console.log` and `print()` in production trees. |
| **Force-Pushing Merged Branches (`git push -f`)** | Destructive habits; rewrites shared history without understanding consequences. |
| **Inconsistent Commit Cadence** | Months of silence followed by one massive 10,000-line commit ("vibe-coding dump"). |

---

## 3. Quick Reference Cheatsheet

```bash
# 1. Start fresh feature branch from latest main
git checkout main
git pull origin main
git checkout -b feat/<feature-name>

# 2. Work in small increments & verify tests
pytest -q

# 3. Stage ONLY related files
git add path/to/specific/file.py

# 4. Commit using 5–8 imperative words
git commit -m "feat(module): add concise imperative description"

# 5. Push branch to remote
git push -u origin feat/<feature-name>

# 6. Open PR via GitHub URL and verify CI green
```
