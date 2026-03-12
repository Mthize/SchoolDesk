# AGENTS - SchoolDesk
- Central guide for agentic contributors working inside this repo.
- Document focuses on build/test commands plus code-style agreements.
- Follow existing architecture; avoid sweeping rewrites unless required.
- Always inspect both backend and frontend before coding cross-cutting work.
- Prefer Bun-managed scripts; npm/yarn are unsupported here.
- Keep secrets (.env, keys) out of git; rely on env vars locally.
- Use English comments only when logic is non-obvious.
- File encodings stay ASCII/UTF-8; avoid emoji or smart quotes.
- When in doubt, mimic the nearest existing module's patterns.
## Repository Layout
- Monorepo-style root with separate `backend` (Express+Bun) and `frontend` (Vite+React).
- Each workspace keeps its own `bun.lock`, `package.json`, and TS config.
- Backend source under `backend/src` splits into `config`, `controllers`, `models`, `routes`, `utils`, and `inngest`.
- Frontend source under `frontend/src` organizes by feature (`components`, `pages`, `hooks`, `lib`, `assets`).
- Shared frontend aliases: `@` resolves to `frontend/src`; see `tsconfig.json`.
- Styles rely on Tailwind CSS v4 via `src/index.css` plus `@theme inline`.
- Backend uses MongoDB via Mongoose; ensure local DB running before API work.
- Long-running or AI-heavy workloads live in `backend/src/inngest`.
- No Cursor or Copilot rule files exist right now; update this doc if they appear.
## Toolchain & Environment
- Use Bun 1.2.23+ (matching template) for installs and script execution.
- Node types target v20+; backend uses ESM with `"type": "module"`.
- MongoDB connection string pulled from `MONGO_URL`; never hard-code.
- Auth + cookies depend on `JWT_SECRET` and `CLIENT_URL` for CORS.
- AI features require `GOOGLE_GENERATIVE_AI_API_KEY` configured.
- Frontend fetch layer uses `VITE_API_BASE_URL`; fallback is http://localhost:5000/api.
- Start dev services from repo root but run commands inside respective workspace directories.
- Ensure ports: backend 5000, frontend 5173 (Vite default) unless changed.
- Use `bunx` when invoking local CLIs (shadcn, inngest) to avoid global installs.
## Backend Dev Commands
- Install dependencies once: `cd backend && bun install`.
- Start hot-reload API server: `bun run dev` (nodemon + Bun running `src/server.ts`).
- Lightweight watcher without nodemon: `bun start` (Bun native file watcher).
- One-off execution for scripts: `bun run src/<file>.ts` (Bun transpiles TS automatically).
- Inngest local testing: `bunx inngest dev --src src/inngest/functions.ts`.
- No lint script defined backend-wide; run `bunx eslint src --ext ts` if needed.
- Build artifact not required; deployment expects Bun runtime + TS transpilation on the fly.
- Env loading handled via `dotenv.config()`; keep `.env` adjacent to `package.json`.
- For debugging, enable verbose logging by setting `NODE_ENV=development`.
## Frontend Dev Commands
- Install deps: `cd frontend && bun install` (creates node_modules via Bun).
- Run dev server with HMR: `bun run dev` (defaults to http://localhost:5173).
- Build production assets: `bun run build` (TS project references + Vite build).
- Preview production bundle: `bun run preview` after building.
- Lint entire app: `bun run lint` (flat ESLint config with React hooks plugins).
- Tailwind v4 uses CSS @imports; no standalone config file - edit `src/index.css`.
- Components registry managed through `bunx --bun shadcn@latest add <component>`.
- Use `bunx --bun shadcn@latest add --all` cautiously; check generated output into git.
- Preferred package updates happen via `bun add <pkg>` to keep lockfile consistent.
## Testing & QA Expectations
- Automated tests are not yet implemented in either workspace; prioritize adding coverage when touching critical flows.
- Backend suggestion: adopt Bun's built-in test runner - scaffold files under `backend/src/**/*.test.ts`.
- Run the full backend suite (once created) with `cd backend && bun test`.
- Execute a single backend test file via `bun test src/path/to/file.test.ts`.
- Filter to an individual test name using `bun test --filter "should create class" src/.../class.test.ts`.
- Frontend suggestion: add Vitest + Testing Library; follow Vite docs for config.
- Future frontend single-test command: `bunx vitest run src/<component>.test.tsx`.
- Until automated tests exist, manually verify flows (auth, CRUD, inngest triggers) before merging.
- Document any new test commands in this file whenever coverage is added.
## Linting & Formatting
- Frontend linting uses flat ESLint config combining `@eslint/js`, `typescript-eslint`, React hooks, and react-refresh.
- Keep lint config minimal; add new rules via `eslint.config.js` rather than legacy configs.
- Backend lacks a first-class lint script; prefer `bunx eslint src --ext ts --max-warnings=0` when adding rules.
- Formatting favors Prettier-like spacing already in files (2 spaces, semicolons, double quotes).
- Import sorting is manual; group npm modules first, then absolute paths, then relatives.
- Use TypeScript's `type` import modifier (e.g., `import { type Request }`) when the symbol is erased at runtime.
- Avoid default exports unless the module already uses them (e.g., some models); prefer named exports otherwise.
- Tailwind utility order follows design intent > breakpoints > animations; lean on `cn` helper to merge classes.
- Run `bun run lint` (frontend) before PRs touching React code to catch hook/order issues.
## Backend Code Style
- Controllers live in `src/controllers` and use async functions with explicit return types `Promise<void>` when responding directly.
- Add request metadata comments (`@desc`, `@route`, `@access`) to new controller handlers for parity.
- Validate inputs early; return after sending an error response to avoid double-sends.
- Always wrap DB access in `try/catch`; respond with `res.status(500).json({ message: "Server Error", error })` for unhandled failures.
- When referencing `req.user`, cast to `AuthRequest` or use `(req as AuthRequest)` like existing files.
- Keep pagination helpers similar to `getAllUsers`: parse query params, build `filter`, then `Promise.all` for `countDocuments` + query.
- Use Mongoose schema timestamps and indexes; follow existing definitions (`timestamps: true`).
- Password hashing belongs in schema middleware similar to `userSchema.pre("save")`.
- Log auditable actions through `logActivity` to keep audit trails consistent.
## Backend Data & Naming
- Schemas reside in `src/models`; export both the typed interface and the compiled model.
- Keep enums (like `UserRole`) uppercased while stored values remain lowercase strings.
- Relationship fields reference other models via `mongoose.Schema.Types.ObjectId` and `ref` strings that match filenames.
- Keep collection names singular (User, Class, Subject) to match existing exports.
- Use camelCase for variable names and route params (e.g., `:classId`).
- Routers live under `src/routes` and should only orchestrate middleware order plus controller binding.
- Register routers under descriptive prefixes in `src/server.ts` (`/api/users`, `/api/classes`, etc.).
- Middleware belongs in `src/middleware`; add new functions exporting typed `Request/Response/NextFunction` signatures.
- Keep env-driven constants (e.g., pagination defaults) near file tops to ease configuration.
## Frontend Code Style Basics
- React components are function components written in TSX with explicit prop interfaces when props exist.
- Default exports only for page-level or router-bound modules; shared components use named exports.
- Import order: third-party packages, then aliased project modules (`@/components/...`), then relative paths.
- Keep hooks (state, effect, context) at the top level; respect React compiler expectations.
- Strong typing via `React.FC` is avoided; prefer inline prop types or `React.ComponentProps`.
- For CSS, rely on Tailwind utility classes and design tokens defined in `index.css`.
- Compose class names using `cn` helper; avoid string concatenation for conditional styles.
- Keep files focused: UI primitives under `components/ui`, domain widgets under feature directories, pages under `pages`.
- Use `export type` in `src/types.ts` for shared domain models between components.
## Frontend UI & Layout
- Layout is controlled via `PrivateRoutes` which wraps content in `SidebarProvider`, `AppSidebar`, and `SidebarInset`.
- Theme toggling handled by `ThemeProvider`; default theme is dark stored under key `vite-ui-theme`.
- Forms rely on `react-hook-form` + custom `Form` primitives in `components/ui/form.tsx`.
- For selects/multi-select, prefer the abstractions under `components/global` instead of raw HTML selects.
- Use Shadcn UI wrappers (button, input, dialog, etc.) for consistent focus rings and density.
- Charts, carousels, and advanced widgets come from `components/ui` as well; reuse before building new ones.
- Apply iconography through `lucide-react`; keep size classes consistent (use `className="h-4 w-4"`).
- `sonner` is the standardized toast provider; trigger via `toast.success`/`toast.error`.
- Keep backgrounds engaging by pairing Tailwind gradient utilities with CSS variables defined in `index.css`.
## State & Data Fetching Patterns
- Global auth context lives in `hooks/AuthProvider`; wrap children so `useAuth` returns { user, setUser, loading, year }.
- Data fetching goes through the Axios instance `api`, which already sets `withCredentials:true`.
- Centralize CRUD helpers inside feature-specific hooks or components; avoid sprinkling bare `axios` calls.
- When calling protected routes client-side, always check `loading` before redirecting to login.
- Store derived values (pagination, filters) in component state and sync with query params when useful.
- Use `router.tsx` for route definitions; nested children under `PrivateRoutes` require authentication.
- For forms, pair `react-hook-form` with `zodResolver` (see `components/academic-year/AcademicYearForm`).
- Manage tables and lists via `components/ui/table`, `components/ui/pagination`, and `useMemo` for derived data.
- When referencing backend enums (roles, statuses), import types from `src/types.ts` to stay in sync.
## Error Handling & Logging
- Backend errors: log server-side via `console.error` or structured logger before responding.
- Do not expose stack traces to clients; send `{ message: "Server Error" }` plus optional context object.
- Use HTTP status codes consistently (400 for validation, 401 unauthorized, 404 not found, 500 server).
- `protect` middleware ensures JWT cookies exist; call `authorize` with explicit role arrays.
- After writing to response, immediately `return` to halt further execution (prevents Express warnings).
- Client-side, catch Axios errors and surface toasts via `sonner` and inline form messages.
- Loading states: show skeletons or `Loader2` icons until `useAuth` resolves.
- When building long-running flows (AI, timetables), emit progress logs so Bun console shows each step.
- Keep activity auditing up to date by invoking `logActivity` after mutating sensitive records.
## AI & Background Jobs
- AI-powered features use Inngest functions defined in `backend/src/inngest/functions.ts`.
- `generateTimeTable` and `generateExam` rely on Google Generative AI (`gemini-3-flash-preview`).
- Protect these routes by gating trigger endpoints server-side; never expose raw API keys to the client.
- Clean AI JSON responses by stripping Markdown fences before `JSON.parse` (pattern already implemented).
- Persist schedules/exams via upsert logic; mirror existing `step.run` structure when adding new tasks.
- Throw `NonRetriableError` for validation issues so Inngest stops retrying.
- Keep `event.data` payloads minimal and serializable (IDs, not hydrated documents).
- When adding functions, append them to `inngestFunctions` array so Express `serve` registers them.
- Test flows locally by running `bunx inngest dev` alongside the backend server.
## Contribution & Release Checklist
- Work inside feature branches; keep commits scoped (no auto-generated lockfiles unless required).
- Run relevant commands before committing: backend `bun run dev` smoke test, frontend `bun run lint` + manual UI check.
- Ensure API + frontend speak to same base URL (`VITE_API_BASE_URL` -> backend port).
- Update this AGENTS file whenever commands, env vars, or style rules change.
- Mention absence/presence of Cursor/Copilot instructions in PR descriptions; currently none exist.
- Describe schema changes clearly and include migration steps (e.g., indices, default documents).
- Verify `bun.lock` files are updated when dependencies change; never edit them manually.
- Keep dependency additions minimal; prefer existing libs (Radix, React Hook Form, Axios, Mongoose).
- Request reviewers to validate AI-heavy flows since they depend on external quotas.
