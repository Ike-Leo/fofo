# Phase 8: UX Enhancement & Advanced Features PRD

**Status:** Approved  
**Version:** 1.0  
**Date:** January 14, 2026  

---

## Overview

Phase 8 focuses on improving user experience across the admin dashboard, adding advanced product management features, enhancing order workflows, implementing customer analytics, and introducing communication and access control systems.

## Goals

1. Improve dashboard interactivity with clickable KPIs and customer notices
2. Enhance product management with better variant UI, bulk import, and activity logging
3. Streamline order management with repeat orders, customer auto-suggest, and inline editing
4. Add customer analytics and profile action buttons
5. Implement real-time chat for employees and customer support
6. Create granular permission system for organization admins

---

## User Stories

### 8.1 Dashboard Enhancements

| ID | Title | Priority | Effort |
|----|-------|----------|--------|
| US-801 | Dashboard KPI Cards Clickable | P1 | Low |
| US-802 | Customer Reviews/Notices Widget | P2 | Medium |

### 8.2 Product Management

| ID | Title | Priority | Effort |
|----|-------|----------|--------|
| US-803 | Variant Section UI Optimization | P3 | Medium |
| US-804 | Categories CRUD Page | P3 | Medium |
| US-805 | Product Images (up to 6) | P2 | Medium |
| US-806 | Bulk Product Import | P3 | High |
| US-816 | Product Activity Log | P3 | Medium |

### 8.3 Order Management

| ID | Title | Priority | Effort |
|----|-------|----------|--------|
| US-807 | Clickable Order Fields | P1 | Low |
| US-808 | Manual Order Phone Number | P1 | Low |
| US-809 | Payment Status UI Fix | P1 | Low |
| US-810 | Repeat Order & Create Another | P2 | Medium |
| US-814 | Customer Auto-Suggest | P2 | Medium |

### 8.4 Customer Management

| ID | Title | Priority | Effort |
|----|-------|----------|--------|
| US-811 | Top Customers Analytics | P2 | Medium |
| US-815 | Customer Profile Actions | P2 | Low |

### 8.5 Communication

| ID | Title | Priority | Effort |
|----|-------|----------|--------|
| US-812 | Chat System (Employee + Support) | P4 | High |

### 8.6 Access Control

| ID | Title | Priority | Effort |
|----|-------|----------|--------|
| US-813 | Granular Permissions System | P4 | High |

---

## Technical Requirements

### Schema Changes

```typescript
// New Tables
productActivities: defineTable({
  orgId: v.id("organizations"),
  productId: v.id("products"),
  variantId: v.optional(v.id("productVariants")),
  activityType: v.union(
    v.literal("created"),
    v.literal("updated"),
    v.literal("stock_added"),
    v.literal("stock_removed"),
    v.literal("sold"),
    v.literal("cancelled"),
    v.literal("archived"),
    v.literal("restored")
  ),
  details: v.optional(v.string()),
  quantity: v.optional(v.number()),
  userId: v.optional(v.id("users")),
  orderId: v.optional(v.id("orders")),
  createdAt: v.number(),
}).index("by_productId", ["productId"])
  .index("by_orgId", ["orgId"])

conversations: defineTable({
  orgId: v.id("organizations"),
  type: v.union(v.literal("internal"), v.literal("support")),
  participants: v.array(v.id("users")),
  customerId: v.optional(v.id("customers")),
  lastMessageAt: v.number(),
  createdAt: v.number(),
}).index("by_orgId", ["orgId"])
  .index("by_customerId", ["customerId"])

messages: defineTable({
  conversationId: v.id("conversations"),
  senderId: v.id("users"),
  senderType: v.union(v.literal("user"), v.literal("customer")),
  content: v.string(),
  createdAt: v.number(),
}).index("by_conversationId", ["conversationId"])

// Modified Tables
organizationMembers: // Add permissions: v.optional(v.array(v.string()))
```

### New Pages

- `/admin/categories` - Category management
- `/admin/chat` - Chat interface
- `/admin/team` - Team & permissions management

### New Components

- `CustomerReviews.tsx` - Dashboard widget
- `BulkImport.tsx` - CSV/Excel import
- `ProductActivityLog.tsx` - Timeline view
- `TopCustomers.tsx` - Analytics widget
- `ChatWindow.tsx` - Reusable chat
- `PermissionEditor.tsx` - Permission grid

### New Convex Modules

- `productActivities.ts` - Activity logging
- `chat.ts` - Chat operations
- `permissions.ts` - Access control

---

## Implementation Order

### Sprint 1: Critical UX (P1)
1. Make order/customer/product fields clickable
2. Add phone number to manual orders
3. Fix payment status immediate update
4. Make dashboard KPI cards clickable

### Sprint 2: High-Value Enhancements (P2)
1. Customer auto-suggest in orders
2. Top customers analytics widget
3. Repeat order functionality
4. Customer profile action buttons
5. Product images (up to 6)

### Sprint 3: Product Management (P3)
1. Variant section UI redesign
2. Categories CRUD page
3. Product activity log
4. Bulk import system

### Sprint 4: Advanced Systems (P4)
1. Chat infrastructure (schema, backend)
2. Chat UI (conversations, messages)
3. Permissions system (schema, backend)
4. Team management UI

---

## Acceptance Criteria Summary

- All table fields are clickable and navigate correctly
- Manual orders include phone number field
- Payment status updates in real-time
- Products support up to 6 images
- Bulk import handles 100+ products
- Chat messages appear in real-time
- Permissions restrict access correctly

---

## Files Reference

See `prd.json` for complete user story details and `implementation_plan.md` for file-level changes.
