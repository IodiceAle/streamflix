# StreamFlix (PWA) - Development Guidelines

Project documentation and orchestration rules for StreamFlix, a Netflix-like streaming platform.

## 🚀 Tech Stack
- **Frontend:** React 19, Vite 6, TypeScript
- **Routing:** React Router 7
- **Styling:** Tailwind CSS, Framer Motion, Lucide React
- **Data Fetching:** TanStack Query (React Query)
- **Backend/Auth:** Supabase
- **Content API:** TMDB API
- **Video Source:** VixSrc.to

## 🛠 Core Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🏗 Coding Standards & Patterns
- **Language:** TypeScript (Strict mode enabled)
- **Components:** Functional components with Hooks
- **Styling:** Tailwind CSS (utility-first)
- **State Management:** React Context (global), React Query (server)
- **API Integration:**
  - `src/services/tmdb.ts`: TMDB API & data normalization
  - `src/services/supabase.ts`: Supabase client & auth helpers
  - `src/services/vidsrc.ts`: Video embed URL generation

## 🔄 Workflow Orchestration (MANDATORY)

### 1. Plan Node Default
- Enter **Plan Mode** (`enter_plan_mode`) for ANY non-trivial task (3+ steps or architectural decisions).
- If something goes sideways, **STOP and re-plan** immediately.
- Use plan mode for verification steps, not just building.
- Write detailed specs upfront to reduce ambiguity.

### 2. Subagent Strategy
- Use subagents (`generalist`, `codebase_investigator`) liberally to keep main context window clean.
- Offload research, exploration, and parallel analysis to subagents.
- One task per subagent for focused execution.

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern.
- Write rules that prevent the same mistake.
- Ruthlessly iterate on lessons until the mistake rate drops.

### 4. Verification Before Done
- Never mark a task complete without proving it works.
- Diff behavior between main and changes.
- Ask: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness.

### 5. Demand Elegance (Balanced)
- For non-trivial changes: ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution."
- Skip for simple, obvious fixes - don't over-engineer.

### 6. Autonomous Bug Fixing
- Fix bug reports autonomously. Point at logs/errors/tests - then resolve.
- Zero context switching required from the user.

## 📋 Task Management
1. **Plan First**: Write plan to `tasks/todo.md` with checkable items.
2. **Verify Plan**: Check in before starting implementation.
3. **Track Progress**: Mark items complete as you go.
4. **Capture Lessons**: Update `tasks/lessons.md` after corrections.

## 🎯 Core Principles
- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## 🔗 Key Paths
- `src/components`: UI components
- `src/pages`: Page components
- `src/context`: React Context providers
- `src/services`: API & integrations
- `src/types`: TypeScript definitions
- `tasks/`: Task management and lesson tracking
