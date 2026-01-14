# UCCP Phase 2: Product & Catalog Engine

## Overview

This phase implements the core Product & Catalog Engine for the Universal Commerce Control Platform. Following the Convex-first architecture, all product data is real-time and multi-tenant isolated.

## Goals

1. Enable platform admins and org admins to manage products
2. Support draft/publish workflow for safe product editing
3. Implement product variants (size, color, etc.)
4. Set up category organization
5. Maintain strict org-scoped data isolation

## Technical Requirements

### Multi-Tenant Isolation
- Every table has `orgId` field
- Every query filters by `orgId`
- Indexes optimized for org-scoped queries

### Price Handling
- Prices stored as integers (cents) to avoid floating-point issues
- Display formatting handled on frontend

### Status Workflow
- `draft` - Not visible to customers
- `active` - Live on storefront
- `archived` - Hidden but preserved for order history

---

## User Stories

### US-201: Products Table Schema
**As a** developer  
**I want** a products table in the schema  
**So that** I can store product data with proper indexes

**Acceptance Criteria:**
- Products table added to schema.ts
- Fields: name, slug, description, price, compareAtPrice, status, categoryId, images, orgId, createdAt, updatedAt
- Index on orgId for multi-tenant queries
- Index on orgId + slug for unique lookup
- Index on orgId + status for filtered listings
- Typecheck passes

---

### US-202: Product Variants Table Schema
**As a** developer  
**I want** a productVariants table  
**So that** products can have size/color/etc. variants

**Acceptance Criteria:**
- ProductVariants table added to schema
- Fields: productId, orgId (denormalized), sku, name, price, stockQuantity, options, isDefault, createdAt
- Index on productId for variant lookup
- Index on orgId + sku for SKU uniqueness check
- Typecheck passes

---

### US-203: Categories Table Schema
**As a** developer  
**I want** a categories table  
**So that** products can be organized hierarchically

**Acceptance Criteria:**
- Categories table added to schema
- Fields: name, slug, parentId (optional), position, orgId, createdAt
- Index on orgId
- Index on orgId + slug for unique lookup
- Index on parentId for hierarchy queries
- Typecheck passes

---

### US-204: Create Product Mutation
**As an** org admin  
**I want** to create new products  
**So that** I can add items to my catalog

**Acceptance Criteria:**
- Mutation at convex/products.ts
- Validates: name (1-200 chars), slug format, price >= 0
- Auto-generates slug from name if not provided
- Checks slug uniqueness within org
- Requires org admin or platform admin role
- Sets default status to "draft"
- Returns new product ID
- Typecheck passes

---

### US-205: List Products Query
**As an** org member  
**I want** to list products in my organization  
**So that** I can browse the catalog

**Acceptance Criteria:**
- Query at convex/products.ts
- Filters by orgId (required)
- Optional status filter
- Returns products ordered by createdAt desc
- Requires org membership
- Typecheck passes

---

### US-206: Get Product Query
**As an** org member  
**I want** to get a single product's details  
**So that** I can view/edit it

**Acceptance Criteria:**
- Query at convex/products.ts
- Accepts productId OR (orgId + slug)
- Returns product with variants attached
- Validates org membership
- Returns null if not found
- Typecheck passes

---

### US-207: Update Product Mutation
**As an** org admin  
**I want** to update product information  
**So that** I can keep my catalog current

**Acceptance Criteria:**
- Mutation at convex/products.ts
- Validates all input fields
- Checks slug uniqueness if changed
- Requires org admin or platform admin
- Updates updatedAt timestamp
- Typecheck passes

---

### US-208: Toggle Product Status Mutation
**As an** org admin  
**I want** to publish/unpublish/archive products  
**So that** I can control what's visible

**Acceptance Criteria:**
- Mutation at convex/products.ts
- Accepts productId and target status
- Validates org admin role
- Prevents archiving if pending orders (future)
- Updates updatedAt
- Typecheck passes

---

### US-209: Create Variant Mutation
**As an** org admin  
**I want** to add variants to a product  
**So that** I can offer size/color options

**Acceptance Criteria:**
- Mutation at convex/productVariants.ts
- Validates product exists and belongs to same org
- Validates SKU uniqueness within org
- Sets stockQuantity default to 0
- First variant is marked isDefault
- Typecheck passes

---

### US-210: Update/Delete Variant Mutations
**As an** org admin  
**I want** to modify or remove variants  
**So that** I can manage product options

**Acceptance Criteria:**
- Update mutation with validation
- Delete mutation with safety check (can't delete last variant if product is active)
- Requires org admin role
- Typecheck passes

---

### US-211: Category CRUD Mutations
**As an** org admin  
**I want** to manage product categories  
**So that** I can organize my catalog

**Acceptance Criteria:**
- Create, update, delete mutations at convex/categories.ts
- Validates slug uniqueness within org
- Validates parentId if provided
- Prevents deletion if products reference category
- Typecheck passes

---

### US-212: List Categories Query
**As an** org member  
**I want** to see all categories  
**So that** I can categorize products

**Acceptance Criteria:**
- Query returns flat list with parentId for frontend tree building
- Sorted by position then name
- Requires org membership
- Typecheck passes

---

### US-213: Products List Admin Page
**As an** org admin  
**I want** a products management page  
**So that** I can view and manage my catalog

**Acceptance Criteria:**
- Page at /admin/products
- Shows product table with name, status, price, variant count
- Status filter dropdown
- Link to create new product
- Requires org context from OrganizationProvider
- Typecheck passes

---

### US-214: Create/Edit Product Form
**As an** org admin  
**I want** a form to create and edit products  
**So that** I can manage product details

**Acceptance Criteria:**
- Component at components/ProductForm.tsx
- Fields: name, slug (auto-generate), description, price, compareAtPrice, categoryId
- Form validation on client
- Used for both create and edit modes
- Success/error feedback
- Typecheck passes

---

### US-215: Product Detail Page with Variants
**As an** org admin  
**I want** to see product details and manage variants  
**So that** I can configure product options

**Acceptance Criteria:**
- Page at /admin/products/[id]
- Shows product info with edit form
- Variants section with add/edit/delete
- SKU and stock management per variant
- Status toggle button
- Typecheck passes

---

## Browser Verification

After frontend stories (US-213, US-214, US-215), verify in browser:
1. Navigate to /admin/products
2. Create a new product
3. Add variants
4. Toggle status to active
5. Verify category assignment
