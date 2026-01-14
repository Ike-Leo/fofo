import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("productActivities")
      .withIndex("by_productId_createdAt", (q) =>
        q.eq("productId", args.productId)
      )
      .take(100);

    // Fetch user info for each activity
    const activitiesWithUsers = await Promise.all(
      activities.map(async (activity) => {
        let userName = "System";
        if (activity.userId) {
          const user = await ctx.db.get(activity.userId);
          if (user) {
            userName = user.name || user.email || "Unknown User";
          }
        }
        return {
          ...activity,
          userName,
        };
      })
    );

    // Sort by createdAt descending
    return activitiesWithUsers.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const logActivity = mutation({
  args: {
    productId: v.id("products"),
    orgId: v.id("organizations"),
    type: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("stock_added"),
      v.literal("stock_removed"),
      v.literal("sold"),
      v.literal("cancelled"),
      v.literal("archived")
    ),
    description: v.string(),
    metadata: v.optional(
      v.object({
        variantId: v.optional(v.id("productVariants")),
        variantName: v.optional(v.string()),
        quantity: v.optional(v.number()),
        orderId: v.optional(v.id("orders")),
        orderNumber: v.optional(v.string()),
        changes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    await ctx.db.insert("productActivities", {
      orgId: args.orgId,
      productId: args.productId,
      type: args.type,
      description: args.description,
      userId: userId ?? undefined,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});
