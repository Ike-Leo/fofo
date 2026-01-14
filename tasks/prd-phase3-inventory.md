# Phase 3: Inventory & Stock Engine

## 1. Introduction
The **Inventory & Stock Engine** is the source of truth for product availability. Unlike simple "stock counters," this engine tracks **every stock movement** (inbound, outbound, adjustment, return) as an immutable event. This ensures auditability, prevents race conditions, and enables real-time stock visibility for the storefront.

## 2. Goals
- **Immutable History**: Track every change to stock levels with a reason and user attribution.
- **Atomic Operations**: Prevent race conditions when multiple orders or admins adjust stock simultaneously.
- **Real-time Visibility**: Instant updates to the admin dashboard and (eventually) storefronts.
- **Low Stock Awareness**: Proactively identify items needing replenishment.

## 3. User Stories

### Backend & Schema

#### US-301: Inventory Schema & Migration
**As a** System Architect
**I want** to define the `inventoryMovements` table and update `productVariants`
**So that** I can track stock history and support efficient queries.
- **Acceptance Criteria**:
  - `inventoryMovements` table defined:
    - `orgId`, `variantId`, `productId`
    - `type`: "received", "sold", "adjusted", "returned"
    - `quantity`: number (positive for add, negative for remove)
    - `reason`: string (optional)
    - `userId`: Id<"users"> (who made the change)
    - `createdAt`: number
  - Indexes for efficient querying by variant and organization.
  - Updates to `productVariants` to ensure `stockQuantity` is treated as a computed/cached value (if acceptable) or the source of truth is maintained via atomic ops.
  - **Note**: We will keep `stockQuantity` on `productVariants` for fast reads, but all writes MUST go through the inventory engine mutations which update both the log and the current count atomically.

#### US-302: Atomic Stock Adjustment Mutation
**As an** Org Admin
**I want** to adjust stock levels (add or remove) via a secure API
**So that** I can correct counts or receive new shipments without race conditions.
- **Acceptance Criteria**:
  - Function `api.inventory.adjust` created.
  - Args: `variantId`, `type` (manual_adjustment), `quantity` (delta), `reason`.
  - Atomically updates `productVariants.stockQuantity`.
  - Inserts record into `inventoryMovements`.
  - Validates resulting stock is not negative (unless configuration allows backorders - assume NO backorders for now).
  - Auth check: Org Admin or Plat Admin only.

#### US-303: Inventory Query By Organization
**As an** Org Admin
**I want** to see a list of all products/variants with their current stock levels
**So that** I can quickly identify what is in stock or out of stock.
- **Acceptance Criteria**:
  - Function `api.inventory.list` created.
  - Returns variants joined with product info (name, image).
  - Supports filtering by "low stock" (e.g. < 5).
  - Supports sorting by stock level (asc/desc).

#### US-304: Inventory History Query
**As an** Org Admin
**I want** to see the history of changes for a specific variant
**So that** I can audit why stock is missing or when a shipment arrived.
- **Acceptance Criteria**:
  - Function `api.inventory.getHistory` created.
  - Args: `variantId`.
  - Returns paginated list of movements.
  - Includes user info (who moved it) and timestamp.

### Frontend (Admin Dashboard)

#### US-305: Inventory Dashboard Page
**As an** Org Admin
**I want** to view a dedicated Inventory page
**So that** I can manage stock across the entire catalog.
- **Acceptance Criteria**:
  - Page at `/admin/inventory`.
  - Table displaying Product Name, Variant Name (SKU), Current Stock, Status (In Stock/Low/Out).
  - "Low Stock" indicator (yellow for < 10, red for 0).
  - Browser verification required.

#### US-306: Stock Adjustment Interface
**As an** Org Admin
**I want** to easily update stock from the inventory list
**So that** I can process shipments or corrections quickly.
- **Acceptance Criteria**:
  - "Adjust" button on each row in Inventory Dashboard.
  - Opens a modal/popover.
  - Fields: Operation (Add/Remove), Quantity, Reason.
  - API integration with `api.inventory.adjust`.
  - Success toast message.
  - List updates instantly (real-time).

#### US-307: Movement History View
**As an** Org Admin
**I want** to drill down into a variant's history
**So that** I can trace stock discrepancies.
- **Acceptance Criteria**:
  - Clickable variant/SKU in the inventory table opens a "History" drawer/modal or navigation to details.
  - Displays timeline of stock changes.
  - Shows "Who, What (Qty), When, Why".

#### US-308: Low Stock Filtering
**As an** Org Admin
**I want** to filter the inventory list to show only low stock items
**So that** I can prioritize reordering.
- **Acceptance Criteria**:
  - Filter toggle "Low Stock Only" on Inventory Page.
  - "Low stock" defined as <= threshold (default 5 or 10).
  - Visual emphasis on these rows.

## 4. Technical Considerations
- **Concurrency**: Use `ctx.db.patch` inside the mutation. Convex guarantees serializability within a mutation, preventing race conditions.
- **Security**: Strictly scoped to `orgId`.
- **Validation**: Prevent negative stock unless explicitly allowed (future feature).
