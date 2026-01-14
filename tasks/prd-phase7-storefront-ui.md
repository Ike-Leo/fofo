# Phase 7: Storefront Frontend & Payments

## 1. Introduction
Phase 7 focuses on building the visual storefront that consumers will actually use. We will build a premium, responsive Next.js frontend consuming the Phase 6 APIs. We will also integrate Stripe to move from "manual" checkout to real payment processing.

## 2. Goals
- **Visuals**: "Wow" the user with premium design (Glassmorphism, animations).
- **Listing**: Browse and filter products.
- **Cart**: Smooth cart management (likely a slide-over drawer).
- **Payments**: Real money processing via Stripe.

## 3. User Stories (Ralph-Ready)

### US-701: Storefront Layout & Home
**As a** Shopper
**I want** a beautiful landing page for the store
**So that** I trust the brand and want to shop.
- **Acceptance Criteria**:
  - `app/store/[slug]/layout.tsx`: Store-specific layout (distinct from Admin).
  - Header with Logo and Cart Icon (with badge).
  - `app/store/[slug]/page.tsx`: Hero section + Featured Products grid.
  - Responsive design (Mobile first).
  - `npm run lint` passes.

### US-702: Product Listing & Details
**As a** Shopper
**I want** to browse products and see details
**So that** I can choose what to buy.
- **Acceptance Criteria**:
  - `app/store/[slug]/products/page.tsx`: Grid of all products (`api.public.products.list`).
  - `app/store/[slug]/product/[productSlug]/page.tsx`: Large image gallery, price, description.
  - Variant selectors (Size, Color) updates price/stock display.
  - "Add to Cart" button (calls `api.public.cart.addItem`).
  - `npm run lint` passes.

### US-703: Shopping Cart Drawer
**As a** Shopper
**I want** to see what I've selected
**So that** I can manage my budget.
- **Acceptance Criteria**:
  - Global Cart State (React Context or Zustand) tied to `api.public.cart.get`.
  - Slide-over Cart Drawer component.
  - Ability to increment/decrement/remove items.
  - Live total calculation.
  - "Checkout" button.

### US-704: Stripe Integration (Backend)
**As a** Developer
**I want** to process payments securely
**So that** the store gets paid.
- **Acceptance Criteria**:
  - Add `stripe` dependency.
  - Create `convex/stripe.ts` (Action) to create PaymentIntents.
  - Create `internal.orders.markPaid` mutation.
  - Values from `api.public.cart.get` determine charge amount.
  - Webhook handler? (Or stick to client-side confirmation + server validation for MVP).

### US-705: Checkout Page
**As a** Shopper
**I want** to enter my address and pay
**So that** I receive my goods.
- **Acceptance Criteria**:
  - `app/store/[slug]/checkout/page.tsx`.
  - Customer Info Form (Name, Email, Address).
  - Stripe Elements integration (Payment Element).
  - On success, call `api.public.checkout` (or the new Stripe-aware flow).
  - Redirect to Success page.

## 4. Technical Considerations
- **Stripe**: We need to use Convex Actions for the API call to Stripe.
- **Styling**: Use the existing `index.css` guidelines (rich aesthetics).
- **State**: Use a lightweight global store for "Cart Open" state.

## 5. Next Steps
- Execute US-701 to set up the skeleton.
