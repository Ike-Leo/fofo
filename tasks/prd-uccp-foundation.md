# PRD: Universal Commerce Control Platform (UCCP) - Foundation Phase

## Introduction

The **Universal Commerce Control Platform (UCCP)** is a headless, real-time commerce and operations backend designed to power any business that sells products or services online. This PRD covers the **Foundation Phase**—establishing the core multi-tenant architecture, organization management, and essential platform infrastructure that all subsequent modules will build upon.

This foundation phase transforms the existing Next.js + Convex Auth starter into the core UCCP platform with:
- Multi-tenant organization system with proper isolation
- Role-based access control (RBAC) at the organization level
- Platform-level (Super Admin) capabilities
- Real-time data architecture patterns that all modules will follow

---

## Goals

- **Multi-Tenant Architecture**: Every Convex table includes `orgId` with automatic enforcement at the function level
- **Organization Management**: Create, read, update organizations with proper metadata
- **User-Organization Binding**: Users belong to organizations with defined roles
- **Role-Based Access Control**: Admin, Manager, Staff roles per organization
- **Platform Super Admin**: Platform-level oversight and cross-tenant capabilities
- **Real-Time Foundation**: Establish patterns for live queries and event-driven mutations
- **Secure by Default**: No cross-tenant data access unless explicitly authorized

---

## User Stories

### US-001: Organization Schema & Table
**Description:** As a developer, I need to store organization data so businesses can be managed as tenants.

**Acceptance Criteria:**
- [ ] Add `organizations` table to Convex schema
- [ ] Fields: `name` (string), `slug` (string, unique), `plan` (literal: 'free' | 'pro' | 'enterprise'), `isActive` (boolean, default true), `createdAt` (number)
- [ ] Add index on `slug` for lookup
- [ ] npm run typecheck passes

---

### US-002: Organization Membership Schema
**Description:** As a developer, I need to track which users belong to which organizations and their roles.

**Acceptance Criteria:**
- [ ] Add `organizationMembers` table to Convex schema
- [ ] Fields: `orgId` (Id<"organizations">), `userId` (Id<"users">), `role` (literal: 'admin' | 'manager' | 'staff'), `joinedAt` (number)
- [ ] Add compound index on `orgId` and `userId`
- [ ] Add index on `userId` for user's organizations lookup
- [ ] npm run typecheck passes

---

### US-003: Platform Admins Schema
**Description:** As a developer, I need to identify platform-level super admins who can manage all organizations.

**Acceptance Criteria:**
- [ ] Add `platformAdmins` table to Convex schema
- [ ] Fields: `userId` (Id<"users">), `grantedAt` (number), `grantedBy` (optional Id<"users">)
- [ ] Add index on `userId` for quick admin check
- [ ] npm run typecheck passes

---

### US-004: Create Organization Mutation
**Description:** As a platform admin, I want to create new organizations so businesses can be onboarded.

**Acceptance Criteria:**
- [ ] Create `organizations.create` mutation
- [ ] Accepts `name` and `slug` arguments
- [ ] Validates slug is unique (returns error if taken)
- [ ] Validates slug format (lowercase, alphanumeric, hyphens only)
- [ ] Sets `plan` to 'free' by default
- [ ] Sets `createdAt` to current timestamp
- [ ] Only platform admins can create organizations (helper function for auth check)
- [ ] npm run typecheck passes

---

### US-005: List Organizations Query
**Description:** As a platform admin, I want to view all organizations to manage the platform.

**Acceptance Criteria:**
- [ ] Create `organizations.listAll` query
- [ ] Returns all organizations (for platform admins only)
- [ ] Returns `_id`, `name`, `slug`, `plan`, `isActive`, `createdAt`
- [ ] Ordered by `createdAt` descending (newest first)
- [ ] Only accessible by platform admins
- [ ] npm run typecheck passes

---

### US-006: Get User's Organizations Query
**Description:** As a user, I want to see which organizations I belong to and my role in each.

**Acceptance Criteria:**
- [ ] Create `organizationMembers.myOrganizations` query
- [ ] Returns organizations the authenticated user belongs to
- [ ] Includes organization details and user's role
- [ ] Requires authentication (returns empty for unauthenticated)
- [ ] npm run typecheck passes

---

### US-007: Add Organization Member Mutation
**Description:** As an organization admin, I want to add users to my organization with specific roles.

**Acceptance Criteria:**
- [ ] Create `organizationMembers.add` mutation
- [ ] Accepts `orgId`, `userId`, and `role` arguments
- [ ] Validates caller is admin of the organization
- [ ] Prevents duplicate memberships (same user + org)
- [ ] Sets `joinedAt` to current timestamp
- [ ] npm run typecheck passes

---

### US-008: Check Platform Admin Helper
**Description:** As a developer, I need a reusable helper to check if a user is a platform admin.

**Acceptance Criteria:**
- [ ] Create `helpers/auth.ts` with `isPlatformAdmin` function
- [ ] Accepts `ctx` and `userId` as arguments
- [ ] Returns boolean indicating admin status
- [ ] Efficiently queries `platformAdmins` table by userId index
- [ ] npm run typecheck passes

---

### US-009: Check Organization Role Helper
**Description:** As a developer, I need a reusable helper to check a user's role in an organization.

**Acceptance Criteria:**
- [ ] Add `getOrgRole` function to `helpers/auth.ts`
- [ ] Accepts `ctx`, `userId`, and `orgId` as arguments
- [ ] Returns role ('admin' | 'manager' | 'staff') or null if not a member
- [ ] Uses compound index for efficient lookup
- [ ] npm run typecheck passes

---

### US-010: Update Organization Mutation
**Description:** As an organization admin or platform admin, I want to update organization details.

**Acceptance Criteria:**
- [ ] Create `organizations.update` mutation
- [ ] Accepts `orgId`, optional `name`, optional `plan`, optional `isActive`
- [ ] Validates caller is org admin OR platform admin
- [ ] Only platform admins can change `plan`
- [ ] Only platform admins can change `isActive` (suspend/activate)
- [ ] npm run typecheck passes

---

### US-011: Seed Initial Platform Admin
**Description:** As a developer, I need a way to bootstrap the first platform admin.

**Acceptance Criteria:**
- [ ] Create `platformAdmins.seedInitial` mutation (internal function)
- [ ] Creates platform admin record for a given userId
- [ ] Only works if no platform admins exist (bootstrap only)
- [ ] Can be triggered via Convex dashboard or CLI
- [ ] npm run typecheck passes

---

### US-012: Organization Context Provider (Frontend)
**Description:** As a frontend developer, I need a React context to manage the current organization.

**Acceptance Criteria:**
- [ ] Create `components/OrganizationProvider.tsx`
- [ ] Provides `currentOrg`, `setCurrentOrg`, and `userOrgs` via context
- [ ] Fetches user's organizations using the query from US-006
- [ ] Persists selected organization in localStorage
- [ ] Auto-selects first org if none persisted
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-013: Organization Switcher Component (Frontend)
**Description:** As a user belonging to multiple organizations, I want to switch between them from the header.

**Acceptance Criteria:**
- [ ] Create `components/OrganizationSwitcher.tsx`
- [ ] Displays current organization name
- [ ] Dropdown menu with all user's organizations
- [ ] Clicking an org updates the context and closes dropdown
- [ ] Shows role badge next to each org (Admin, Manager, Staff)
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-014: Platform Admin Dashboard Route (Frontend)
**Description:** As a platform admin, I want a dedicated admin dashboard to manage organizations.

**Acceptance Criteria:**
- [ ] Create `app/admin/page.tsx` route
- [ ] Lists all organizations using the query from US-005
- [ ] Shows org name, slug, plan, status, and created date
- [ ] Displays loading state while fetching
- [ ] Only accessible to platform admins (redirects others)
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-015: Create Organization Form (Frontend)
**Description:** As a platform admin, I want a form to create new organizations from the admin dashboard.

**Acceptance Criteria:**
- [ ] Create `components/CreateOrganizationForm.tsx`
- [ ] Form fields for `name` and `slug`
- [ ] Auto-generates slug from name (kebab-case)
- [ ] Submit button calls the mutation from US-004
- [ ] Shows error message if slug is taken
- [ ] Shows success message and clears form on success
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

---

## Functional Requirements

- **FR-1**: Every tenant-scoped table must include an `orgId` field with proper indexing
- **FR-2**: All queries/mutations accessing tenant data must validate `orgId` access
- **FR-3**: Platform admins can access any organization's data for oversight
- **FR-4**: Organization members can only access their own organization's data
- **FR-5**: Role hierarchy: Admin > Manager > Staff (each level inherits permissions of lower levels)
- **FR-6**: Organization slugs must be globally unique and URL-safe
- **FR-7**: All mutations must validate caller authentication and authorization
- **FR-8**: Real-time queries must support live updates via Convex subscriptions

---

## Non-Goals (Out of Scope for Foundation Phase)

- Product catalog, inventory, or order management (future modules)
- Customer/CRM functionality (future module)
- Promotions and content engine (future module)
- Chat/messaging system (future module)
- Analytics and reporting beyond basic org listing
- Multi-location/warehouse support
- Payment processing or subscription billing
- Email notifications or webhooks
- API rate limiting or usage tracking
- SSO or social login beyond basic auth
- Mobile app or POS integration

---

## Technical Considerations

### Convex-First Architecture
- All business logic lives in Convex functions (queries, mutations, actions)
- Real-time by default: UI auto-updates via live query subscriptions
- No separate REST API layer—Convex IS the API

### Authorization Pattern
```typescript
// Standard pattern for org-scoped functions
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Unauthenticated");

const role = await getOrgRole(ctx, userId, args.orgId);
if (!role) throw new Error("Not a member of this organization");
if (role !== 'admin') throw new Error("Admin access required");
```

### Schema Conventions
- Use `v.id("tableName")` for foreign key references
- Include `createdAt: v.number()` on all records
- Use literal unions for enums: `v.union(v.literal("a"), v.literal("b"))`

### File Structure
```
convex/
├── schema.ts           # All table definitions
├── organizations.ts    # Org CRUD functions
├── organizationMembers.ts  # Membership functions
├── platformAdmins.ts   # Platform admin functions
├── helpers/
│   └── auth.ts         # Auth helper functions
```

### Existing Dependencies
- `@convex-dev/auth` for authentication (already configured)
- Next.js 16 with App Router
- Tailwind CSS for styling
- TypeScript strict mode

---

## Success Metrics

- Platform admin can create a new organization in < 3 clicks
- Users can switch organizations in < 2 clicks
- Zero cross-tenant data leakage (validated via test queries)
- All org-scoped queries return in < 100ms
- TypeScript catches all authorization errors at compile time

---

## Open Questions

- Should we support custom roles beyond Admin/Manager/Staff in Phase 1?
- Should organization invitations be email-based or link-based?
- Should we add organization deletion or only soft-delete (isActive = false)?
- What's the process for transferring organization ownership?
