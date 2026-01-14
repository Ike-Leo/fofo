import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isPlatformAdmin, getOrgRole } from "./helpers/auth";

/**
 * List all customers for an organization, sorted by totalSpend descending.
 * Supports optional search by email or name.
 */
export const list = query({
    args: {
        orgId: v.id("organizations"),
        search: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, args.orgId);
        if (!isPlatAdmin && !orgRole) return [];

        let customers = await ctx.db
            .query("customers")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .collect();

        // Apply search filter if provided
        if (args.search && args.search.trim()) {
            const searchLower = args.search.toLowerCase().trim();
            customers = customers.filter(
                (c) =>
                    c.email.toLowerCase().includes(searchLower) ||
                    c.name.toLowerCase().includes(searchLower)
            );
        }

        // Sort by totalSpend descending (VIP customers first)
        customers.sort((a, b) => b.totalSpend - a.totalSpend);

        return customers;
    },
});

/**
 * Get a single customer with their order history.
 */
export const get = query({
    args: {
        customerId: v.id("customers"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const customer = await ctx.db.get(args.customerId);
        if (!customer) return null;

        // Verify access
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, customer.orgId);
        if (!isPlatAdmin && !orgRole) return null;

        // Fetch customer's orders
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_orgId", (q) => q.eq("orgId", customer.orgId))
            .collect();

        // Filter orders by customer email (since orders store customerInfo)
        const customerOrders = orders
            .filter((order) => order.customerInfo.email === customer.email)
            .sort((a, b) => b.createdAt - a.createdAt);

        return {
            ...customer,
            orders: customerOrders,
        };
    },
});
