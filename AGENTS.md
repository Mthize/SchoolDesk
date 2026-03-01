# AGENTS.md - SchoolDesk Development Guidelines

This document provides essential information for agents working on the SchoolDesk project.

## Project Overview

SchoolDesk is a full-stack web application with:
- **Backend**: Express.js with TypeScript, MongoDB (Mongoose), Bun runtime
- **Frontend**: React 19 with TypeScript, Vite

---

## Commands

### Backend (from `backend/` directory)

| Command | Description |
|---------|-------------|
| `bun install` | Install dependencies |
| `bun dev` | Run development server with nodemon (hot reload) |
| `bun start` | Run server with hot reload |

### Frontend (from `frontend/` directory)

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint on entire project |
| `npm run preview` | Preview production build |

### Running a Single Test

Currently there are no test frameworks configured. To add tests, use:
- **Backend**: `bun test` or `vitest`
- **Frontend**: `npm run test` with Vitest or Jest

---

## Code Style Guidelines

### General Principles

- **No comments** unless explicitly required by the user
- Use **strict TypeScript** everywhere
- Prefer **early returns** over nested conditionals
- Keep functions small and focused (single responsibility)

### TypeScript Configuration

**Backend** (`backend/tsconfig.json`):
- Strict mode enabled
- `moduleResolution: bundler`
- `verbatimModuleSyntax: true`
- `noUnusedLocals: false`, `noUnusedParameters: false`

**Frontend** (`frontend/tsconfig.app.json`):
- Strict mode enabled
- `noUnusedLocals: true`, `noUnusedParameters: true`
- `verbatimModuleSyntax: true`
- `erasableSyntaxOnly: true`

### Imports

**Order** (alphabetical within groups):
1. External libraries (React, Express, etc.)
2. Internal models/types
3. Internal utilities
4. Internal middleware
5. Internal controllers/routes

**Example**:
```typescript
import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, type userRoles } from "../models/user";
import { generateToken } from "../utils/generateToken";
import { protect } from "../middleware/auth";
import { logActivity } from "../utils/activitylog";
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `academic-year.ts`, `activities-log.ts` |
| Models | PascalCase | `User`, `AcademicYear` |
| Controllers | PascalCase | `register`, `getAllUsers` |
| Functions | camelCase | `generateToken`, `logActivity` |
| Interfaces/Types | PascalCase | `AuthRequest`, `UserRole` |
| Enums | PascalCase with UPPER values | `UserRole.ADMIN` |
| Database fields | camelCase | `studentClass`, `teacherSubject` |
| Routes | kebab-case with slashes | `/api/users/:id` |

### React/Frontend Patterns

- Use **functional components** with hooks
- Use **named exports** for components
- Component file naming: `PascalCase.tsx`
- Keep components in `src/components/` or feature folders
- Use TypeScript interfaces for props

### Error Handling

**Backend pattern** (Express controllers):
```typescript
export const controllerName = async (req: Request, res: Response): Promise<void> => {
  try {
    // Business logic
    res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
```

- Always wrap async controller logic in try/catch
- Return appropriate HTTP status codes (200, 201, 400, 401, 404, 500)
- Use consistent error response format: `{ message: string, error?: any }`
- Log errors with context when possible

**Frontend pattern**:
- Handle API errors with try/catch in async functions
- Display user-friendly error messages
- Use TypeScript types for API responses

### Database (MongoDB/Mongoose)

- Define interfaces for Document types
- Use Mongoose pre-save middleware for password hashing
- Use `Schema.pre()` hooks for data transformations
- Index frequently queried fields
- Use enums for fixed-value fields

**Model example**:
```typescript
export enum UserRole {
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT = "student",
  PARENT = "parent",
}

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}
```

### Authentication

- Use JWT stored in HTTP-only cookies
- Token verification in middleware (`src/middleware/auth.ts`)
- Role-based access control via `authorize()` middleware

---

## Project Structure

```
/backend
  /src
    /config       - Database configuration
    /controllers  - Request handlers
    /middleware   - Auth, validation, etc.
    /models       - Mongoose schemas
    /routes       - Express routes
    /types        - TypeScript interfaces
    /utils        - Helper functions
    server.ts     - Entry point

/frontend
  /src
    /components   - React components
    /hooks        - Custom React hooks
    /pages        - Page components
    /api          - API client functions
    App.tsx       - Root component
    main.tsx      - Entry point
```

---

## Important Notes

- **Backend**: Uses Bun runtime (not Node.js directly)
- **Environment**: All secrets go in `.env` files (never commit these)
- **No tests currently exist** - consider adding Vitest for both projects
- **API Routes**: Follow RESTful conventions (`/api/resource`, POST/GET/PUT/DELETE)
- **Response format**: Use consistent JSON structure `{ data }` or `{ message }`
