import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isPlatformAdmin, getOrgRole } from "./helpers/auth";
import { createOrderImpl } from "./helpers/orders";

/**
 * Atomic Order Creation (Checkout)
 */
export const create = mutation({
    args: {
        orgId: v.id("organizations"),
        items: v.array(v.object({
            variantId: v.id("productVariants"),
            quantity: v.number(),
        })),
        customerInfo: v.object({
            name: v.string(),
            email: v.string(),
            address: v.optional(v.string()),
            phone: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        // 1. Auth check
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        // For Manual Order Entry, require Admin access
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, args.orgId);
        if (!isPlatAdmin && orgRole !== "admin") {
            throw new Error("Unauthorized: Must be org admin to create manual orders");
        }

        // 2. Delegate to internal implementation
        return await createOrderImpl(ctx, {
            orgId: args.orgId,
            items: args.items,
            customerInfo: args.customerInfo,
            userId,
        });
    },
});

export const list = query({
    args: { orgId: v.id("organizations") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        // Auth
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, args.orgId);
        if (!isPlatAdmin && !orgRole) return [];

        return await ctx.db
            .query("orders")
            .withIndex("by_orgId", q => q.eq("orgId", args.orgId))
            .order("desc") // Newest first (by creation time usually implies order)
            .collect();
    }
});

export const get = query({
    args: { orderId: v.id("orders") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const order = await ctx.db.get(args.orderId);
        if (!order) return null;

        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, order.orgId);
        if (!isPlatAdmin && !orgRole) return null;

        const items = await ctx.db
            .query("orderItems")
            .withIndex("by_orderId", q => q.eq("orderId", args.orderId))
            .collect();

        return {
            ...order,
            items,
        };
    }
});

export const updateStatus = mutation({
    args: {
        orderId: v.id("orders"),
        status: v.union(
            v.literal("pending"),
            v.literal("paid"),
            v.literal("processing"),
            v.literal("shipped"),
            v.literal("delivered"),
            v.literal("cancelled"),
            v.literal("refunded")
        )
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const order = await ctx.db.get(args.orderId);
        if (!order) throw new Error("Order not found");

        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, order.orgId);
        if (!isPlatAdmin && orgRole !== "admin" && orgRole !== "manager") { // Managers too?
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.orderId, {
            status: args.status,
            updatedAt: Date.now(),
        });
    }
});
