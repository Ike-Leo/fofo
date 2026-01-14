import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isPlatformAdmin, getOrgRole } from "./helpers/auth";

/**
 * Adjust stock level for a variant
 * Atomic operation that updates the variant and logs the movement
 */
export const adjust = mutation({
    args: {
        variantId: v.id("productVariants"),
        type: v.union(
            v.literal("received"),
            v.literal("sold"),
            v.literal("adjusted"),
            v.literal("returned"),
            v.literal("audit")
        ),
        quantity: v.number(), // Delta (positive or negative)
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Get Variant
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
            throw new Error("Unauthorized: Must be organization admin");
        }

        // 4. Calculate new stock
        const newStock = variant.stockQuantity + args.quantity;

        if (newStock < 0) {
            throw new Error(`Insufficient stock. Current: ${variant.stockQuantity}, Requested change: ${args.quantity}`);
        }

        // 5. Update Variant
        await ctx.db.patch(variant._id, {
            stockQuantity: newStock,
        });

        // 6. Log Movement
        await ctx.db.insert("inventoryMovements", {
            orgId: variant.orgId,
            variantId: variant._id,
            productId: variant.productId,
            type: args.type,
            quantity: args.quantity,
            reason: args.reason,
            userId,
            createdAt: Date.now(),
        });

        return newStock;
    },
});

/**
 * List inventory for an organization
 * Returns flattened view of Product > Variant > Stock
 */
export const list = query({
    args: {
        orgId: v.id("organizations"),
        lowStockThreshold: v.optional(v.number()), // Filter for low stock
    },
    handler: async (ctx, args) => {
        // 1. Authentication
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // 2. Authorization
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, args.orgId);

        if (!isPlatAdmin && !orgRole) {
            return []; // Info disclosure prevention
        }

        // 3. Get all products (to display names/images)
        const products = await ctx.db
            .query("products")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .collect();

        // Map needed for fast lookup
        const productsMap = new Map(products.map(p => [p._id, p]));

        // 4. Get all variants? Or just iterate products?
        // Querying all variants for the org is better if we have many products
        // But we don't have a direct index on productVariants by orgId (wait, checking schema)
        // Schema has: .index("by_orgId_sku", ["orgId", "sku"]) - YES we do. (from Phase 2 code)
        // Wait, let me double check schema...
        // In Phase 2 review I saw: .index("by_orgId_sku", ["orgId", "sku"])
        // But let's verify if I can scan all by orgId using that index (prefix scan). Yes.

        const variants = await ctx.db
            .query("productVariants")
            .withIndex("by_orgId_sku", (q) => q.eq("orgId", args.orgId))
            .collect();

        // 5. Transform and Filter
        const inventoryItems = variants.map(variant => {
            const product = productsMap.get(variant.productId);
            return {
                _id: variant._id,
                productId: variant.productId,
                productName: product?.name ?? "Unknown Product",
                slug: product?.slug,
                sku: variant.sku,
                variantName: variant.name,
                stock: variant.stockQuantity,
                price: variant.price ?? product?.price,
                images: product?.images?.[0],
                isLowStock: variant.stockQuantity <= (args.lowStockThreshold ?? 10),
            };
        });

        // Apply Filter if requested
        if (args.lowStockThreshold !== undefined) {
            return inventoryItems.filter(item => item.isLowStock);
        }

        return inventoryItems.sort((a, b) => {
            // Sort by stock low to high by default for visibility
            return a.stock - b.stock;
        });
    },
});

/**
 * Get movement history for a variant
 */
export const getHistory = query({
    args: {
        variantId: v.id("productVariants"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // 1. Get Variant for auth context
        const variant = await ctx.db.get(args.variantId);
        if (!variant) return [];

        // 2. Auth
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, variant.orgId);

        if (!isPlatAdmin && !orgRole) return [];

        // 3. Query History
        const limit = args.limit ?? 50;
        const movements = await ctx.db
            .query("inventoryMovements")
            .withIndex("by_variantId", (q) => q.eq("variantId", args.variantId))
            .order("desc") // Newest first
            .take(limit);

        // 4. Enrich with User info (optional, would need user lookup)
        // For now, returning raw list. Frontend can fetch user if needed or we enrich here.
        // Let's enrich with user "name" or "email" if simple.

        const enriched = await Promise.all(movements.map(async (m) => {
            let performerName = "System";
            if (m.userId) {
                const user = await ctx.db.get(m.userId);
                // Safe access to potential user fields
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                performerName = (user as any)?.email ?? (user as any)?.name ?? "Unknown User";
            }
            return {
                ...m,
                performerName
            };
        }));

        return enriched;
    },
});
