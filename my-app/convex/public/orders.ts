import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * PUBLIC API - No authentication required
 * Order status lookup for customers (requires email verification).
 */

/**
 * Get order status by order number and email
 * Public query - requires email match for security
 */
export const getStatus = query({
    args: {
        orgSlug: v.string(),
        orderNumber: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Find organization by slug
        const org = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.orgSlug))
            .first();

        if (!org || !org.isActive) {
            return null;
        }

        // 2. Find order by org and order number
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_orgId", (q) => q.eq("orgId", org._id))
            .filter((q) => q.eq(q.field("orderNumber"), args.orderNumber))
            .collect();

        const order = orders[0];

        if (!order) {
            return null;
        }

        // 3. Validate email matches (case-insensitive)
        if (order.customerInfo.email.toLowerCase() !== args.email.toLowerCase()) {
            return null; // Don't reveal that order exists if email doesn't match
        }

        // 4. Get order items
        const orderItems = await ctx.db
            .query("orderItems")
            .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
            .collect();

        // 5. Return order status with safe fields
        return {
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items: orderItems.map((item) => ({
                productName: item.productName,
                variantName: item.variantName,
                quantity: item.quantity,
                price: item.price,
            })),
        };
    },
});

/**
 * Type definitions for public order API
 */
export type PublicOrderStatus = {
    orderNumber: string;
    status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    totalAmount: number;
    createdAt: number;
    updatedAt: number;
    items: {
        productName: string;
        variantName: string;
        quantity: number;
        price: number;
    }[];
};
