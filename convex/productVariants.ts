import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isPlatformAdmin, getOrgRole } from "./helpers/auth";

/**
 * Create a product variant
 * Requires org admin or platform admin
 */
export const create = mutation({
    args: {
        productId: v.id("products"),
        sku: v.string(),
        name: v.string(),
        price: v.optional(v.number()),
        stockQuantity: v.optional(v.number()),
        options: v.optional(v.object({
            size: v.optional(v.string()),
            color: v.optional(v.string()),
            material: v.optional(v.string()),
            custom: v.optional(v.string()),
        })),
        isDefault: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        // 1. Verify product exists
        const product = await ctx.db.get(args.productId);
        if (!product) {
            throw new Error("Product not found");
        }

        // 2. Authentication
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // 3. Authorization
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, product.orgId);

        if (!isPlatAdmin && orgRole !== "admin") {
            throw new Error("Unauthorized: Must be organization admin or platform admin");
        }

        // 4. Validate SKU
        const trimmedSku = args.sku.trim().toUpperCase();
        if (trimmedSku.length === 0) {
            throw new Error("SKU cannot be empty");
        }
        if (trimmedSku.length > 50) {
            throw new Error("SKU cannot exceed 50 characters");
        }

        // Check SKU uniqueness within org
        const existingVariant = await ctx.db
            .query("productVariants")
            .withIndex("by_orgId_sku", (q) =>
                q.eq("orgId", product.orgId).eq("sku", trimmedSku)
            )
            .first();

        if (existingVariant) {
            throw new Error(`SKU '${trimmedSku}' already exists in this organization`);
        }

        // 5. Validate name
        const trimmedName = args.name.trim();
        if (trimmedName.length === 0) {
            throw new Error("Variant name cannot be empty");
        }

        // 5b. Validate price if provided
        if (args.price !== undefined && args.price < 0) {
            throw new Error("Price cannot be negative");
        }

        // 5c. Validate stockQuantity if provided
        if (args.stockQuantity !== undefined && args.stockQuantity < 0) {
            throw new Error("Stock quantity cannot be negative");
        }

        // 6. Check if this should be default
        const existingVariants = await ctx.db
            .query("productVariants")
            .withIndex("by_productId", (q) => q.eq("productId", args.productId))
            .collect();

        // First variant is automatically default
        const isDefault = args.isDefault ?? existingVariants.length === 0;

        // If setting as default, unset other defaults
        if (isDefault) {
            for (const variant of existingVariants) {
                if (variant.isDefault) {
                    await ctx.db.patch(variant._id, { isDefault: false });
                }
            }
        }

        // 7. Create variant
        const variantId = await ctx.db.insert("productVariants", {
            productId: args.productId,
            orgId: product.orgId, // Denormalized
            sku: trimmedSku,
            name: trimmedName,
            price: args.price,
            stockQuantity: args.stockQuantity ?? 0,
            options: args.options ?? {},
            isDefault,
            createdAt: Date.now(),
        });

        return variantId;
    },
});

/**
 * Update a product variant
 * Requires org admin or platform admin
 */
export const update = mutation({
    args: {
        variantId: v.id("productVariants"),
        sku: v.optional(v.string()),
        name: v.optional(v.string()),
        price: v.optional(v.number()),
        stockQuantity: v.optional(v.number()),
        options: v.optional(v.object({
            size: v.optional(v.string()),
            color: v.optional(v.string()),
            material: v.optional(v.string()),
            custom: v.optional(v.string()),
        })),
        isDefault: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        // 1. Get variant
        const variant = await ctx.db.get(args.variantId);
        if (!variant) {
            throw new Error("Variant not found");
        }

        // 2. Authentication
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // 3. Authorization
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, variant.orgId);

        if (!isPlatAdmin && orgRole !== "admin") {
            throw new Error("Unauthorized: Must be organization admin or platform admin");
        }

        // 4. Build updates
        const updates: Record<string, unknown> = {};

        if (args.sku !== undefined) {
            const trimmedSku = args.sku.trim().toUpperCase();
            if (trimmedSku.length === 0) {
                throw new Error("SKU cannot be empty");
            }

            // Check uniqueness if changed
            if (trimmedSku !== variant.sku) {
                const existing = await ctx.db
                    .query("productVariants")
                    .withIndex("by_orgId_sku", (q) =>
                        q.eq("orgId", variant.orgId).eq("sku", trimmedSku)
                    )
                    .first();
                if (existing) {
                    throw new Error(`SKU '${trimmedSku}' already exists`);
                }
            }
            updates.sku = trimmedSku;
        }

        if (args.name !== undefined) {
            const trimmedName = args.name.trim();
            if (trimmedName.length === 0) {
                throw new Error("Name cannot be empty");
            }
            updates.name = trimmedName;
        }

        if (args.price !== undefined) {
            if (args.price < 0) throw new Error("Price cannot be negative");
            updates.price = args.price;
        }

        if (args.stockQuantity !== undefined) {
            if (args.stockQuantity < 0) throw new Error("Stock quantity cannot be negative");
            updates.stockQuantity = args.stockQuantity;
        }

        if (args.options !== undefined) {
            updates.options = args.options;
        }

        // Handle isDefault
        if (args.isDefault !== undefined) {
            if (args.isDefault && !variant.isDefault) {
                // Unset other defaults
                const otherVariants = await ctx.db
                    .query("productVariants")
                    .withIndex("by_productId", (q) => q.eq("productId", variant.productId))
                    .collect();

                for (const v of otherVariants) {
                    if (v.isDefault && v._id !== args.variantId) {
                        await ctx.db.patch(v._id, { isDefault: false });
                    }
                }
            }
            updates.isDefault = args.isDefault;
        }

        // 5. Apply updates
        if (Object.keys(updates).length > 0) {
            await ctx.db.patch(args.variantId, updates);
        }
    },
});

/**
 * Delete a product variant
 * Requires org admin or platform admin
 */
export const remove = mutation({
    args: {
        variantId: v.id("productVariants"),
    },
    handler: async (ctx, args) => {
        // 1. Get variant
        const variant = await ctx.db.get(args.variantId);
        if (!variant) {
            throw new Error("Variant not found");
        }

        // 2. Authentication
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // 3. Authorization
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, variant.orgId);

        if (!isPlatAdmin && orgRole !== "admin") {
            throw new Error("Unauthorized: Must be organization admin or platform admin");
        }

        // 4. Check if product is active and this is the last variant
        const product = await ctx.db.get(variant.productId);
        if (product?.status === "active") {
            const allVariants = await ctx.db
                .query("productVariants")
                .withIndex("by_productId", (q) => q.eq("productId", variant.productId))
                .collect();

            if (allVariants.length <= 1) {
                throw new Error("Cannot delete the last variant of an active product");
            }
        }

        // 5. If this was default, set another as default
        if (variant.isDefault) {
            const otherVariants = await ctx.db
                .query("productVariants")
                .withIndex("by_productId", (q) => q.eq("productId", variant.productId))
                .collect();

            const newDefault = otherVariants.find(v => v._id !== args.variantId);
            if (newDefault) {
                await ctx.db.patch(newDefault._id, { isDefault: true });
            }
        }

        // 6. Delete variant
        await ctx.db.delete(args.variantId);
    },
});

/**
 * List variants for a product
 */
export const listByProduct = query({
    args: {
        productId: v.id("products"),
    },
    handler: async (ctx, args) => {
        // 1. Authentication FIRST
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // 2. Get product for auth check
        const product = await ctx.db.get(args.productId);
        if (!product) {
            return [];
        }

        // 3. Authorization
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, product.orgId);

        if (!isPlatAdmin && !orgRole) {
            return []; // Don't reveal existence
        }

        // 4. Return variants
        return await ctx.db
            .query("productVariants")
            .withIndex("by_productId", (q) => q.eq("productId", args.productId))
            .collect();
    },
});
