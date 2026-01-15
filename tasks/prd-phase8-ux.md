# Phase 8: Twitter Dark Mode UX Overhaul

## 1. Overview
This phase focuses on aligning the Universal Commerce Control Platform (UCCP) with a premium "Twitter Dark Mode" aesthetic. The current implementation has significant design inconsistencies ("Light Mode Leaks") and contrast issues that need to be resolved to achieve a cohesive, professional look.

## 2. Design Tokens & Theme
- **Global Theme:** Deep Dark Mode.
- **Background Color:** `#000000` (Pure Black).
- **Card/Container Color:** `#16181C` (Dark Charcoal).
- **Primary Accent (`--color-primary`):** `#1D9BF0` (Twitter Blue).
- **Secondary Accent:** `#F91880` (Twitter Pink - for destructive/highlights) or `#00BA7C` (Twitter Green - for success).
- **Typography:**
  - UI/Body: `Open Sans`
  - Headings: `Georgia`
  - Code/Mono: `Menlo`
- **Border Radius:** `1.3rem` (Rounded cards).

## 3. Critical UI Fixes (Stories)

### US-801: Global Design Tokens & Theme Setup
- **Goal:** Establish the foundational CSS variables and install required fonts.
- **Tasks:**
  - Install `Open Sans` and `Georgia` fonts.
  - Update `globals.css` / Tailwind config to use the new color palette.
  - Set default background to `#000000` and text to `#E7E9EA` (White/Grey).

### US-802: Dashboard UX Fixes
- **Goal:** Eliminate "Zebras" and visible contrast issues.
- **Tasks:**
  - **Fix Reviews:** Change "Customer Reviews" cards from White (`bg-white`) to Dark (`bg-[#16181C]`).
  - **Fix Chart:** Update "Sales Overview" chart bars to Primary Blue (`#1D9BF0`).
  - **Refine Stats:** Ensure top stats cards use consistent dark styling.

### US-803: Customers Page UX Fixes
- **Goal:** Remove light mode containers.
- **Tasks:**
  - **Fix Top 5:** Remove the Cream/Beige container. Use a distinct Dark Card (`bg-[#16181C]`).
  - **Fix Summary:** Change White summary cards to Dark Cards.
  - **Fix Inverted Colors:** Ensure text inside these cards is proper Light Grey.

### US-804: Customer Detail UX Fixes
- **Goal:** Consistent dark detail view.
- **Tasks:**
  - **Fix Panels:** Change "Contact Information" and "Order History" panels from White to Dark Cards.
  - **Fix Stats:** Redesign "Lifetime Value" (Green) and "Total Orders" (Purple) cards. Instead of solid heavy blocks, use Dark Cards with colored Borders or Text accents.

### US-805: Product Page UX Fixes
- **Goal:** Dark mode sidebars.
- **Tasks:**
  - **Fix Sidebars:** Change "Variants" and "Activity Log" panels from White to Dark Cards.
  - **Fix Contrast:** Ensure text inside these panels is readable (Light Grey on Dark).

### US-806: Orders & Modals UX Fixes
- **Goal:** Full immersion in dark mode.
- **Tasks:**
  - **Fix Sticky Bar:** Change the "Status: Active" floating bar from White to Dark (`bg-[#16181C]`) with shadow.
  - **Fix Modal:** Update "Create Order" modal to use Dark Theme (Dark bg, dark inputs, light text).
  - **Fix Buttons:** Update "Unpublish/Archive" buttons to have proper dark mode contrast (Ghost or Filled styles).

### US-807: UI Polish - Pills & Buttons
- **Goal:** Modern, premium feel.
- **Tasks:**
  - **Refine Pills:** Update Status pills (Pending, Delivered) to use Transparent backgrounds with Colored Borders/Text, rather than solid pastel blocks.
  - **Refine Buttons:** Ensure "Create Manual Order" is prominent (Primary Blue) and secondary buttons are clearly visible.

## 4. Acceptance Criteria
- No "White" containers visible on any dark page.
- All text is legible (High contrast).
- Primary Blue (`#1D9BF0`) is used for key actions and data visualization.
- Fonts match the spec (`Open Sans`, `Georgia`).
