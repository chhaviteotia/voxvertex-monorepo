# AGENTS.md

## Cursor Cloud specific instructions

### Overview

VoxVertex is a speaker-booking marketplace monorepo with two main apps:

- **Frontend** (`apps/frontend/`): Next.js 15 + React 19 + Tailwind CSS. This is the primary runnable app.
- **Backend** (`apps/backend/`): Express 5 scaffold. Has package.json with dependencies but no source code yet (no entry point).

Shared packages in `packages/` are empty shells.

### Running the frontend

```bash
cd apps/frontend && npm run dev
```

Dev server runs on port 3000.

### Building the frontend

The build script skips linting (`next build --no-lint`):

```bash
cd apps/frontend && npm run build
```

### Known issues

- **ESLint is broken**: `eslint.config.mjs` imports `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` without `.js` extensions, but the installed `eslint-config-next@15.5.2` does not have proper ESM exports. Running `npm run lint` will fail. This is a pre-existing codebase issue.
- **Backend has no source code**: `apps/backend/` contains only the package.json with Express/cors/dotenv dependencies and domain directory scaffolding (`.gitkeep` files). There is no `index.js`, `server.js`, or `dev` script. The backend cannot be started.

### Development commands reference

See `README.md` for full instructions. Key scripts:

| App | Command | Description |
|-----|---------|-------------|
| Frontend | `npm run dev` | Start Next.js dev server (port 3000) |
| Frontend | `npm run build` | Production build (lint disabled) |
| Frontend | `npm run lint` | ESLint (currently broken, see above) |
| Frontend | `npm run dev:full` | Run frontend + backend concurrently (backend won't work without source) |
