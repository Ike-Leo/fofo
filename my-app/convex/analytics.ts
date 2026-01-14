import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isPlatformAdmin, getOrgRole } from "./helpers/auth";

export const getDashboardStats = query({
    args: { orgId: v.id("organizations") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, args.orgId);
        if (!isPlatAdmin && !orgRole) return null;

        // 1. Revenue & Orders
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_orgId", q => q.eq("orgId", args.orgId))
            .collect();

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => {
            if (["paid", "processing", "shipped", "delivered"].includes(order.status as string)) {
                return sum + order.totalAmount;
            }
            return sum;
        }, 0);

        // 2. Customers
        const customers = await ctx.db
            .query("customers")
            .withIndex("by_orgId", q => q.eq("orgId", args.orgId))
            .collect();
        const totalCustomers = customers.length;

        // 3. Products
        const products = await ctx.db
            .query("products")
            .withIndex("by_orgId", q => q.eq("orgId", args.orgId))
            .collect();
        const totalProducts = products.length;

        // 4. Low Stock
        const variants = await ctx.db
            .query("productVariants")
            .withIndex("by_orgId_sku", q => q.eq("orgId", args.orgId))
            .collect();

        const lowStockCount = variants.filter(v => v.stockQuantity <= 10).length;

        return {
            totalRevenue,
            totalOrders,
            totalCustomers,
            totalProducts,
            lowStockCount
        };
    }
});

export const getSalesChart = query({
    args: { orgId: v.id("organizations") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, args.orgId);
        if (!isPlatAdmin && !orgRole) return [];

        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        const orders = await ctx.db
            .query("orders")
            .withIndex("by_orgId_createdAt", q =>
                q.eq("orgId", args.orgId).gte("createdAt", thirtyDaysAgo)
            )
            .collect();

        // Bucket by date
        const salesByDate: Record<string, number> = {};

        // Initialize last 30 days with 0
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            salesByDate[dateStr] = 0;
        }

        for (const order of orders) {
            if (["paid", "processing", "shipped", "delivered"].includes(order.status as string)) {
                const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
                if (salesByDate[dateStr] !== undefined) {
                    salesByDate[dateStr] += (order.totalAmount / 100); // Dollars
                }
            }
        }

        return Object.entries(salesByDate)
            .map(([date, revenue]) => ({ date, revenue }))
            // Sort ascending by date
            .sort((a, b) => a.date.localeCompare(b.date));
    }
});
