# PRD: Light Mode UI Polish & Aesthetic Upgrade

## Introduction
This PRD addresses visual inconsistencies and potential aesthetic improvements for the Light Mode of the UCCP Admin Dashboard. Based on visual analysis of the current interface, we aim to elevate the design from "functional" to "premium and distinctive," fixing specific layout artifacts and refining component detailing.

## Goals
- **Fix Visual Artifacts**: Resolve the scaling/rendering issue in the Sales Overview chart (the large black bar).
- **Elevate Component Aesthetics**: Upgrade Metric Cards, Status Pills, and Review Lists to match a premium design system.
- **Refine Typography & Spacing**: Ensure consistent and readable type hierarchies in tables and forms.
- **Remove Placeholders**: eliminate visible "placeholder" text from production UI.
- **Establish Visual Hierarchy**: Consolidate action buttons and dropdowns to follow a strict primary/secondary/tertiary pattern.
- **Standardize Brand Palette**: Eliminate the "rainbow" of primary action colors (Green, Blue, Purple, Black).

## User Stories

### US-901: Refine Dashboard Charts & Metrics
**Description:** As a user, I want the dashboard to look professional and data-rich, without visual glitches or generic card styling.
**Acceptance Criteria:**
- [ ] Fix "Sales Overview" chart to handle outlier data gracefully or fix styling of the current "black bar" artifact.
- [ ] Redesign Metric Cards (Revenue, Orders, etc.) with refined typography and potentially softer shadows or distinct border treatments.
- [ ] Ensure icons in cards are sized and colored harmoniously with the theme.
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-902: Polish Customer Reviews Section
**Description:** As a user, I want to view customer feedback in a layout that feels curated, removing debug text.
**Acceptance Criteria:**
- [ ] Remove "(placeholder)" text from "Showing recent orders" label.
- [ ] Redesign Customer Review cards for better information hierarchy (Reviewer Name, Rating, Content).
- [ ] Style the "View Order" link to be more integrated (e.g., subtle button or refined link style).
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-903: Upgrade Table Status Pills & Typography
**Description:** As a user, I want data tables to be easy to scan, with status indicators that look refined rather than generic.
**Acceptance Criteria:**
- [ ] Redesign "Status" pills (currently simple green capsules) to a more subtle design (e.g., transparent background with colored dot and border, or soft pastel background).
- [ ] Adjust table row height and typography for better readability.
- [ ] Ensure currency formatting in the Product list is visualy consistent (addressing the alignment of small vs large numbers).
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-904: Polish Input Forms (Products)
**Description:** As a user, I want forms to feel responsive and high-quality.
**Acceptance Criteria:**
- [ ] Enhance "Create Product" form inputs with better focus states and distinct borders/backgrounds.
- [ ] Clarify the "URL-friendly ID" field state (if disabled, make it look intentionally read-only, not just "washed out").
- [ ] Improve form section grouping (Basic Information) with better whitespace or subtle dividers.
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-905: Order Action Button Hierarchy
**Description:** As a user, I want the actions on the order page to follow a clear hierarchy so I don't face a wall of rainbow buttons.
**Acceptance Criteria:**
- [ ] Standardize button colors: Define strict Primary (e.g., Black/Blue), Secondary (Outline), and Destructive (Red) styles.
- [ ] Refactor the Order Details button row: "Create Another Order" (Secondary), "Repeat Order" (Secondary), "Mark Paid" (Primary), "Cancel Order" (Destructive/Ghost).
- [ ] Ensure the "Pending" status badge is visually distinct from clickable buttons.
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-906: Product Variant Card Polish
**Description:** As a user, I want variant cards to be clean and easy to scan, without overlapping badges.
**Acceptance Criteria:**
- [ ] Redesign Variant Cards to clearly separate "Stock Count" from "In Stock" status (or combine them elegantly).
- [ ] Improve the "No Image" placeholder to be subtler (e.g., soft icon instead of dashed box).
- [ ] Align actions (Edit/Delete) consistently at the bottom.
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-907: Rich Product Selector
**Description:** As a user, I want to see structured info when selecting a product, not a chaotic text string.
**Acceptance Criteria:**
- [ ] Replace the native/text-heavy product select dropdown with a rich UI component (Combobox or Custom Select).
- [ ] Display Product Name, Variant Name, Price, and Stock in structured columns or a clean grid layout within the dropdown item.
- [ ] Handle long variant names gracefully (truncate or wrap).
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-908: Unified Status/Filter Dropdowns
**Description:** As a user, I want filter menus to feel part of the premium app, not default browser controls.
**Acceptance Criteria:**
- [ ] Implement a custom Select/Dropdown component for "Status" filters that matches the production design system.
- [ ] Ensure hover states on dropdown items are distinct (e.g., soft gray background + colored text).
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-909: Modal UX & Aesthetics Polish
**Description:** As a user, I want modals to feel like a cohesive part of the app, not a browser default popup.
**Acceptance Criteria:**
- [ ] Apply custom styling to modal scrollbars (slim, matching theme color) to remove the default "grey block" look.
- [ ] Refactor "Add Items" row: Make the "Add" button same height as input, possibly integrated or placed more prominently.
- [ ] Ensure modal titles ("Create Manual Order") use the premium font stack and correct weight.
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-910: Refine 'Top Customers' Card
**Description:** As a user, I want the "Gold/VIP" section to look premium, not like a yellow sticky note.
**Acceptance Criteria:**
- [ ] Tone down the #FEF9C3 background to a subtle "Gold Tint" (e.g., extremely light cream with gold border accent) or a gradient.
- [ ] Refine the "Show 5/10/20" toggle to be a subtle segment control or ghost buttons, removing the heavy orange pill styling.
- [ ] Ensure text contrast on the lighter background meets accessibility standards.
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-911: Standardize Global Primary Color
**Description:** As a user, I want to know exactly which button is the "Primary" action without guessing between Green, Blue, Purple, and Black.
**Acceptance Criteria:**
- [ ] Define **one** brand color for Primary Actions (**Vivid Blue / Twitter Blue**) based on reference themes.
- [ ] Use **Solid Black** as a Secondary Strong accent (for "Set Goal" or key tags).
- [ ] Convert "Place Order" (Green) -> Blue.
- [ ] Convert "Mark Paid" (Blue) -> Blue.
- [ ] Convert "Create Another Order" (Purple) -> Secondary/Ghost.
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-912: Customer Detail Action & Card Polish
**Description:** As a user, I want the customer detail page to be easy to read and action, without clashing colors.
**Acceptance Criteria:**
- [ ] Group Header Buttons: Make "Chat" and "Call" secondary/ghost icon buttons.
- [ ] Format Phone Numbers: Apply a display formatter to phone strings (e.g., (024) 563-12546).
- [ ] Enforce Name Capitalization: "patric" -> "Patric".
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-913: Metric Card Visual Weight
**Description:** As a user, I want metric cards to feel solid and substantial, not just outlined boxes.
**Acceptance Criteria:**
- [ ] Add subtle background fills (e.g., bg-purple-50, bg-green-50) to the "Total Orders" and "Lifetime Value" cards to match their border colors.
- [ ] Ensure text contrast remains high on these backgrounds.
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-914: Table Navigation & Avatar Polish
**Description:** As a user, I want tables to look clean and professional.
**Acceptance Criteria:**
- [ ] Replace text-based "View >" links with a subtle Icon Button (Chevron Right or Eye icon) or a hover-row click interaction.
- [ ] Fix Avatar Alignment: Ensure the "Customer" header aligns with the content.
- [ ] Refine Avatar Fallbacks: Ensure 2-letter initials are centered and colors are harmonious (not random bright purple alongside gold badges).
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-915: Order Header Layout Fix
**Description:** As a user, I want the order header to clearly display the ID without breaking layout or looking broken.
**Acceptance Criteria:**
- [ ] Fix Title Wrapping: Ensure "ORD-XXX-XXX" stays on one line or breaks gracefully.
- [ ] Fix Button Row Layout: Ensure buttons flow correctly next to the title or in a unified toolbar.
- [ ] Refine "Payment: Pending" badge/text to be more legible/status-like.
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-916: Repeat Order Modal Polish
**Description:** As a user, I want the repeat order verification state to look intentional, not like a debug box.
**Acceptance Criteria:**
- [ ] Redesign "Customer" verification box: Remove the "dashed yellow border". Use a clean gray/blue background for the read-only customer info.
- [ ] Format customer data inside the modal (Name Casing, Phone ID).
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-917: Inventory Page Polish
**Description:** As a user, I want the inventory header to look cohesive with the rest of the app.
**Acceptance Criteria:**
- [ ] Fix "Low Stock Only" button: Remove the thick black border/yellow text combo. Use a subtle toggle or standard secondary button style.
- [ ] Fix Subtitle Spelling: "dsd" -> "Dsd" (or remove if debug).
- [ ] Fix Header Spacing: Reduce the excessive gap between title/subtitle and the filter button.
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-918: Sidebar Navigation Polish
**Description:** As a user, I want the sidebar to feel like a modern app navigation, matching the Twitter Theme reference.
**Acceptance Criteria:**
- [ ] Update Active State: Use a rounded pill shape with **Vivid Blue** background and white text used in reference images.
- [ ] Refine Typography: Use clean, bold/medium weights for nav items.
- [ ] Ensure icons are aligned and sized consistently.
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-919: Chat & Input Polish
**Description:** As a user, I want forms and chat interfaces to look premium and match the reference theme.
**Acceptance Criteria:**
- [ ] Style Text Inputs: Use subtle gray borders, rounded corners, and clear focus rings (Blue).
- [ ] Style Chat Bubbles: Adopt the "Gray (Incoming) / Blue (Outgoing)" color scheme from reference.
- [ ] Style Radio/Checkbox: Use custom Blue accent color.
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements
- FR-1: Chart component must auto-scale or cap bars to prevent layout domination.
- FR-2: Status component must support variants (Active, Archive, Draft) with distinct visual styles.
- FR-3: Button component must enforce hierarchy props (variant="primary" | "secondary" | "destructive") and map to the unified palette.

## Design Considerations
- **Aesthetic**: Premium, Clean, "Refined". Light mode should feel airy but structured.
- **Typography**: Use the project's premium font stack.
- **Interactions**: Dropdowns and buttons should have immediate, snappy hover/active states.

## Success Metrics
- Visual consistency across all 25+ provided screens.
- Standardization of Primary Action buttons.
- Improved Modal interaction and polish.

### US-920: Fix Modal & Sidebar White Backgrounds (Dark Mode)
**Description:** As a user, I want all modals and sidebars to be dark in dark mode to match the theme.
**Acceptance Criteria:**
- [ ] Fix 'Edit Variant' modal header and footer white background (use `bg-card` or themed background).
- [ ] Fix 'Variants' sidebar cards white background.
- [ ] Fix 'Activity Log' cards white background.
- [ ] Fix 'Create Another Order' button style in Order Detail (already addressed, but verify).
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill
