# Phase 4: Order & Fulfillment Engine

## 1. Introduction
The **Order & Fulfillment Engine** is the heart of the commerce transaction. It bridges the gap between the Catalog (Products) and Operations (Inventory). It handles the complex "Checkout" transaction, ensuring stock is reserved/deducted correctly, and provides the workflow for fulfillment (Pick, Pack, Ship).

## 2. Goals
- **Transactional Integrity**: Checkout must be atomic. Stock deduction and Order creation happen together or not at all.
- **Workflow Management**: Support standard ecommerce states (Pending, Paid, Processing, Shipped, Cancelled).
- **Data Completeness**: Store full snapshots of line items (price, name) at time of purchase to handle future product changes.

## 3. User Stories

### Backend & Schema

#### US-401: Order Schema Definition
**As a** System Architect
**I want** to define the `orders` and `orderItems` tables
**So that** I can store transaction data securely.
- **Acceptance Criteria**:
  - `orders` table: `orgId`, `orderNumber` (friendly ID), `status`, `paymentStatus`, `totalAmount`, `customerInfo` (object), `createdAt`.
  - `orderItems` table: `orderId`, `productId`, `variantId`, `productName`, `variantName`, `quantity`, `price` (snapshot).
  - Indexes: `by_orgId`, `by_orgId_status`.

#### US-402: Atomic Checkout Mutation
**As a** Customer (or POS Admin)
**I want** to place an order
**So that** I can purchase items and reserve stock.
- **Acceptance Criteria**:
  - `api.orders.create` mutation.
  - Validates stock availability for all items first.
  - Throws error if insufficient stock.
  - Deducts stock via `inventory.adjust` (or internal logic) atomically.
  - Creates Order and OrderItems.
  - Returns Order ID.

#### US-403: Order Management Functions
**As an** Admin
**I want** to view and manage orders
**So that** I can fulfill them.
- **Acceptance Criteria**:
  - `api.orders.list`: specific to Organization.
  - `api.orders.get`: Single order with items joined.
  - `api.orders.updateStatus`: Transition state (e.g. Processing -> Shipped).

### Frontend (Admin Dashboard)

#### US-407: Orders List Page
**As an** Admin
**I want** to see a list of incoming orders
**So that** I can track sales and fulfillment.
- **Acceptance Criteria**:
  - Page at `/admin/orders`.
  - Table showing: Order #, Date, Customer, Total, Status, Payment.
  - Filters: Status filter (All, Pending, Shipped).

#### US-408: Order Detail & Fulfillment Page
**As an** Admin
**I want** to view full order details and update status
**So that** I can pack and ship the items.
- **Acceptance Criteria**:
  - Page at `/admin/orders/[id]`.
  - Customer details card.
  - Line items table (Image, Name, Qty, Price).
  - "Timeline/Actions" to change status (Mark as Paid, Mark as Shipped).
  - Status changes reflect in UI.

#### US-409: Manual Order Entry (POS)
**As an** Admin
**I want** to create an order manually
**So that** I can record offline sales or test the flow.
- **Acceptance Criteria**:
  - "Create Order" button on Orders page.
  - Simple form: Select Product/Variant, Qty, Enter Customer Name.
  - Uses the atomic checkout mutation.

## 4. Technical Considerations
- **Concurrency**: The Checkout mutation is the most critical critical-section in the app. Using Convex's transactional guarantees is essential.
- **Snapshots**: `orderItems` MUST store the `price` and `name` at time of purchase. Do not reference `products` table for price display on historical orders.
