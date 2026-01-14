# UCCP Convex Backend - Agent Instructions

## Overview

This directory contains all Convex backend functions for the UCCP platform.

## File Organization

```
convex/
├── schema.ts              # Database schema (single source of truth)
├── auth.ts                # Convex Auth configuration
├── auth.config.ts         # Auth providers config
├── http.ts                # HTTP endpoints for auth
├── myFunctions.ts         # Demo functions (can be removed later)
├── helpers/
│   └── auth.ts            # Authorization helper functions
├── organizations.ts       # Organization CRUD
├── organizationMembers.ts # Membership management  
├── platformAdmins.ts      # Platform admin functions
└── _generated/            # Auto-generated (don't edit)
```

## Schema Conventions

```typescript
// Use v validators
import { v } from "convex/values";

// Foreign keys
orgId: v.id("organizations"),

// Enums via literals
role: v.union(v.literal("admin"), v.literal("manager"), v.literal("staff")),

// Optional fields
description: v.optional(v.string()),

// Always add indexes for queried fields
.index("by_orgId", ["orgId"])
.index("by_userId_orgId", ["userId", "orgId"])
```

## Function Patterns

### Query
```typescript
export const myQuery = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    
    // Check authorization
    const role = await getOrgRole(ctx, userId, args.orgId);
    if (!role) throw new Error("Not authorized");
    
    return await ctx.db
      .query("tableName")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});
```

### Mutation
```typescript
export const myMutation = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    
    return await ctx.db.insert("tableName", {
      name: args.name,
      createdAt: Date.now(),
    });
  },
});
```

### Internal Functions
```typescript
// For functions only called by other functions, not clients
import { internalMutation } from "./_generated/server";

export const seedData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // No auth check needed for internal functions
  },
});
```

## Authorization Helpers

Put reusable auth logic in `helpers/auth.ts`:

```typescript
// Check if user is platform admin
export async function isPlatformAdmin(ctx, userId) {
  const admin = await ctx.db
    .query("platformAdmins")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
  return !!admin;
}

// Get user's role in an organization
export async function getOrgRole(ctx, userId, orgId) {
  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_userId_orgId", (q) => 
      q.eq("userId", userId).eq("orgId", orgId)
    )
    .first();
  return membership?.role ?? null;
}
```

## Gotchas

1. **Index Required**: Always use `.withIndex()` for queries in production
2. **Order Matters**: Compound index fields must be queried in order
3. **No Joins**: Convex has no joins - fetch related data with multiple queries
4. **Real-Time**: All queries are subscriptions - UI auto-updates
5. **Auth Import**: Always from `@convex-dev/auth/server`, not `@convex-dev/auth`

## Security Patterns (MANDATORY)

### 1. Input Validation
```typescript
// Always validate string inputs
const trimmedName = args.name.trim();
if (trimmedName.length === 0) throw new Error("Name cannot be empty");
if (trimmedName.length > 100) throw new Error("Name too long");

// Validate slug format with regex
const slugRegex = /^[a-z0-9-]+$/;
if (!slugRegex.test(args.slug)) throw new Error("Invalid slug");
```

### 2. Entity Existence Checks Before Relationships
```typescript
// Always verify referenced entities exist before creating relationships
const org = await ctx.db.get(args.orgId);
if (!org) throw new Error("Organization not found");

const user = await ctx.db.get(args.userId);
if (!user) throw new Error("User not found");
```

### 3. Authorization Check Order
```typescript
// 1. Authentication first
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Unauthenticated");

// 2. Authorization second
const isAdmin = await isPlatformAdmin(ctx, userId);
const role = await getOrgRole(ctx, userId, args.orgId);
if (!isAdmin && role !== "admin") throw new Error("Unauthorized");

// 3. Input validation third
// 4. Business logic last
```

### 4. Sensitive Operations Check
```typescript
// Restrict sensitive fields to higher roles
if ((args.plan !== undefined || args.isActive !== undefined) && !isPlatAdmin) {
    throw new Error("Unauthorized: Only platform admins can change plan or status");
}
```

## Common Mistakes to Avoid

1. **Never trust client input** - Always validate on backend, even if frontend validates too
2. **Don't skip existence checks** - Orphaned records are hard to debug
3. **Always log admin actions** - Add audit trail for sensitive operations (TODO)
4. **Handle deleted entities** - Filter null from Promise.all results when joining
5. **Don't expose internal errors** - Use generic messages for security-sensitive failures

## Multi-Tenant Isolation Pattern

Every table with tenant-scoped data MUST:
1. Have an `orgId` field
2. Have an index on `orgId` (or compound index starting with orgId)
3. Every query MUST filter by orgId
4. Never return data across organizations unless platform admin

```typescript
// Correct: Always filter by orgId
const products = await ctx.db
    .query("products")
    .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
    .collect();

// WRONG: Never query without org filter
const products = await ctx.db.query("products").collect(); // DANGER!
```
