# Phase 6: Public Storefront API

## 1. Introduction
Phase 6 shifts focus from the secured Admin Dashboard to the public-facing shopping experience. We need to expose a secure API that allows unauthenticated (guest) and authenticated users to browse products, manage a shopping cart, and place orders.

## 2. Goals
- **Public Access**: Allow fetching products without being a member of the organization.
- **Session Management**: Track guest carts using a session ID or device ID.
- **Cart Logic**: Handle adding/removing items and calculating totals.
- **Conversion**: Transform a Cart into an Order (Checkout).

## 3. User Stories (Ralph-Ready)

### US-601: Public Product API
**As a** Storefront Developer
**I want** to fetch active products for a specific organization
**So that** I can build the product listing page.
- **Acceptance Criteria**:
  - NEW `convex/public.ts` file for public-facing functions.
  - Query `public.products.list({ orgSlug })` that returns `active` products only.
  - Query `public.products.get({ orgSlug, slug })` for single product details.
  - Returns public fields only (hide cost price, supplier info, etc if they existed).
  - TypeScript types exported for frontend use.
  - `npm run typecheck` passes.

### US-602: Cart Schema
**As a** System Architect
**I want** a database structure for shopping carts
**So that** we can persist potential sales.
- **Acceptance Criteria**:
  - Add `carts` table: `orgId`, `sessionId` (string, index), `userId` (optional), `status` (active/completed).
  - Add `cartItems` table: `cartId`, `productId`, `variantId`, `quantity`.
  - Add indexes: `by_sessionId`, `by_cartId`.
  - `npm run typecheck` passes.

### US-603: Public Cart Actions (Add/Update)
**As a** Shopper
**I want** to add items to my cart
**So that** I can collect things I want to buy.
- **Acceptance Criteria**:
  - Mutation `public.cart.addItem({ orgId, sessionId, productId, variantId, quantity })`.
    - Creates cart if `sessionId` doesn't exist.
    - Validates stock quantity (cannot add more than available).
  - Mutation `public.cart.updateQuantity`.
  - Mutation `public.cart.removeItem`.
  - `npm run typecheck` passes.

### US-604: Get Cart Query
**As a** Shopper
**I want** to view my cart total
**So that** I know how much I'm spending.
- **Acceptance Criteria**:
  - Query `public.cart.get({ sessionId })`.
  - Returns cart items populated with current product details (name, price, image).
  - Calculates total price on the server side.
  - `npm run typecheck` passes.

### US-605: Checkout (Cart -> Order)
**As a** Shopper
**I want** to complete my purchase
**So that** I can get my items.
- **Acceptance Criteria**:
  - Mutation `public.checkout({ cartId, customerDetails })`.
  - Validates stock *one last time*.
  - Uses existing `orders.create` logic (or extracts common logic) to generate the Order.
  - Deducts inventory.
  - Marks Cart as `completed`.
  - Returns `orderId` and `orderNumber` to user.
  - `npm run typecheck` passes.

## 4. Technical Considerations
- **Security**: Public queries must strictly filter by `orgId` / `orgSlug`. Never expose all data.
- **Concurrency**: Checkout must be transactional (Convex mutations are transactional by default).
- **Session ID**: For now, the frontend will generate a random string and store it in localStorage as the `sessionId`.

## 5. Next Steps
- Verify these APIs with a potential "Storefront" implementation in Phase 7.
- Integrate Stripe (Phase 7).
