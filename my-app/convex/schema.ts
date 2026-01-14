import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    plan: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("enterprise"),
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),
  organizationMembers: defineTable({
    orgId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("staff"),
    ),
    joinedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_orgId_userId", ["orgId", "userId"]),
  platformAdmins: defineTable({
    userId: v.id("users"),
    grantedAt: v.number(),
    grantedBy: v.optional(v.id("users")),
  }).index("by_userId", ["userId"]),

  // Phase 2: Product & Catalog Engine
  products: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    price: v.number(), // In cents to avoid floating-point issues
    compareAtPrice: v.optional(v.number()), // For showing discounts
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("archived")
    ),
    categoryId: v.optional(v.id("categories")),
    images: v.array(v.string()), // URLs
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_slug", ["orgId", "slug"])
    .index("by_orgId_status", ["orgId", "status"]),

  productVariants: defineTable({
    productId: v.id("products"),
    orgId: v.id("organizations"), // Denormalized for efficient queries
    sku: v.string(),
    name: v.string(), // e.g., "Large / Blue"
    price: v.optional(v.number()), // Override product price if set
    stockQuantity: v.number(),
    options: v.object({
      size: v.optional(v.string()),
      color: v.optional(v.string()),
      material: v.optional(v.string()),
      custom: v.optional(v.string()),
    }),
    isDefault: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_productId", ["productId"])
    .index("by_orgId_sku", ["orgId", "sku"]),

  categories: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    slug: v.string(),
    parentId: v.optional(v.id("categories")), // For nested categories
    position: v.number(), // For ordering
    createdAt: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_slug", ["orgId", "slug"])
    .index("by_parentId", ["parentId"]),

  inventoryMovements: defineTable({
    orgId: v.id("organizations"),
    variantId: v.id("productVariants"),
    productId: v.id("products"),
    type: v.union(
      v.literal("received"),
      v.literal("sold"),
      v.literal("adjusted"),
      v.literal("returned"),
      v.literal("audit")
    ),
    quantity: v.number(), // Can be positive (add) or negative (remove)
    reason: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_variantId", ["variantId"]) // For history
    .index("by_productId", ["productId"]), // For product-level history

  orders: defineTable({
    orgId: v.id("organizations"),
    orderNumber: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    totalAmount: v.number(),
    customerInfo: v.object({
      name: v.string(),
      email: v.string(),
      address: v.optional(v.string()),
      phone: v.optional(v.string()),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_status", ["orgId", "status"])
    .index("by_orgId_createdAt", ["orgId", "createdAt"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    variantId: v.id("productVariants"),
    productName: v.string(),
    variantName: v.string(),
    quantity: v.number(),
    price: v.number(),
  })
    .index("by_orderId", ["orderId"]),

  customers: defineTable({
    orgId: v.id("organizations"),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    totalOrders: v.number(),
    totalSpend: v.number(),
    lastSeenAt: v.number(),
    firstSeenAt: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_email", ["orgId", "email"])
    .index("by_orgId_spend", ["orgId", "totalSpend"]),

  // Phase 6: Public Storefront API
  carts: defineTable({
    orgId: v.id("organizations"),
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("abandoned")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"]) // Fast lookup by session
    .index("by_orgId_sessionId", ["orgId", "sessionId"]),

  cartItems: defineTable({
    cartId: v.id("carts"),
    productId: v.id("products"),
    variantId: v.id("productVariants"),
    quantity: v.number(),
  })
    .index("by_cartId", ["cartId"])
    .index("by_cartId_variantId", ["cartId", "variantId"]),
});
