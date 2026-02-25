# AGENTS.md - Development Guidelines for SchoolDesk

## Project Overview

This is a monorepo containing:
- **backend/** - Express.js API with Bun runtime, MongoDB/Mongoose
- **fontend/** - React 19 + TypeScript + Vite (note: intentionally named "fontend")

---

## Build, Lint, and Test Commands

### Frontend (fontend/)

```bash
# Development server with HMR
cd fontend && npm run dev

# Production build
cd fontend && npm run build

# Run ESLint (linting only, no auto-fix)
cd fontend && npm run lint

# Lint with auto-fix
cd fontend && npx eslint . --fix

# Preview production build
cd fontend && npm run preview

# TypeScript type checking
cd fontend && npx tsc --noEmit
```

### Backend (backend/)

```bash
# Development server with auto-reload (using nodemon + bun)
cd backend && bun run dev

# Start production server
cd backend && bun start

# Install dependencies
cd backend && bun install

# TypeScript type checking
cd backend && npx tsc --noEmit
```

### Running a Single Test

**No test framework is currently configured.** To add tests:
1. Install Vitest (`npm install -D vitest`) for frontend
2. Install Bun's built-in test runner for backend (`bun test`)
3. Update this section with appropriate commands

---

## Code Style Guidelines

### General

- Use **TypeScript** exclusively (`.ts` / `.tsx` files)
- Enable **strict mode** in TypeScript
- Use `bun` for backend runtime, `npm` for frontend tooling

### Formatting

- Use **2 spaces** for indentation (match existing code)
- Use **double quotes** for strings in backend, single quotes in frontend (follow ESLint defaults)
- Use **semicolons** in backend code
- Add trailing commas where appropriate
- Maximum line length: 100 characters (soft limit)

### Imports

```typescript
// Backend - use type imports where possible
import express, { type Application, type Request, type Response } from "express";
import { User } from "../models/user";

// Frontend - group imports logically
import { useState } from 'react'
import './App.css'
import { api } from './services/api'
```

- Use **barrel exports** (`index.ts`) for clean public APIs
- Use **path aliases** if configured (check tsconfig.json)
- Import types separately: `import { type SomeType } from "..."`

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `user-controller.ts`, `activity-log.ts` |
| Components | PascalCase | `UserProfile.tsx`, `Dashboard.tsx` |
| Functions | camelCase | `getUserById()`, `calculateTotal()` |
| Variables | camelCase | `userList`, `isActive` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Interfaces/Types | PascalCase | `UserResponse`, `ApiError` |
| Enums | PascalCase (members UPPER) | `UserRole.ADMIN` |

### Types

- Always define **return types** for functions
- Use **explicit types** over `any`
- Use **generics** for reusable components
- Prefer **interfaces** for object shapes, **types** for unions/intersections

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

export const getUser = async (id: string): Promise<User | null> => {
  // ...
}

// Avoid
const getUser = async (id) => {
  // ...
}
```

### Error Handling

- Use **try/catch** blocks for async operations
- Return consistent error responses
- Log errors appropriately (use `console.error` in backend)

```typescript
// Backend pattern
export const someHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // logic
    res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};
```

### React Components

- Use **functional components** with hooks
- Use **React 19** features (React Compiler enabled)
- Define **Props** types explicitly

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

### Express.js Patterns (Backend)

- Use **controllers** for business logic
- Use **routes** for routing definitions
- Use **middleware** for cross-cutting concerns
- Use **models** for Mongoose schemas

```
backend/src/
├── config/       # Database, environment config
├── controllers/  # Request handlers (business logic)
├── middleware/   # Auth, validation, etc.
├── models/       # Mongoose schemas
├── routes/       # Route definitions
├── utils/        # Helper functions
└── server.ts     # App entry point
```

---

## Environment Variables

Create `.env` files in respective directories:

```bash
# backend/.env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/schooldesk
JWT_SECRET=your-secret-key

# fontend/.env
VITE_API_URL=http://localhost:5000
```

---

## ESLint Configuration

The frontend uses ESLint with these plugins:
- `@eslint/js`
- `typescript-eslint`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`

Run `npm run lint` before committing.

---

## TypeScript Configuration

### Frontend (fontend/tsconfig.app.json)
- Target: ES2022
- Module: ESNext
- Strict mode enabled
- `jsx: "react-jsx"`

### Backend (backend/tsconfig.json)
- Target: ESNext
- Module: Preserve
- Strict mode enabled
- `verbatimModuleSyntax: true`

---

## Common Tasks

### Adding a new backend route
1. Create controller in `src/controllers/`
2. Create route in `src/routes/`
3. Register in `server.ts`

### Adding a new frontend page
1. Create component in `src/components/` or `src/pages/`
2. Add route in routing configuration
3. Run `npm run build` to verify no type errors

### Adding a new model
1. Create Mongoose schema in `backend/src/models/`
2. Export type/interface for frontend use

---

## Important Notes

- The frontend directory
- Backend uses **Bun** runtime, not Node.js directly
- MongoDB is required for backend (uses Mongoose ODM)
- No test framework is currently set up
