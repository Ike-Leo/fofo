# Phase 5: Analytics, CRM, and Insights

## 1. Introduction
With data flowing through the system (Products, Inventory, Orders), Phase 5 transforms this raw data into actionable intelligence. We will also formalize the concept of "Customers" to enable CRM capabilities.

## 2. Goals
- **Business Vitals**: Provide accurate, real-time metrics (Revenue, Volume).
- **Visual Intelligence**: Use charts to show trends.
- **Customer Centrality**: Moving from "anonymous orders" to "Customer Profiles" with purchase history.

## 3. User Stories

### Backend & Data
#### US-501: Customer Schema & Sync
**As a** System Architect
**I want** a `customers` table
**So that** I can track lifetime value and repeating buyers.
- **Acceptance Criteria**:
  - `customers` table: `orgId`, `email` (unique index), `name`, `phone`, `firstSeenAt`, `lastSeenAt`, `totalOrders`, `totalSpend`.
  - Update `api.orders.create` to:
    - Check if customer exists by email.
    - If no, create.
    - If yes, update `lastSeenAt`, `totalOrders`, `totalSpend`.
  - Backfill script (optional for MVP, but good to have) to populate customers from existing orders.

#### US-502: Analytics Queries
**As an** Admin
**I want** aggregated data
**So that** I can see how my business is doing.
- **Acceptance Criteria**:
  - `api.analytics.getDashboardStats`: Returns { revenue, ordersCount, lowStockCount, averageOrderValue }.
  - `api.analytics.getSalesChart`: Returns daily revenue for last 30 days.

### Frontend
#### US-503: Admin Dashboard (Home)
**As an** Admin
**I want** a rich landing page
**So that** I see vital stats immediately.
- **Acceptance Criteria**:
  - Replace empty home at `/admin` with Dashboard.
  - KPI Cards: Revenue, Orders, Customers, Low Stock.
  - Chart: "Revenue Last 30 Days" (using `recharts`).

#### US-504: Customer List (CRM)
**As an** Admin
**I want** to browse customers
**So that** I can find my VIPs.
- **Acceptance Criteria**:
  - Page `/admin/customers`.
  - Table sorted by `totalSpend` descending.
  - Search by email/name.

#### US-505: Customer Detail
**As an** Admin
**I want** to see a customer's history
**So that** I can support them better.
- **Acceptance Criteria**:
  - Page `/admin/customers/[id]`.
  - Stats: LTV, Order Count.
  - List of their specific orders.

## 4. Technical Strategy
- **Dependency**: Install `recharts` for visualization.
- **Migration**: We will need to perform a "lazy migration" or "one-time script" to populate customers from the orders we just created.
