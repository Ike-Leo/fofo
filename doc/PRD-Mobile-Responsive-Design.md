# PRD: Mobile-First Responsive Design for UCCP Platform

**Document Version:** 1.0
**Date:** January 18, 2026
**Project:** UCCP (Universal Commerce Control Platform)
**Priority:** High

---

## Executive Summary

This PRD outlines the comprehensive mobile-first responsive design initiative for the UCCP e-commerce platform. The project aims to deliver an optimal mobile user experience across all admin and storefront pages, ensuring proper touch targets, readable typography, flexible layouts, and mobile-specific interactions.

**Key Objectives:**
- Achieve 100% mobile responsiveness across all pages
- Implement mobile-first design principles
- Create reusable mobile-optimized UI component library
- Add mobile-specific features (bottom navigation, bottom sheets, pull-to-refresh)
- Ensure Lighthouse mobile score >90
- Prioritize Admin Dashboard improvements

---

## Business Context

### Current State
- Platform has basic responsive implementation with inconsistent patterns
- Tables use `min-w-[600px]` causing horizontal scroll on mobile
- Fixed padding values (p-8, p-12) not optimized for mobile screens
- Text sizes not scaled appropriately for mobile devices
- Buttons and inputs lack mobile touch optimizations
- Modals not optimized for small screens
- Hero sections use fixed heights causing viewport issues

### Target State
- Fully responsive mobile-first experience
- Touch-friendly interface with 44x44px minimum touch targets
- Adaptive layouts that work seamlessly from 320px to 1536px+
- Mobile-specific interactions and navigation patterns
- Consistent design system across all breakpoints
- Performance-optimized mobile experience

### Success Metrics
- **Mobile Usability:** 100% of pages accessible without horizontal scroll
- **Touch Compliance:** 100% of buttons meet 44x44px minimum
- **Performance:** Lighthouse mobile score >90
- **Accessibility:** WCAG 2.1 AA compliance on mobile
- **User Satisfaction:** Mobile task completion rate >85%

---

## Technical Requirements

### Tech Stack
- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS 4.1.17
- **State:** Zustand + Convex
- **Deployment:** Netlify (configured)

### Breakpoint Strategy
```css
Mobile-First Approach:
- Mobile: 0px (default, no prefix)
- Small (sm): 640px
- Medium (md): 768px
- Large (lg): 1024px
- XL (xl): 1280px
- 2XL (2xl): 1536px
```

### Design System Specifications

#### Mobile Spacing System
```css
Page padding:    p-4 (mobile) → p-6 (sm) → p-8 (lg)
Card padding:    p-4 (mobile) → p-6 (md)
Gap spacing:     gap-3 (mobile) → gap-6 (md)
Section margin:  mb-6/8 (mobile) → mb-12 (lg)
```

#### Typography Scale (Mobile-First)
```css
Headings:
- H1: text-2xl (mobile) → text-3xl (sm) → text-4xl/5xl (lg)
- H2: text-xl (mobile) → text-2xl (sm) → text-3xl (lg)
- H3: text-lg (mobile) → text-xl (md)

Body:
- Base: text-sm (mobile) → text-base (md)
- Small: text-xs (mobile) → text-sm (md)
- Lead: text-base (mobile) → text-lg (md)
```

#### Touch Target Requirements
```css
Minimum touch target size: 44x44px (iOS) / 48x48px (Android)
Buttons: min-h-[44px] on mobile
Icon buttons: p-3 (44px with 18px icon)
Links: py-2 px-4 minimum
Form inputs: min-h-[44px]
```

---

## Functional Requirements

### Phase 1: Foundation (Critical)

#### 1.1 Global Styles (`app/globals.css`)

**Requirements:**
- Add safe area insets for notched devices (iPhone X+)
- Prevent text zoom on input focus (iOS)
- Implement smooth scrolling
- Add touch feedback utilities
- Create scrollbar hide utility
- Add mobile-specific animations (slide-up, bottom sheet)

**Acceptance Criteria:**
- [ ] Safe area insets work on notched devices
- [ ] Input fields don't cause page zoom on iOS
- [ ] Smooth scrolling enabled across all pages
- [ ] Touch feedback visible on all interactive elements
- [ ] Scrollbar can be hidden when needed
- [ ] Slide-up and bottom sheet animations smooth (60fps)

#### 1.2 Reusable UI Components (`components/ui/`)

**Components to Create:**

##### 1.2.1 Button Component (`Button.tsx`)
**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth?: boolean`
- `disabled?: boolean`
- `loading?: boolean`
- `icon?: ReactNode`
- `children: ReactNode`

**Requirements:**
- Minimum height 44px on mobile
- Touch-friendly active states
- Loading state with spinner
- Icon support (left or right)
- Full-width option for mobile CTAs
- Hover states disabled on touch devices

**Acceptance Criteria:**
- [ ] All variants render correctly
- [ ] Touch targets ≥44x44px on mobile
- [ ] Loading state displays spinner
- [ ] Disabled state visually clear
- [ ] Icon positioning works (left/right)
- [ ] Full-width works on mobile

##### 1.2.2 Input Component (`Input.tsx`)
**Props:**
- `type?: 'text' | 'email' | 'number' | 'tel' | 'url'`
- `label?: string`
- `placeholder?: string`
- `error?: string`
- `helperText?: string`
- `required?: boolean`
- `disabled?: boolean`
- `fullWidth?: boolean`

**Requirements:**
- Minimum height 48px on mobile (16px font to prevent zoom)
- Proper `inputMode` attributes for mobile keyboards
- AutoComplete support
- Floating label or top label
- Error state with red border and message
- Helper text below input
- Focus states with ring

**Acceptance Criteria:**
- [ ] Height ≥48px on mobile
- [ ] No zoom on focus (iOS)
- [ ] Correct keyboard type appears for each input type
- [ ] AutoComplete suggestions work
- [ ] Error state visible and clear
- [ ] Helper text displays correctly
- [ ] Focus ring visible on all states

##### 1.2.3 Card Component (`Card.tsx`)
**Props:**
- `children: ReactNode`
- `padding?: 'none' | 'sm' | 'md' | 'lg'`
- `hoverable?: boolean`
- `clickable?: boolean`
- `onClick?: () => void`
- `className?: string`

**Requirements:**
- Responsive padding based on size prop
- Hover effects only on non-touch devices
- Touch feedback on tap
- Optional shadow on hover
- Border radius consistent with design system

**Acceptance Criteria:**
- [ ] Padding variants work correctly
- [ ] Hover state works on desktop
- [ ] Touch feedback works on mobile
- [ ] Clickable card acts as button
- [ ] No hover effects on touch devices

##### 1.2.4 Table Component (`Table.tsx`)
**Props:**
- `columns: TableColumn[]`
- `data: TableRow[]`
- `onRowClick?: (row: TableRow) => void`
- `loading?: boolean`
- `empty?: ReactNode`

**Requirements:**
- **CRITICAL:** Automatically converts to card layout on mobile (<768px)
- Horizontal scroll indicator on desktop
- Sticky header on long lists
- Sortable columns (optional)
- Loading skeleton
- Empty state with message
- Responsive pagination

**Mobile Card Layout Behavior:**
- Each row becomes a card
- Column headers become field labels
- Actions move to bottom
- Critical info shows first
- Tap card to expand/show details

**Acceptance Criteria:**
- [ ] Table layout on desktop (≥768px)
- [ ] Card layout on mobile (<768px)
- [ ] Horizontal scroll on desktop with indicator
- [ ] Sticky header works on long tables
- [ ] Loading skeleton displays correctly
- [ ] Empty state shows when no data
- [ ] Row click works on both layouts

##### 1.2.5 Modal Component (`Modal.tsx`)
**Props:**
- `open: boolean`
- `onClose: () => void`
- `title?: string`
- `children: ReactNode`
- `size?: 'sm' | 'md' | 'lg' | 'full'`
- `showClose?: boolean`

**Requirements:**
- **CRITICAL:** Bottom sheet/full-screen on mobile (<768px)
- Centered modal on desktop (≥768px)
- Backdrop with blur effect
- Close on backdrop click (desktop)
- Close on escape key
- Swipe down to close (mobile)
- Safe area insets on mobile
- Smooth open/close animations

**Mobile Behavior:**
- Full screen with rounded top corners
- Swipe handle at top
- Scrollable content if needed
- Close button top-right
- Safe area padding at bottom

**Acceptance Criteria:**
- [ ] Bottom sheet on mobile, centered modal on desktop
- [ ] Backdrop visible with blur
- [ ] Close on backdrop click (desktop)
- [ ] Close on escape key
- [ ] Swipe down to close (mobile)
- [ ] Safe area insets respected
- [ ] Animations smooth (60fps)
- [ ] Content scrollable when needed

##### 1.2.6 Badge Component (`Badge.tsx`)
**Props:**
- `children: ReactNode`
- `variant?: 'default' | 'success' | 'warning' | 'error' | 'info'`
- `size?: 'sm' | 'md'`
- `dot?: boolean`

**Requirements:**
- Responsive sizing
- Color-coded variants
- Optional dot indicator
- Truncate long text
- Minimum touch target if clickable

**Acceptance Criteria:**
- [ ] All variants render correctly
- [ ] Size variants work
- [ ] Dot indicator visible
- [ ] Long text truncates with ellipsis
- [ ] Touch target ≥44px if clickable

---

### Phase 2: Admin Dashboard (Priority)

#### 2.1 Admin Header (`components/AdminHeader.tsx`)

**Current Issues:**
- Mobile menu needs optimization
- Touch targets could be larger
- Organization switcher cramped on mobile

**Requirements:**
- Enhance mobile menu with backdrop blur
- Increase touch targets to minimum 48px
- Improve organization switcher on mobile
- Add safe area padding for notched devices
- Smooth slide-in animation for menu
- Close menu on link click

**Changes:**
- Mobile menu items: min-h-[48px]
- Menu overlay: backdrop-blur-xl
- Close button: larger touch target
- Organization switcher: full-width on mobile

**Acceptance Criteria:**
- [ ] Mobile menu items ≥48px height
- [ ] Backdrop blur visible on menu overlay
- [ ] Menu closes when link tapped
- [ ] Organization switcher usable on mobile
- [ ] Safe area padding on notched devices
- [ ] Smooth slide-in animation

#### 2.2 Admin Dashboard (`app/admin/page.tsx`)

**Current Issues:**
- KPI cards not optimized for mobile
- Chart height not responsive
- Customer reviews widget cramped

**Requirements:**
- KPI cards: 1 column (mobile) → 2 (sm) → 4 (lg)
- Chart responsive height: h-64 (mobile) → h-80 (md) → h-96 (lg)
- Customer reviews widget stacked vertically
- Touch-optimized chart tooltips
- Responsive spacing

**Changes:**
```tsx
// KPI Grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

// Chart Container
<div className="h-64 sm:h-80 lg:h-96 w-full">

// Customer Reviews
- Stack vertically on mobile
- Larger card spacing
- Responsive avatar sizes
```

**Acceptance Criteria:**
- [ ] KPI cards stack correctly on mobile
- [ ] Chart fits within viewport on mobile
- [ ] Chart tooltips touch-friendly
- [ ] Customer reviews readable on mobile
- [ ] No horizontal scroll on any screen size

#### 2.3 Products Page (`app/admin/products/page.tsx`)

**Current Issues:**
- Table causes horizontal scroll on mobile
- Action buttons cramped
- Status badges not optimized

**Requirements:**
- **CRITICAL:** Convert table to card layout on mobile (<768px)
- Use new Table component
- Stack action buttons vertically on mobile
- Optimize status badges for mobile
- Add search bar full-width on mobile

**Implementation:**
```tsx
{/* Mobile: Card layout */}
<div className="sm:hidden space-y-4">
  {products.map((product) => (
    <Card key={product._id} className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-muted-foreground">
            {product.description}
          </p>
        </div>
        <Badge variant={getStatusVariant(product.status)}>
          {product.status}
        </Badge>
      </div>
      <div className="mt-4 flex justify-between items-center text-sm">
        <span className="font-mono">{formatCurrency(product.price)}</span>
        <span>{product.variantCount} variants</span>
      </div>
      <Link
        href={`/admin/products/${product._id}`}
        className="mt-4 block w-full"
      >
        <Button variant="primary" fullWidth>View Details</Button>
      </Link>
    </Card>
  ))}
</div>

{/* Desktop: Table layout */}
<div className="hidden sm:block">
  <Table columns={columns} data={products} />
</div>
```

**Acceptance Criteria:**
- [ ] Card layout on mobile (<768px)
- [ ] Table layout on desktop (≥768px)
- [ ] All product info visible on mobile
- [ ] "View Details" button works
- [ ] Status badges clear and readable
- [ ] No horizontal scroll on mobile

#### 2.4 Inventory Page (`app/admin/inventory/page.tsx`)

**Current Issues:**
- Table causes horizontal scroll
- Search bar not full-width on mobile
- Filter buttons cramped
- Adjustment modal not mobile-optimized

**Requirements:**
- **CRITICAL:** Table → card layout on mobile
- Search bar full-width on mobile
- Status filter: horizontal scroll on mobile
- Adjustment modal: full-screen with bottom sheet on mobile
- Stock level visual indicator (progress bar)
- Stack search and filters vertically on mobile

**Implementation:**

Search & Filters:
```tsx
<div className="flex flex-col gap-4">
  {/* Search - full width on mobile */}
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
    <Input
      type="text"
      placeholder="Search..."
      fullWidth
      className="pl-10"
    />
  </div>

  {/* Status filter - horizontally scrollable on mobile */}
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
    {filters.map((filter) => (
      <button
        key={filter.value}
        className="whitespace-nowrap px-4 py-2 min-h-[44px]"
      >
        {filter.label}
      </button>
    ))}
  </div>
</div>
```

Mobile Cards:
```tsx
<div className="sm:hidden space-y-4">
  {filteredInventory.map((item) => (
    <Card key={item._id}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-muted rounded-xl">
          {item.images ? (
            <img src={item.images} alt="" />
          ) : (
            <Package className="w-6 h-6 m-3" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{item.productName}</h3>
          <p className="text-sm text-muted-foreground">{item.variantName}</p>
        </div>
      </div>

      {/* Stock level indicator */}
      <div className="mt-3">
        <div className="flex justify-between text-sm mb-1">
          <span>Stock Level</span>
          <span className="font-mono font-bold">{item.stock}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${
              item.stock === 0 ? 'bg-red-500' :
              item.stock <= 10 ? 'bg-amber-500' :
              'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(item.stock / 50 * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Button variant="primary" fullWidth onClick={() => adjustStock(item)}>
          Adjust Stock
        </Button>
      </div>
    </Card>
  ))}
</div>
```

Adjustment Modal (Mobile Bottom Sheet):
```tsx
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

  <div className="relative bg-background w-full sm:max-w-md rounded-t-2xl sm:rounded-xl max-h-[90vh] overflow-y-auto animate-slide-up">
    {/* Swipe handle for mobile */}
    <div className="flex justify-center pt-3 pb-1 sm:hidden">
      <div className="w-12 h-1.5 bg-muted rounded-full" />
    </div>

    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Adjust Stock</h3>
        <button onClick={onClose} className="p-2">
          <X size={20} />
        </button>
      </div>

      {/* Form content */}
    </div>
  </div>
</div>
```

**Acceptance Criteria:**
- [ ] Card layout on mobile (<768px)
- [ ] Search bar full-width on mobile
- [ ] Status filters horizontally scrollable with visual indicator
- [ ] Stock level progress bar visible
- [ ] Adjustment modal full-screen with bottom sheet on mobile
- [ ] Swipe handle visible on mobile modal
- [ ] No horizontal scroll

#### 2.5 Product Form (`components/ProductForm.tsx`)

**Current Issues:**
- Form fields not stacked on mobile
- Image grid not optimized
- Image upload buttons too small

**Requirements:**
- Stack all form fields vertically on mobile
- Image grid: 2 cols (mobile) → 3 (sm) → 6 (lg)
- Use new Input and Button components
- Touch-friendly image upload (44x44px minimum)
- Responsive labels

**Implementation:**
```tsx
{/* Image grid */}
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
  {images.map((url, index) => (
    <button
      key={index}
      onClick={() => triggerUpload(index)}
      className="aspect-square rounded-xl border-2 border-dashed min-h-[80px]"
    >
      {url ? (
        <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
      ) : (
        <div className="flex items-center justify-center">
          <Upload size={24} />
        </div>
      )}
    </button>
  ))}
</div>

{/* Form fields - stacked on mobile */}
<div className="space-y-4">
  <Input
    label="Product Name"
    type="text"
    value={formData.name}
    onChange={(e) => setFormData({...formData, name: e.target.value})}
    required
    fullWidth
  />

  <Input
    label="Slug"
    type="text"
    value={formData.slug}
    onChange={(e) => setFormData({...formData, slug: e.target.value})}
    required
    fullWidth
  />

  {/* All fields stacked vertically */}
</div>
```

**Acceptance Criteria:**
- [ ] All form fields stacked vertically on mobile
- [ ] Image grid responsive: 2 → 3 → 6 columns
- [ ] Image upload buttons ≥80x80px
- [ ] Input fields use new Input component
- [ ] Labels clear and readable
- [ ] No horizontal scroll on mobile

#### 2.6 Other Admin Pages

**Orders Page** (`app/admin/orders/page.tsx`)
- Card layout on mobile
- Show critical info first (status, total, date)
- Tap to expand order details
- Status badges prominent

**Customers Page** (`app/admin/customers/page.tsx`)
- List view with avatar on mobile
- Tap to view customer details
- Swipe actions for quick actions (future)

**Categories Page** (`app/admin/categories/page.tsx`)
- Responsive grid: 1 → 2 → 3 columns
- Card-based layout
- Edit/delete actions accessible

**Team Page** (`app/admin/team/page.tsx`)
- Stacked layout on mobile
- Member cards with avatar
- Role badges prominent

---

### Phase 3: Storefront (with All Mobile Features)

#### 3.1 Store Header (`components/store/StoreHeader.tsx`)

**Current Issues:**
- No mobile menu
- "Shop All" link hidden on mobile
- Cart button touch target small

**Requirements:**
- Add mobile menu toggle
- Show "Shop All" in mobile menu
- Cart button with larger touch target (48x48px)
- Safe area insets
- Smooth menu animation

**Implementation:**
```tsx
<header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4">
  <div className="flex items-center justify-between">
    {/* Mobile menu button */}
    <button
      className="sm:hidden p-2 -ml-2 min-h-[44px] min-w-[44px]"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    >
      {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>

    {/* Logo */}
    <Link href={`/store/${slug}`} className="text-xl font-bold">
      {slug}
    </Link>

    {/* Cart button - larger touch target */}
    <button
      onClick={toggleCart}
      className="p-3 min-w-[48px] min-h-[48px] relative"
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute top-1 right-1 w-5 h-5 bg-primary text-white text-xs font-bold flex items-center justify-center rounded-full">
          {itemCount}
        </span>
      )}
    </button>
  </div>

  {/* Mobile menu */}
  {mobileMenuOpen && (
    <nav className="sm:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border">
      <Link
        href={`/store/${slug}/products`}
        className="block px-4 py-4 min-h-[56px]"
        onClick={() => setMobileMenuOpen(false)}
      >
        Shop All
      </Link>
    </nav>
  )}
</header>
```

**Acceptance Criteria:**
- [ ] Mobile menu button visible (<768px)
- [ ] Cart button ≥48x48px
- [ ] "Shop All" in mobile menu
- [ ] Menu closes on link tap
- [ ] Safe area insets respected
- [ ] Smooth animation

#### 3.2 Store Homepage (`app/store/[slug]/page.tsx`)

**Current Issues:**
- Hero height fixed at 85vh (too tall on mobile)
- Typography not scaled
- Featured section cramped

**Requirements:**
- Hero: min-h-[100vh] (mobile) → h-[85vh] (desktop)
- Responsive typography scaling
- Stack featured section vertically
- Optimize CTA button for mobile

**Implementation:**
```tsx
{/* Hero Section */}
<section className="relative min-h-[100vh] md:h-[85vh] flex items-center justify-center">
  <div className="px-6 max-w-5xl mx-auto space-y-6 sm:space-y-8">
    {/* Badge */}
    <span className="text-xs sm:text-sm px-4 py-1.5">
      Season Collection 2026
    </span>

    {/* Heading */}
    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black">
      {slug.toUpperCase()}
    </h1>

    {/* Description */}
    <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
      The universal commerce experience...
    </p>

    {/* CTA */}
    <Link
      href={`/store/${slug}/products`}
      className="inline-flex h-12 px-8 sm:h-14 sm:px-10"
    >
      Shop Now
    </Link>
  </div>
</section>

{/* Featured Section */}
<section className="py-16 sm:py-24">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
      <div className="space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold">
          Crafted for Excellence.
        </h2>
        <p className="text-base sm:text-lg">
          Our platform empowers businesses...
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="aspect-[3/4] rounded-2xl overflow-hidden" />
        <div className="aspect-[3/4] rounded-2xl overflow-hidden mt-0 sm:mt-12" />
      </div>
    </div>
  </div>
</section>
```

**Acceptance Criteria:**
- [ ] Hero fits viewport on mobile
- [ ] Typography scales appropriately
- [ ] CTA button touch-friendly
- [ ] Featured section stacks vertically
- [ ] Images optimized for mobile
- [ ] No horizontal scroll

#### 3.3 Product Grid (`components/store/ProductGrid.tsx`)

**Current State:** Already has good responsive grid

**Minor Improvements:**
- Ensure touch targets meet minimum
- Optimize badge positioning on mobile
- Improve card tap feedback

**Acceptance Criteria:**
- [ ] Grid: 1 → 2 → 3 → 4 columns
- [ ] Cards tappable with 44x44px minimum
- [ ] Badges positioned correctly
- [ ] Touch feedback visible

#### 3.4 Cart Drawer (`components/store/CartDrawer.tsx`)

**Current Issues:**
- Quantity controls too small
- Swipe gesture not obvious

**Requirements:**
- Larger quantity controls (40px minimum)
- Full-width checkout button
- Swipe gesture hint (animation)
- Improve empty state

**Implementation:**
```tsx
{/* Quantity controls */}
<div className="flex items-center border border-border rounded-lg">
  <button className="p-2 min-w-[40px] min-h-[40px]">
    <Minus className="w-4 h-4" />
  </button>
  <span className="w-8 text-center">{item.quantity}</span>
  <button className="p-2 min-w-[40px] min-h-[40px]">
    <Plus className="w-4 h-4" />
  </button>
</div>

{/* Swipe hint - show on first open */}
{showSwipeHint && (
  <div className="absolute top-1/2 left-4 transform -translate-y-1/2 animate-pulse">
    <ChevronRight size={24} className="text-muted-foreground" />
  </div>
)}

{/* Checkout button */}
<Link
  href={`/store/${slug}/checkout`}
  className="w-full h-12 sm:h-14 min-h-[48px] flex items-center justify-center"
>
  Checkout
</Link>
```

**Acceptance Criteria:**
- [ ] Quantity controls ≥40x40px
- [ ] Checkout button ≥48px height
- [ ] Swipe hint shown on first open
- [ ] Empty state optimized for mobile
- [ ] All actions accessible

#### 3.5 Checkout Form (`components/store/CheckoutForm.tsx`)

**Current Issues:**
- Form fields not stacked
- Missing mobile input types
- Button not full-width

**Requirements:**
- Stack all fields vertically on mobile
- Add mobile-specific input types
- Use new Input components
- Full-width submit button
- Optimize payment element for mobile

**Implementation:**
```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Contact Information */}
  <div className="bg-white p-4 sm:p-6 rounded-xl">
    <h3 className="font-semibold pb-2">Contact Information</h3>
    <div className="space-y-4">
      <Input
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        required
        fullWidth
      />
      <Input
        label="Full Name"
        type="text"
        autoComplete="name"
        value={name}
        onChange={setName}
        required
        fullWidth
      />
      <Input
        label="Shipping Address"
        type="text"
        autoComplete="street-address"
        value={address}
        onChange={setAddress}
        placeholder="123 Main St, City, Country"
        required
        fullWidth
      />
    </div>
  </div>

  {/* Payment */}
  <div className="bg-white p-4 sm:p-6 rounded-xl">
    <h3 className="font-semibold pb-2 flex items-center gap-2">
      <Lock className="w-4 h-4" />
      Payment Details
    </h3>
    <PaymentElement />
  </div>

  {/* Submit Button */}
  <button
    disabled={!stripe || isProcessing}
    className="w-full h-12 sm:h-14 min-h-[48px] flex items-center justify-center gap-2"
  >
    {isProcessing ? (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        Processing...
      </>
    ) : (
      <>
        <CheckCircle className="w-5 h-5" />
        Pay & Complete Order
      </>
    )}
  </button>
</form>
```

**Acceptance Criteria:**
- [ ] All fields stacked vertically
- [ ] Mobile keyboards optimized (inputMode)
- [ ] AutoComplete suggestions work
- [ ] Submit button full-width ≥48px
- [ ] Payment element usable on mobile
- [ ] Errors clear and readable

#### 3.6 Mobile Bottom Navigation (NEW)

**Requirements:**
- Fixed bottom navigation for storefront
- Home, Products, Cart tabs
- Only visible on mobile (<768px)
- Safe area padding at bottom
- Active state highlighting
- Smooth transitions

**Implementation:**
```tsx
// components/store/MobileBottomNav.tsx
export function MobileBottomNav() {
  const params = useParams();
  const slug = params.slug as string;
  const pathname = usePathname();
  const { toggleCart, sessionId } = useCartStore();

  const cart = useQuery(api.public.cart.get, sessionId ? { sessionId } : "skip");
  const itemCount = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  const isActive = (path: string) => pathname?.includes(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border pb-safe sm:hidden">
      <div className="flex justify-around items-center h-16">
        <Link
          href={`/store/${slug}`}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('') && !isActive('/products') && !isActive('/product/') && !isActive('/checkout') && !isActive('/order/')
              ? 'text-primary'
              : 'text-muted-foreground'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          href={`/store/${slug}/products`}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/products')
              ? 'text-primary'
              : 'text-muted-foreground'
          }`}
        >
          <Package className="w-6 h-6" />
          <span className="text-xs mt-1">Products</span>
        </Link>

        <button
          onClick={toggleCart}
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors relative"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-xs mt-1">Cart</span>
        </button>
      </div>
    </nav>
  );
}
```

**Add to Store Layout:**
```tsx
// app/store/[slug]/layout.tsx
export default function StoreLayout({ children, params }: Props) {
  return (
    <div className="flex flex-col min-h-screen pb-16 sm:pb-0">
      <StoreHeader />
      <main className="flex-1">
        {children}
      </main>
      <MobileBottomNav />
      <CartDrawer />
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Visible only on mobile (<768px)
- [ ] Fixed at bottom of viewport
- [ ] Safe area padding respected
- [ ] Active state highlighted
- [ ] Cart badge shows item count
- [ ] Smooth transitions between tabs
- [ ] Doesn't overlap content (padding-bottom on main)

---

### Phase 4: Mobile-Specific Features

#### 4.1 Pull-to-Refresh

**Requirements:**
- Implement pull-to-refresh for list pages
- Visual loading indicator
- Works with native scroll
- Smooth animation

**Pages to Add:**
- Products list (admin)
- Inventory list
- Orders list
- Customers list
- Product listings (storefront)

**Implementation (using react-refresh-library or custom):**
```tsx
// Example pattern
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

function ProductsPage() {
  const { ref } = usePullToRefresh(async () => {
    // Refetch data
    await refetch();
  });

  return (
    <div ref={ref} className="overflow-y-auto min-h-screen">
      {/* Content */}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Pull gesture triggers refresh
- [ ] Loading indicator visible
- [ ] Smooth animation (60fps)
- [ ] Works on all list pages
- [ ] Doesn't interfere with scroll

#### 4.2 Swipe Gestures (Future)

**Requirements:**
- Swipe to delete cart items
- Swipe actions for product cards
- Visual feedback during swipe
- Undo option for destructive actions

**Implementation:** Use use-gesture or react-swipeable

**Acceptance Criteria:**
- [ ] Swipe gestures work smoothly
- [ ] Visual feedback during swipe
- [ ] Undo option available
- [ ] Doesn't interfere with scroll

#### 4.3 Bottom Sheets for All Modals

**Requirements:**
- All modals use bottom sheet on mobile
- Swipe handle visible
- Swipe down to close
- Backdrop closes modal

**Modals to Update:**
- Stock adjustment modal
- Bulk import modal
- Category creation modal
- Any future modals

**Acceptance Criteria:**
- [ ] All modals bottom sheet on mobile
- [ ] Swipe handle visible
- [ ] Swipe down closes modal
- [ ] Smooth animation
- [ ] Backdrop closes modal

#### 4.4 Haptic/Visual Feedback

**Requirements:**
- Visual feedback on all touch interactions
- Scale animation on button press
- Ripple effect on tap (optional)
- Disabled states clear

**Implementation:**
```css
/* Touch feedback */
@media (hover: none) {
  .touch-feedback:active {
    transform: scale(0.97);
    opacity: 0.8;
  }
}
```

**Acceptance Criteria:**
- [ ] All buttons show visual feedback
- [ ] Scale animation on press
- [ ] Disabled states clearly visible
- [ ] Feedback instant (<100ms)

#### 4.5 Sticky Headers for Long Lists

**Requirements:**
- Sticky headers for data tables
- Shadow when scrolled
- Smooth transition

**Implementation:**
```tsx
<div className="sticky top-16 z-10 bg-background/95 backdrop-blur border-b">
  {/* Table header */}
</div>
```

**Acceptance Criteria:**
- [ ] Header sticks when scrolling
- [ ] Shadow appears when scrolled
- [ ] Smooth transition
- [ ] Doesn't overlap admin header

#### 4.6 Infinite Scroll (Optional)

**Requirements:**
- Load more items on scroll
- Loading indicator
- Error handling
- Optional: switch to pagination on desktop

**Pages:**
- Product listings (storefront)
- Orders list (admin)
- Customers list

**Acceptance Criteria:**
- [ ] Items load as user scrolls
- [ ] Loading indicator visible
- [ ] Errors handled gracefully
- [ ] Performance optimized

---

## Non-Functional Requirements

### Performance
- Lighthouse mobile performance score >90
- First Contentful Paint <1.5s
- Time to Interactive <3s
- No layout shift (CLS <0.1)
- Smooth animations (60fps)

### Accessibility
- WCAG 2.1 AA compliant
- Touch targets ≥44x44px
- Color contrast ≥4.5:1
- Screen reader compatible
- Keyboard navigation on desktop

### Browser Support
- iOS Safari 12+
- Chrome Mobile (Android)
- Firefox Mobile
- Samsung Internet
- Progressive enhancement for older browsers

### Device Testing
- iPhone SE (375px)
- iPhone 12/13 (390px)
- iPhone Pro Max (428px)
- Android Small (360px)
- Android Large (412px)
- Tablet (768px+)

---

## Testing Strategy

### Unit Testing
- Test all UI components with React Testing Library
- Test responsive behavior with viewport mocks
- Test touch interactions

### Integration Testing
- Test page layouts at different breakpoints
- Test user flows (browse → cart → checkout)
- Test mobile-specific features

### Visual Regression
- Screenshots at each breakpoint
- Compare component changes
- Test dark/light mode

### Manual Testing
- Real device testing
- Touch interaction testing
- Performance profiling
- Accessibility audit

---

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- Global styles and utilities
- Create all UI components (Button, Input, Card, Table, Modal, Badge)
- Component testing

### Phase 2: Admin Dashboard (Week 2)
- Admin Header improvements
- Dashboard responsive updates
- Products page (table → cards)
- Inventory page (table → cards)
- Product form optimization
- Other admin pages

### Phase 3: Storefront (Week 2-3)
- Store Header mobile menu
- Store Homepage hero fix
- Product Grid optimizations
- Cart Drawer improvements
- Checkout Form optimization
- Mobile Bottom Navigation

### Phase 4: Mobile Features (Week 3-4)
- Pull-to-refresh implementation
- Bottom sheets for all modals
- Touch feedback enhancements
- Sticky headers
- Swipe gestures (future)
- Infinite scroll (optional)

### Phase 5: Testing & Polish (Week 4)
- Device testing (375px, 390px, 428px, 360px)
- Accessibility audit
- Performance testing
- Cross-browser testing
- Bug fixes and refinements

---

## Risks & Mitigations

### Risk 1: Performance Degradation
- **Mitigation:** Optimize images, lazy load components, code split by route

### Risk 2: Inconsistent Mobile Experience
- **Mitigation:** Use reusable components, design system documentation

### Risk 3: Device-Specific Bugs
- **Mitigation:** Test on real devices, not just emulators

### Risk 4: Safari iOS Quirks
- **Mitigation:** Test thoroughly on iOS, use safe area insets

### Risk 5: Timeline Overrun
- **Mitigation:** Prioritize admin dashboard first, iterate on storefront

---

## Success Criteria

### Must Have (P0)
- [ ] All pages responsive at 375px minimum
- [ ] Touch targets ≥44x44px on all interactive elements
- [ ] Tables convert to cards on mobile
- [ ] No horizontal scroll on any page
- [ ] Lighthouse mobile score >90

### Should Have (P1)
- [ ] Mobile bottom navigation
- [ ] Bottom sheet modals
- [ ] Pull-to-refresh
- [ ] Touch feedback
- [ ] Safe area insets

### Nice to Have (P2)
- [ ] Swipe gestures
- [ ] Infinite scroll
- [ ] Haptic feedback
- [ ] Progressive Web App features

---

## Handoff & Documentation

### Developer Documentation
- Component storybook (optional)
- Responsive design guidelines
- Mobile testing checklist
- Design system documentation

### Design Assets
- Mobile mockups (375px, 390px, 428px)
- Component examples
- Interaction patterns
- Animation specs

### Training
- Mobile-first development workshop
- Component library walkthrough
- Testing best practices

---

## Appendices

### A: Component API Reference
(Full API documentation for all UI components)

### B: Responsive Patterns
(Common responsive patterns and examples)

### C: Testing Checklist
(Detailed mobile testing checklist)

### D: Device Matrix
(Device specifications and testing requirements)

---

**Document End**

*Next Steps:*
1. Review and approve this PRD
2. Create detailed task breakdown
3. Set up development environment
4. Begin Phase 1 implementation
