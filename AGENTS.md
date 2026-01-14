# UCCP Project - Agent Instructions

## Overview

This is the **Universal Commerce Control Platform (UCCP)** - a headless, real-time, multi-tenant commerce backend built on Convex.

## Project Structure

```
test6/
├── my-app/                    # Main Next.js + Convex application
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # React components
│   ├── convex/                # Convex backend functions
│   │   ├── schema.ts          # Database schema
│   │   ├── helpers/           # Shared helper functions
│   │   └── _generated/        # Auto-generated Convex types
│   └── package.json
├── scripts/ralph/             # Ralph autonomous agent system
│   ├── ralph.ps1              # Windows PowerShell runner
│   ├── prompt.md              # Agent instructions
│   ├── prd.json               # Current PRD in Ralph format
│   └── progress.txt           # Learning log
├── tasks/                     # PRD markdown files
├── amp-skills/                # Agent skills library
└── ultrathink.md              # Backend architecture philosophy
```

## Commands

```powershell
# Start development (from my-app/)
cd my-app
npm run dev

# This runs both:
# - Next.js frontend on http://localhost:3000
# - Convex backend (syncs functions)

# TypeScript check
cd my-app && npx tsc --noEmit

# Lint
cd my-app && npm run lint

# Run Ralph
cd scripts/ralph
.\ralph.ps1 [max_iterations]
```

## Key Patterns

### Convex Schema
```typescript
// my-app/convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,  // From @convex-dev/auth
  tableName: defineTable({
    field: v.string(),
    orgId: v.id("organizations"),  // Multi-tenant key
  }).index("by_orgId", ["orgId"]),
});
```

### Authorization Pattern
```typescript
// Always check auth at function start
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Unauthenticated");

// For org-scoped operations
const role = await getOrgRole(ctx, userId, args.orgId);
if (!role) throw new Error("Not a member");
```

### Frontend Data
```typescript
// Real-time query
const data = useQuery(api.moduleName.queryName, { args });

// Mutation
const doThing = useMutation(api.moduleName.mutationName);
await doThing({ args });
```

## Multi-Tenant Architecture

- Every tenant-scoped table has `orgId` field
- All queries/mutations validate organization access
- Platform admins can access any organization
- Regular users can only access their organizations

## Philosophy (from ultrathink.md)

1. **Resilient Simplicity** - Prefer boring, battle-tested solutions
2. **Idempotency** - All mutations should be idempotent
3. **Ecosystem Discipline** - Use Convex patterns, don't reinvent
4. **Real-Time First** - UI auto-updates via Convex subscriptions

## Foundation Phase Learnings

### Environment Setup Notes
- `AUTH_SECRET`, `SITE_URL`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `JWKS` required for Convex Auth Password provider
- JWT keys can be generated with `node generate-keys.js` and JWKS with `node generate-jwks.js`
- First platform admin must be added manually via Convex Dashboard or `seedInitial` mutation

### Technical Debt (To Address)
1. **Type Safety**: Frontend uses `(api as any)` casts - needs `npx convex codegen` to generate proper types
2. **Error Boundaries**: Admin dashboard should wrap queries in ErrorBoundary for non-admin users
3. **Mobile Support**: OrganizationSwitcher uses hover-only dropdown - needs click handler for touch
4. **Loading States**: Forms need loading spinner during submission
5. **Audit Logging**: Admin actions not logged - add audit trail table in Phase 2

### Security Checklist (Phase 2+)
- [ ] Add rate limiting to create operations
- [ ] Implement soft delete with audit trail
- [ ] Add remove member / update role functions
- [ ] Add delete organization function (with cascade checks)
- [ ] Add org-scoped data isolation to all future tables

### Frontend Best Practices
```typescript
// Skip queries when not authenticated
const orgs = useQuery(
    api.organizations.listAll,
    isAuthenticated ? {} : "skip"
);

// Always handle loading and error states
if (isLoading) return <Loading />;
if (error) return <Error error={error} />;
```

## File Naming Conventions

| Type | Location | Pattern |
|------|----------|---------|
| Backend module | `convex/[entity].ts` | `organizations.ts`, `products.ts` |
| Backend helper | `convex/helpers/[topic].ts` | `auth.ts`, `validation.ts` |
| React component | `components/[Name].tsx` | `OrganizationSwitcher.tsx` |
| Page route | `app/[route]/page.tsx` | `app/admin/page.tsx` |
| Context provider | `components/[Name]Provider.tsx` | `OrganizationProvider.tsx` |
