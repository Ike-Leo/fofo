# PRD: Phase 9 - Responsive & Mobile Polish

## Description
This phase focuses on making the admin dashboard and public pages fully responsive and mobile-friendly. The current deployment shows issues with layouts breaking on smaller screens. We will apply "Twitter Dark Mode" aesthetic adaptations for mobile, ensuring a seamless experience across devices.

## User Stories

### US-950: Responsive Sidebar & Navigation
**As a mobile user, I want to navigate the app without the desktop sidebar taking up the whole screen.**
- [ ] Implement a collapsible sidebar or hamburger menu for mobile (< 768px).
- [ ] Ensure the navigation is accessible via a top bar or bottom bar on mobile.
- [ ] Verify `AdminHeader` adjusts its padding/layout for mobile.

### US-951: Mobile Dashboard Layout
**As a mobile user, I want to see key metrics and charts without horizontal scrolling or squashed elements.**
- [ ] Change Dashboard Grid from 4 columns to 1 column on mobile.
- [ ] Stack "Sales Overview" and "Recent Orders" vertically.
- [ ] Ensure "Customer Reviews" cards stack properly.

### US-952: Responsive Data Tables (Orders, Products, Customers)
**As a mobile user, I want to view data tables without breaking the layout.**
- [ ] Add horizontal scroll wrappers to all Data Tables (Orders, Products, Inventory, Customers).
- [ ] Alternatively, implement a "Card View" for mobile rows if possible (or just scroll for now).
- [ ] Ensure "Status" pills and "Action" buttons remain accessible.

### US-953: Product Detail Mobile Optimization
**As a mobile user, I want to edit products and view details on my phone.**
- [ ] Stack the 2/3 + 1/3 column layout to single column on mobile.
- [ ] Ensure `ProductForm` inputs span full width.
- [ ] Make "Variants" and "Activity Log" sidebars stack below the main form.

### US-954: Mobile Modals & Overlays
**As a mobile user, I want modals to fit on my screen.**
- [ ] Ensure `Dialog`/`Modal` max-width adjusts to `w-full` or `max-w-[95vw]` on mobile.
- [ ] Fix "Create Order" and "Edit Variant" modal heights to handle soft keyboards (avoid overflow hidden issues).

### US-955: Touch Targets & Typography
**As a mobile user, I want buttons to be easily tappable.**
- [ ] Ensure all action buttons are at least 44px height/width on touch.
- [ ] Adjust H1/H2 font sizes on mobile to prevent massive headers taking up screen space.
